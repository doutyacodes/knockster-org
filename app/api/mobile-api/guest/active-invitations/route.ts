import { NextRequest } from 'next/server';
import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import {
  guestInvitation,
  guestQrSession,
  guestOtp,
  organizationNode,
} from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { createdByPayload } from '@/lib/creator-role';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { toIST } from '@/lib/timezone';
import { whereDerivedStatus } from '@/lib/invitation-status';
import {
  zuppdateEvents,
  zuppdateEventCreatorContext,
  zuppdateEventCoupons,
  zuppdateEventCouponGrants,
} from '@/db/zuppdate-schema';
import crypto from 'crypto';

// GET /api/mobile-api/guest/active-invitations - Get active invitations with QR codes
export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(req);

    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { id: guestId, role } = authResult.payload;

    // Only guests can access this endpoint
    if (role !== 'guest') {
      return unauthorizedResponse('Unauthorized');
    }

    const now = new Date();

    // Fetch all active invitations for this guest
    const invitations = await db
      .select({
        id: guestInvitation.id,
        employeeName: guestInvitation.employeeName,
        employeePhone: guestInvitation.employeePhone,
        validFrom: guestInvitation.validFrom,
        validTo: guestInvitation.validTo,
        securityLevel: guestInvitation.requestedSecurityLevel,
        status: guestInvitation.status,
        organizationNodeId: guestInvitation.organizationNodeId,
        organizationName: organizationNode.name,
        organizationType: organizationNode.type,
        // Null for an ordinary visitor pass; set when this pass is a Zuppdate
        // event's gate pass, so the app can label it and show its coupons.
        eventId: guestInvitation.eventId,
        eventName: zuppdateEvents.name,
        eventSlug: zuppdateEvents.publicSlug,
        eventType: zuppdateEvents.eventType,
        eventLocation: zuppdateEvents.location,
        eventCreatorRole: zuppdateEventCreatorContext.role,
        eventCreatorName: zuppdateEventCreatorContext.displayName,
      })
      .from(guestInvitation)
      .leftJoin(organizationNode, eq(guestInvitation.organizationNodeId, organizationNode.id))
      .leftJoin(zuppdateEvents, eq(guestInvitation.eventId, zuppdateEvents.id))
      // Left, not inner: a personal event records no context row, and a guest
      // holding that pass must still get their event back.
      .leftJoin(
        zuppdateEventCreatorContext,
        eq(guestInvitation.eventId, zuppdateEventCreatorContext.eventId)
      )
      .where(
        and(
          eq(guestInvitation.guestId, guestId!),
          // Derived: the stored column goes stale, which meant the guest app
          // listed long-expired passes as usable. See lib/invitation-status.ts.
          whereDerivedStatus('active')
        )
      )
      .orderBy(guestInvitation.requestedSecurityLevel); // Order by security level

    // For each invitation, get or create QR session and OTP if needed
    const invitationsWithQR = await Promise.all(
      invitations.map(async (invitation) => {
        let qrSession;
        let otp = null;

        // Get or create QR session for L1/L2
        if (invitation.securityLevel === 1 || invitation.securityLevel === 2) {
          // Check for existing valid QR session
          const existingQR = await db
            .select()
            .from(guestQrSession)
            .where(
              and(
                eq(guestQrSession.invitationId, invitation.id),
                gte(guestQrSession.expiresAt, now)
              )
            )
            .limit(1);

          if (existingQR.length > 0) {
            qrSession = existingQR[0];
          } else {
            // Create new QR session
            const rotatingKey = crypto.randomBytes(32).toString('hex');
            const qrExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            await db.insert(guestQrSession).values({
              invitationId: invitation.id,
              rotatingKey,
              expiresAt: qrExpiresAt,
            });

            qrSession = {
              rotatingKey,
              expiresAt: qrExpiresAt,
              createdAt: now,
            };
          }

          // Get or create OTP for L2
          if (invitation.securityLevel === 2) {
            const existingOTP = await db
              .select()
              .from(guestOtp)
              .where(
                and(
                  eq(guestOtp.invitationId, invitation.id),
                  gte(guestOtp.expiresAt, now),
                  eq(guestOtp.verified, false)
                )
              )
              .limit(1);

            if (existingOTP.length > 0) {
              otp = existingOTP[0];
            } else {
              // Create new OTP
              const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
              const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

              await db.insert(guestOtp).values({
                invitationId: invitation.id,
                otpCode,
                expiresAt: otpExpiresAt,
                verified: false,
              });

              otp = {
                otpCode,
                expiresAt: otpExpiresAt,
                createdAt: now,
              };
            }
          }
        }

        // Coupons, for event passes only. One query per event pass; a guest
        // holds very few passes at once, so this stays cheap.
        let coupons: {
          grantId: string;
          redeemKey: string;
          title: string;
          description: string | null;
          usedCount: number;
          maxUses: number;
          remaining: number;
          validFrom: string | null;
          validTo: string | null;
          qrData: string;
        }[] = [];

        if (invitation.eventId) {
          const grants = await db
            .select({
              grantId: zuppdateEventCouponGrants.id,
              redeemKey: zuppdateEventCouponGrants.redeemKey,
              usedCount: zuppdateEventCouponGrants.usedCount,
              title: zuppdateEventCoupons.title,
              description: zuppdateEventCoupons.description,
              maxUses: zuppdateEventCoupons.maxUses,
              validFrom: zuppdateEventCoupons.validFrom,
              validTo: zuppdateEventCoupons.validTo,
              isActive: zuppdateEventCoupons.isActive,
              order: zuppdateEventCoupons.order,
            })
            .from(zuppdateEventCouponGrants)
            .innerJoin(zuppdateEventCoupons, eq(zuppdateEventCouponGrants.couponId, zuppdateEventCoupons.id))
            .where(eq(zuppdateEventCouponGrants.invitationId, invitation.id))
            .orderBy(zuppdateEventCoupons.order);

          coupons = grants
            .filter((g) => g.isActive)
            .map((g) => ({
              grantId: g.grantId,
              redeemKey: g.redeemKey,
              title: g.title,
              description: g.description,
              usedCount: g.usedCount,
              maxUses: g.maxUses,
              remaining: Math.max(0, g.maxUses - g.usedCount),
              // The payload the security app's scanner expects.
              qrData: JSON.stringify({ type: 'coupon', grantId: g.grantId, key: g.redeemKey }),
              // Zuppdate DATETIME(3) wall-clock values, passed through rather
              // than run through toIST -- converting would shift the organiser's
              // stated time. See db/zuppdate-schema.ts.
              validFrom: g.validFrom ? new Date(g.validFrom).toISOString() : null,
              validTo: g.validTo ? new Date(g.validTo).toISOString() : null,
            }));
        }

        return {
          id: invitation.id,
          employeeName: invitation.employeeName,
          employeePhone: invitation.employeePhone,
          validFrom: toIST(invitation.validFrom),
          validTo: toIST(invitation.validTo),
          securityLevel: invitation.securityLevel,
          status: invitation.status,
          organization: {
            id: invitation.organizationNodeId,
            name: invitation.organizationName,
            type: invitation.organizationType,
          },
          qrSession: qrSession ? {
            qrCode: qrSession.rotatingKey,
            expiresAt: toIST(qrSession.expiresAt),
            qrData: JSON.stringify({
              invitationId: invitation.id,
              qrCode: qrSession.rotatingKey,
            }),
          } : null,
          otp: otp ? {
            otpCode: otp.otpCode,
            expiresAt: toIST(otp.expiresAt),
          } : null,
          // Additive. Null for an ordinary visitor pass.
          event: invitation.eventId
            ? {
                id: invitation.eventId,
                name: invitation.eventName,
                slug: invitation.eventSlug,
                type: invitation.eventType,
                location: invitation.eventLocation,
                // Who put this event on, and under which hat. Null for an
                // individual's own event, which is what no context row means.
                createdBy: createdByPayload(
                  invitation.eventCreatorRole,
                  invitation.eventCreatorName
                ),
              }
            : null,
          coupons,
        };
      })
    );

    // Find the highest security level invitation
    const highestSecurityLevel = invitationsWithQR.length > 0
      ? Math.max(...invitationsWithQR.map(inv => inv.securityLevel || 0))
      : 0;

    return successResponse({
      invitations: invitationsWithQR,
      highestSecurityLevel,
      totalActive: invitationsWithQR.length,
    }, 'Active invitations retrieved successfully');

  } catch (error) {
    console.error('Active invitations error:', error);
    return serverErrorResponse('Failed to fetch active invitations');
  }
}
