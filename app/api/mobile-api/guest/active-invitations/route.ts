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
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
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
      })
      .from(guestInvitation)
      .leftJoin(organizationNode, eq(guestInvitation.organizationNodeId, organizationNode.id))
      .where(
        and(
          eq(guestInvitation.guestId, guestId!),
          eq(guestInvitation.status, 'active')
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

        return {
          id: invitation.id,
          employeeName: invitation.employeeName,
          employeePhone: invitation.employeePhone,
          validFrom: invitation.validFrom,
          validTo: invitation.validTo,
          securityLevel: invitation.securityLevel,
          status: invitation.status,
          organization: {
            id: invitation.organizationNodeId,
            name: invitation.organizationName,
            type: invitation.organizationType,
          },
          qrSession: qrSession ? {
            qrCode: qrSession.rotatingKey,
            expiresAt: qrSession.expiresAt,
            qrData: JSON.stringify({
              invitationId: invitation.id,
              qrCode: qrSession.rotatingKey,
            }),
          } : null,
          otp: otp ? {
            otpCode: otp.otpCode,
            expiresAt: otp.expiresAt,
          } : null,
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
