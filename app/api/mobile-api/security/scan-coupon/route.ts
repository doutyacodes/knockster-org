import { NextRequest } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/db';
import { guestInvitation, guest, securityPersonnel } from '@/db/schema';
import {
  zuppdateEvents,
  zuppdateEventCoupons,
  zuppdateEventCouponGrants,
  zuppdateEventCouponRedemptions,
} from '@/db/zuppdate-schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { deriveInvitationStatus } from '@/lib/invitation-status';
import crypto from 'crypto';

/**
 * POST /api/mobile-api/security/scan-coupon
 *
 * Redeems a Zuppdate event coupon — lunch, drinks, a goodie bag — scanned by
 * the same door staff, with the same app, as an entry pass. The guest's coupon
 * QR carries `{ type: 'coupon', grantId, key }`.
 *
 * Every attempt is written to event_coupon_redemptions whether it succeeds or
 * not, the same never-lose-an-attempt approach as invitation_scan_event, so an
 * argument at the food counter can be settled from the record.
 *
 * Authorisation has three parts, and all three matter:
 *   1. a guard token;
 *   2. the secret in the QR must match the grant, so a screenshot of somebody
 *      else's coupon with a guessed id is useless;
 *   3. the guard must belong to the org node the event issues passes into, so
 *      one event's staff cannot redeem another event's coupons.
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { id: guardId, role } = authResult.payload;
    if (role !== 'guard') {
      return unauthorizedResponse('Unauthorized');
    }

    const body = await req.json();
    const { grantId, key } = body ?? {};
    if (!grantId || !key) {
      return errorResponse('Coupon id and key are required', 400);
    }

    // Grant + its coupon + the pass it belongs to + the guest, in one read.
    const [row] = await db
      .select({
        grantId: zuppdateEventCouponGrants.id,
        redeemKey: zuppdateEventCouponGrants.redeemKey,
        usedCount: zuppdateEventCouponGrants.usedCount,
        couponTitle: zuppdateEventCoupons.title,
        maxUses: zuppdateEventCoupons.maxUses,
        isActive: zuppdateEventCoupons.isActive,
        validFrom: zuppdateEventCoupons.validFrom,
        validTo: zuppdateEventCoupons.validTo,
        invitationId: guestInvitation.id,
        invitationStatus: guestInvitation.status,
        invitationValidFrom: guestInvitation.validFrom,
        invitationValidTo: guestInvitation.validTo,
        organizationNodeId: guestInvitation.organizationNodeId,
        guestName: guest.name,
        guestPhone: guest.phone,
        eventName: zuppdateEvents.name,
      })
      .from(zuppdateEventCouponGrants)
      .innerJoin(zuppdateEventCoupons, eq(zuppdateEventCouponGrants.couponId, zuppdateEventCoupons.id))
      .innerJoin(guestInvitation, eq(zuppdateEventCouponGrants.invitationId, guestInvitation.id))
      .leftJoin(guest, eq(guestInvitation.guestId, guest.id))
      .leftJoin(zuppdateEvents, eq(zuppdateEventCoupons.eventId, zuppdateEvents.id))
      .where(eq(zuppdateEventCouponGrants.id, grantId))
      .limit(1);

    if (!row) {
      return errorResponse('That coupon could not be found', 404);
    }

    /** Records the attempt, then answers. Nothing returns without being logged. */
    const deny = async (reason: string, status = 403) => {
      await db.insert(zuppdateEventCouponRedemptions).values({
        id: crypto.randomUUID(),
        grantId: row.grantId,
        redeemedBySecurityPersonnelId: guardId!,
        success: false,
        failureReason: reason,
        at: new Date(),
      });
      return errorResponse(reason, status);
    };

    // Timing-safe on the secret: this is a credential, and comparing it with
    // === leaks how much of a guessed key was right.
    const expected = Buffer.from(row.redeemKey, 'utf8');
    const supplied = Buffer.from(String(key), 'utf8');
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
      return deny('This coupon code is not valid', 400);
    }

    // The guard must be on this event's gate.
    const [guard] = await db
      .select({ organizationNodeId: securityPersonnel.organizationNodeId, status: securityPersonnel.status })
      .from(securityPersonnel)
      .where(eq(securityPersonnel.id, guardId!))
      .limit(1);

    if (!guard || guard.status === 'disabled') {
      return deny('Your account is not active', 403);
    }
    if (guard.organizationNodeId !== row.organizationNodeId) {
      return deny('This coupon belongs to a different event', 403);
    }

    if (!row.isActive) {
      return deny('This coupon is no longer being offered', 403);
    }

    // The pass itself must still be good — a revoked guest keeps no perks.
    // Derived, never the stored column. See lib/invitation-status.ts.
    const passStatus = deriveInvitationStatus(
      row.invitationStatus,
      row.invitationValidFrom,
      row.invitationValidTo
    );
    if (passStatus === 'revoked') return deny("This guest's pass has been revoked", 403);
    if (passStatus === 'expired') return deny("This guest's pass has expired", 403);
    if (passStatus === 'pending') return deny("This guest's pass is not active yet", 403);

    // The coupon's own window, which is independent of the event's hours —
    // lunch between 12:00 and 14:00 regardless of when the event runs.
    //
    // These are Zuppdate DATETIME(3) columns holding UTC-anchored wall clock,
    // NOT the TIMESTAMP columns this product uses, so they are unaffected by
    // the UTC session pinning in db/index.ts. Compared as instants, which is
    // what both sides mean by them.
    const now = new Date();
    if (row.validFrom && new Date(row.validFrom) > now) {
      return deny(`${row.couponTitle} is not available yet`, 403);
    }
    if (row.validTo && new Date(row.validTo) < now) {
      return deny(`${row.couponTitle} is no longer available`, 403);
    }

    if (row.usedCount >= row.maxUses) {
      return deny(
        row.maxUses === 1
          ? `${row.couponTitle} has already been used`
          : `${row.couponTitle} has been used all ${row.maxUses} times`,
        403
      );
    }

    // Conditional increment, so two staff scanning the same coupon at the same
    // moment cannot both succeed past the limit: the guard is in the WHERE, and
    // whichever UPDATE lands second matches no row.
    const result = await db
      .update(zuppdateEventCouponGrants)
      .set({ usedCount: sql`${zuppdateEventCouponGrants.usedCount} + 1`, updatedAt: new Date() })
      .where(
        and(
          eq(zuppdateEventCouponGrants.id, row.grantId),
          sql`${zuppdateEventCouponGrants.usedCount} = ${row.usedCount}`,
          sql`${zuppdateEventCouponGrants.usedCount} < ${row.maxUses}`
        )
      );

    // drizzle-mysql2 resolves to mysql2's raw [ResultSetHeader, FieldPacket[]],
    // so affectedRows lives on element 0, NOT on the result itself. Reading it
    // off the result gives undefined, which made every redemption report
    // "redeemed by someone else" while still incrementing the count — the
    // guest is refused food they are entitled to AND loses a use for it.
    const header = (result as unknown as [{ affectedRows?: number }])[0];
    const changed = header?.affectedRows ?? 0;
    if (changed === 0) {
      return deny(`${row.couponTitle} was just redeemed by someone else`, 409);
    }

    await db.insert(zuppdateEventCouponRedemptions).values({
      id: crypto.randomUUID(),
      grantId: row.grantId,
      redeemedBySecurityPersonnelId: guardId!,
      success: true,
      failureReason: null,
      at: new Date(),
    });

    const used = row.usedCount + 1;
    return successResponse(
      {
        status: 'success',
        coupon: {
          title: row.couponTitle,
          used,
          maxUses: row.maxUses,
          remaining: Math.max(0, row.maxUses - used),
        },
        guest: {
          name: row.guestName ?? 'Guest',
          phone: row.guestPhone ?? null,
        },
        event: { name: row.eventName ?? null },
      },
      `${row.couponTitle} redeemed`
    );
  } catch (error) {
    console.error('Coupon scan error:', error);
    return serverErrorResponse('Failed to redeem coupon');
  }
}
