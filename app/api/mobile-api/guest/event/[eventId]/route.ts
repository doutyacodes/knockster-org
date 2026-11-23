import { NextRequest } from 'next/server';
import { eq, and, inArray, isNull, asc, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { guestInvitation, invitationScanEvent } from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { createdByPayload } from '@/lib/creator-role';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api-response';
import { toIST } from '@/lib/timezone';
import { deriveInvitationStatus } from '@/lib/invitation-status';
import {
  zuppdateEvents,
  zuppdateEventCreatorContext,
  zuppdateEventSecurity,
  zuppdateEventDays,
  zuppdateActivities,
  zuppdateEventCoupons,
  zuppdateEventCouponGrants,
} from '@/db/zuppdate-schema';

/**
 * GET /api/mobile-api/guest/event/[eventId]
 *
 * One event, as the guest holding a pass for it should see it: what it is, who
 * put it on and under which hat, the itinerary, their own pass and perks, and
 * how many people are inside.
 *
 * ACCESS: only a guest who actually holds a non-revoked pass for this event.
 * Without that check this would be an unauthenticated read of any event's
 * schedule by id, and the arrival count would leak attendance for events the
 * caller has nothing to do with.
 *
 * PRIVACY: the arrival count is a number and never a list of names. That was a
 * deliberate decision when the gate was built and it holds here — a guest may
 * know how full a room is, never who is in it.
 *
 * ZUPPGATE ALONE: every Zuppdate table read here is joined leniently and the
 * route 404s rather than throwing when an event is missing, so a Zuppgate
 * deployment whose database carries no Zuppdate events keeps working; the
 * guest app simply never links here.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }
    const { id: guestId, role } = authResult.payload;
    if (role !== 'guest') {
      return unauthorizedResponse('Unauthorized');
    }

    const { eventId } = await params;

    // The caller's own pass for this event. This is the authorization: no pass,
    // no event.
    const [pass] = await db
      .select({
        id: guestInvitation.id,
        status: guestInvitation.status,
        securityLevel: guestInvitation.requestedSecurityLevel,
        validFrom: guestInvitation.validFrom,
        validTo: guestInvitation.validTo,
        createdAt: guestInvitation.createdAt,
      })
      .from(guestInvitation)
      .where(and(eq(guestInvitation.guestId, guestId), eq(guestInvitation.eventId, eventId)))
      // Newest first so a reissued pass wins, and a live one is preferred over
      // a revoked one -- the same ordering getGuestGateView uses. A revoked
      // pass still resolves, because being told you were revoked is the point.
      .orderBy(sql`${guestInvitation.status} = 'revoked' ASC`, desc(guestInvitation.createdAt))
      .limit(1);

    if (!pass) {
      return errorResponse('You do not have a pass for this event', 403);
    }

    const [event] = await db
      .select({
        id: zuppdateEvents.id,
        name: zuppdateEvents.name,
        description: zuppdateEvents.description,
        slug: zuppdateEvents.publicSlug,
        type: zuppdateEvents.eventType,
        location: zuppdateEvents.location,
        startDate: zuppdateEvents.startDate,
        endDate: zuppdateEvents.endDate,
        status: zuppdateEvents.status,
        creatorRole: zuppdateEventCreatorContext.role,
        creatorName: zuppdateEventCreatorContext.displayName,
        securityLevel: zuppdateEventSecurity.securityLevel,
        gateEnabled: zuppdateEventSecurity.isEnabled,
      })
      .from(zuppdateEvents)
      .leftJoin(
        zuppdateEventCreatorContext,
        eq(zuppdateEvents.id, zuppdateEventCreatorContext.eventId)
      )
      .leftJoin(zuppdateEventSecurity, eq(zuppdateEvents.id, zuppdateEventSecurity.eventId))
      .where(eq(zuppdateEvents.id, eventId))
      .limit(1);

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    // Itinerary. Top-level activities only: the app shows the running order,
    // and sub/micro activities belong to the organiser's own workspace.
    const days = await db
      .select({
        id: zuppdateEventDays.id,
        date: zuppdateEventDays.date,
        dayIndex: zuppdateEventDays.dayIndex,
        label: zuppdateEventDays.label,
      })
      .from(zuppdateEventDays)
      .where(eq(zuppdateEventDays.eventId, eventId))
      .orderBy(asc(zuppdateEventDays.dayIndex));

    const activities = days.length
      ? await db
          .select({
            id: zuppdateActivities.id,
            dayId: zuppdateActivities.dayId,
            title: zuppdateActivities.title,
            startTime: zuppdateActivities.startTime,
            durationMinutes: zuppdateActivities.durationMinutes,
            extendMinutes: zuppdateActivities.extendMinutes,
            delayMinutes: zuppdateActivities.delayMinutes,
            location: zuppdateActivities.location,
            status: zuppdateActivities.status,
            isTimeBound: zuppdateActivities.isTimeBound,
            order: zuppdateActivities.order,
          })
          .from(zuppdateActivities)
          .where(
            and(
              inArray(
                zuppdateActivities.dayId,
                days.map((d) => d.id)
              ),
              isNull(zuppdateActivities.parentId)
            )
          )
          .orderBy(asc(zuppdateActivities.order))
      : [];

    // The caller's perks on this pass.
    const grants = await db
      .select({
        grantId: zuppdateEventCouponGrants.id,
        usedCount: zuppdateEventCouponGrants.usedCount,
        title: zuppdateEventCoupons.title,
        description: zuppdateEventCoupons.description,
        maxUses: zuppdateEventCoupons.maxUses,
        validFrom: zuppdateEventCoupons.validFrom,
        validTo: zuppdateEventCoupons.validTo,
      })
      .from(zuppdateEventCouponGrants)
      .innerJoin(
        zuppdateEventCoupons,
        eq(zuppdateEventCouponGrants.couponId, zuppdateEventCoupons.id)
      )
      .where(
        and(
          eq(zuppdateEventCouponGrants.invitationId, pass.id),
          eq(zuppdateEventCoupons.isActive, true)
        )
      );

    // How many people are inside: distinct guests with a successful scan, not
    // scan rows, so one person re-scanning is still one arrival.
    const allPasses = await db
      .select({ id: guestInvitation.id, guestId: guestInvitation.guestId })
      .from(guestInvitation)
      .where(eq(guestInvitation.eventId, eventId));

    let arrivedCount = 0;
    let myEntryAt: Date | null = null;
    if (allPasses.length) {
      const scans = await db
        .select({
          invitationId: invitationScanEvent.invitationId,
          timestamp: invitationScanEvent.timestamp,
        })
        .from(invitationScanEvent)
        .where(
          and(
            inArray(
              invitationScanEvent.invitationId,
              allPasses.map((p) => p.id)
            ),
            eq(invitationScanEvent.success, true)
          )
        );

      const byInvitation = new Map(allPasses.map((p) => [p.id, p.guestId]));
      const arrivedGuests = new Set<string>();
      for (const s of scans) {
        const g = byInvitation.get(s.invitationId);
        if (g) arrivedGuests.add(g);
        if (s.invitationId === pass.id) {
          if (!myEntryAt || s.timestamp < myEntryAt) myEntryAt = s.timestamp;
        }
      }
      arrivedCount = arrivedGuests.size;
    }

    const derived = deriveInvitationStatus(pass.status, pass.validFrom, pass.validTo);

    // A revoked guest is told they are revoked and nothing more. They keep no
    // perks -- that is already how scan-coupon behaves -- and they do not keep
    // a live window onto who is inside.
    const revoked = derived === 'revoked';

    return successResponse({
      event: {
        id: event.id,
        name: event.name,
        description: event.description,
        slug: event.slug,
        type: event.type,
        location: event.location,
        // Wall-clock values: sent as written, NOT through toIST(). See the note
        // on zuppdateEventDays in db/zuppdate-schema.ts.
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        createdBy: createdByPayload(event.creatorRole, event.creatorName),
        gate: event.gateEnabled
          ? { enabled: true, securityLevel: event.securityLevel }
          : { enabled: false, securityLevel: null },
      },
      schedule: days.map((d) => ({
        id: d.id,
        label: d.label,
        dayIndex: d.dayIndex,
        date: d.date,
        activities: activities
          .filter((a) => a.dayId === d.id)
          .map((a) => ({
            id: a.id,
            title: a.title,
            startTime: a.startTime,
            durationMinutes: a.durationMinutes + (a.extendMinutes ?? 0),
            location: a.location,
            status: a.status,
            isTimeBound: a.isTimeBound,
          })),
      })),
      myPass: {
        invitationId: pass.id,
        status: derived,
        securityLevel: pass.securityLevel,
        // Zuppgate's own timestamps ARE real instants, so these do convert.
        issuedAt: toIST(pass.createdAt),
        validFrom: toIST(pass.validFrom),
        validTo: toIST(pass.validTo),
        enteredAt: myEntryAt ? toIST(myEntryAt) : null,
      },
      coupons: revoked ? [] : grants.map((g) => ({
        grantId: g.grantId,
        title: g.title,
        description: g.description,
        usedCount: g.usedCount,
        maxUses: g.maxUses,
        remaining: Math.max(0, g.maxUses - g.usedCount),
        validFrom: g.validFrom,
        validTo: g.validTo,
      })),
      // A count, never names -- and withheld entirely from a revoked pass.
      arrivedCount: revoked ? null : arrivedCount,
    });
  } catch (error) {
    console.error('Guest event detail failed:', error);
    return serverErrorResponse('Failed to load event');
  }
}
