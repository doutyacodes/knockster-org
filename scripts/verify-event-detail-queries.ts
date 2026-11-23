/**
 * Read-only check that the Zuppdate table mirrors in db/zuppdate-schema.ts
 * actually match the database.
 *
 * These mirrors are hand-written partial declarations, deliberately invisible to
 * drizzle-kit, so nothing verifies them at build time: a mistyped column name
 * compiles fine and fails at the gate. This runs every SELECT the guest event
 * detail endpoint issues, against real rows, and writes nothing.
 */
import { eq, and, inArray, isNull, asc } from 'drizzle-orm';
import { db } from '@/db';
import { guestInvitation, invitationScanEvent } from '@/db/schema';
import {
  zuppdateEvents,
  zuppdateEventCreatorContext,
  zuppdateEventSecurity,
  zuppdateEventDays,
  zuppdateActivities,
  zuppdateEventCoupons,
  zuppdateEventCouponGrants,
} from '@/db/zuppdate-schema';

let pass = 0,
  fail = 0;
function check(label: string, cond: boolean, detail = '') {
  if (cond) {
    console.log(`  PASS  ${label}`);
    pass++;
  } else {
    console.log(`  FAIL  ${label}${detail ? ` -- ${detail}` : ''}`);
    fail++;
  }
}
async function ran<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    const r = await fn();
    check(label, true);
    return r;
  } catch (e) {
    check(label, false, (e as Error).message.split('\n')[0]);
    return null;
  }
}

(async () => {
  console.log('\n[1] The event row, with its hat and its gate');
  const events = await ran('events + creator context + security join', () =>
    db
      .select({
        id: zuppdateEvents.id,
        name: zuppdateEvents.name,
        slug: zuppdateEvents.publicSlug,
        type: zuppdateEvents.eventType,
        location: zuppdateEvents.location,
        startDate: zuppdateEvents.startDate,
        status: zuppdateEvents.status,
        creatorRole: zuppdateEventCreatorContext.role,
        creatorName: zuppdateEventCreatorContext.displayName,
        gateEnabled: zuppdateEventSecurity.isEnabled,
        securityLevel: zuppdateEventSecurity.securityLevel,
      })
      .from(zuppdateEvents)
      .leftJoin(
        zuppdateEventCreatorContext,
        eq(zuppdateEvents.id, zuppdateEventCreatorContext.eventId)
      )
      // Inner-joined and filtered: the point is to exercise the rest of the
      // queries against an event that HAS a gate. An unfiltered page of events
      // is in arbitrary order and simply missed them.
      .innerJoin(zuppdateEventSecurity, eq(zuppdateEvents.id, zuppdateEventSecurity.eventId))
      .where(eq(zuppdateEventSecurity.isEnabled, true))
      .limit(20)
  );
  if (events?.length) {
    console.log(`        ${events.length} event(s) read`);
    for (const e of events.filter((x) => x.gateEnabled)) {
      console.log(
        `        gated: ${e.name} (L${e.securityLevel})  hat: ${e.creatorRole ?? 'personal'}${
          e.creatorName ? ` / ${e.creatorName}` : ''
        }`
      );
    }
  }

  const gated = events?.find((e) => e.gateEnabled);
  check('at least one gated event exists to exercise the rest', !!gated);
  const eventId = gated?.id;

  console.log('\n[2] The itinerary');
  const days = eventId
    ? await ran('event_days by eventId', () =>
        db
          .select({
            id: zuppdateEventDays.id,
            date: zuppdateEventDays.date,
            dayIndex: zuppdateEventDays.dayIndex,
            label: zuppdateEventDays.label,
          })
          .from(zuppdateEventDays)
          .where(eq(zuppdateEventDays.eventId, eventId))
          .orderBy(asc(zuppdateEventDays.dayIndex))
      )
    : null;
  console.log(`        ${days?.length ?? 0} day(s)`);

  if (days?.length) {
    const acts = await ran('activities: top-level only, ordered', () =>
      db
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
    );
    console.log(`        ${acts?.length ?? 0} activity(ies)`);
    if (acts?.length) {
      const a = acts[0];
      // Wall clock: the stored value IS the clock face. 09:00 must read as 09:00.
      const hh = String(a.startTime.getUTCHours()).padStart(2, '0');
      const mm = String(a.startTime.getUTCMinutes()).padStart(2, '0');
      console.log(`        first: ${hh}:${mm}  ${a.title}  [${a.status}]`);
      check('activity times are readable as a wall clock', /^\d\d:\d\d$/.test(`${hh}:${mm}`));
    }
  }

  console.log('\n[3] Coupons and grants');
  await ran('coupons by event', () =>
    db
      .select({ id: zuppdateEventCoupons.id, title: zuppdateEventCoupons.title })
      .from(zuppdateEventCoupons)
      .where(eq(zuppdateEventCoupons.eventId, eventId ?? '__none__'))
      .limit(10)
  );
  await ran('grants joined to coupons (the per-guest perk query)', () =>
    db
      .select({
        grantId: zuppdateEventCouponGrants.id,
        usedCount: zuppdateEventCouponGrants.usedCount,
        title: zuppdateEventCoupons.title,
        maxUses: zuppdateEventCoupons.maxUses,
        validFrom: zuppdateEventCoupons.validFrom,
        validTo: zuppdateEventCoupons.validTo,
      })
      .from(zuppdateEventCouponGrants)
      .innerJoin(
        zuppdateEventCoupons,
        eq(zuppdateEventCouponGrants.couponId, zuppdateEventCoupons.id)
      )
      .where(eq(zuppdateEventCoupons.isActive, true))
      .limit(10)
  );

  console.log('\n[4] Passes and the arrival count');
  const passes = await ran('passes for the event', () =>
    db
      .select({ id: guestInvitation.id, guestId: guestInvitation.guestId })
      .from(guestInvitation)
      .where(eq(guestInvitation.eventId, eventId ?? '__none__'))
      .limit(50)
  );
  console.log(`        ${passes?.length ?? 0} pass(es) on that event`);

  // The scan query must run even with no passes, which is the state a freshly
  // created event is in — the endpoint guards on length, so prove the guard's
  // other branch too.
  const anyPasses = await db
    .select({ id: guestInvitation.id })
    .from(guestInvitation)
    .limit(5);
  if (anyPasses.length) {
    await ran('successful scans for a set of passes', () =>
      db
        .select({
          invitationId: invitationScanEvent.invitationId,
          timestamp: invitationScanEvent.timestamp,
        })
        .from(invitationScanEvent)
        .where(
          and(
            inArray(
              invitationScanEvent.invitationId,
              anyPasses.map((p) => p.id)
            ),
            eq(invitationScanEvent.success, true)
          )
        )
    );
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})();
