import { NextRequest } from 'next/server';
import { eq, and, gte, desc } from 'drizzle-orm';
import { db } from '@/db';
import { guestInvitation, guestQrSession, guestOtp } from '@/db/schema';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';
import crypto from 'crypto';

// GET /api/guest/[invitationId]/qr - Get or create QR session and OTP for guest (NO AUTH REQUIRED)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const { invitationId } = await params;

    // Fetch invitation details
    const [invitation] = await db
      .select({
        id: guestInvitation.id,
        guestId: guestInvitation.guestId,
        securityLevel: guestInvitation.requestedSecurityLevel,
        validFrom: guestInvitation.validFrom,
        validTo: guestInvitation.validTo,
        status: guestInvitation.status,
      })
      .from(guestInvitation)
      .where(eq(guestInvitation.id, invitationId))
      .limit(1);

    if (!invitation) {
      return notFoundResponse('Invitation not found');
    }

    // Check if invitation is valid
    const now = new Date();
    if (invitation.status === 'revoked') {
      return errorResponse('This invitation has been revoked', 403);
    }

    if (invitation.status === 'expired' || invitation.validTo < now) {
      return errorResponse('This invitation has expired', 403);
    }

    if (invitation.validFrom > now) {
      return errorResponse('This invitation is not yet active', 403);
    }

    // Get QR expiry from env (default 5 minutes = 300 seconds)
    const qrExpirySeconds = parseInt(process.env.QR_EXPIRY_SECONDS || '300');
    const otpExpirySeconds = parseInt(process.env.OTP_EXPIRY_SECONDS || '300');

    // Check for existing valid QR session
    const qrExpiryThreshold = new Date(Date.now() - qrExpirySeconds * 1000);

    const [existingQrSession] = await db
      .select()
      .from(guestQrSession)
      .where(
        and(
          eq(guestQrSession.invitationId, invitationId),
          gte(guestQrSession.expiresAt, qrExpiryThreshold)
        )
      )
      .orderBy(desc(guestQrSession.createdAt))
      .limit(1);

    let qrSession;

    if (existingQrSession && new Date(existingQrSession.expiresAt) > now) {
      // Use existing QR session
      qrSession = existingQrSession;
    } else {
      // Create new QR session
      const rotatingKey = crypto.randomBytes(16).toString('hex');
      const expiresAt = new Date(Date.now() + qrExpirySeconds * 1000);

      const [newQrSession] = await db
        .insert(guestQrSession)
        .values({
          invitationId: invitationId,
          rotatingKey,
          expiresAt,
        })
        .$returningId();

      [qrSession] = await db
        .select()
        .from(guestQrSession)
        .where(eq(guestQrSession.id, newQrSession.id))
        .limit(1);
    }

    // For L2 and L4, generate OTP
    let otp = null;

    if (invitation.securityLevel === 2 || invitation.securityLevel === 4) {
      // Check for existing valid OTP
      const otpExpiryThreshold = new Date(Date.now() - otpExpirySeconds * 1000);

      const [existingOtp] = await db
        .select()
        .from(guestOtp)
        .where(
          and(
            eq(guestOtp.invitationId, invitationId),
            gte(guestOtp.expiresAt, otpExpiryThreshold)
          )
        )
        .orderBy(desc(guestOtp.createdAt))
        .limit(1);

      if (existingOtp && new Date(existingOtp.expiresAt) > now) {
        // Use existing OTP
        otp = existingOtp;
      } else {
        // Generate new 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + otpExpirySeconds * 1000);

        const [newOtp] = await db
          .insert(guestOtp)
          .values({
            invitationId: invitationId,
            otpCode,
            expiresAt: otpExpiresAt,
          })
          .$returningId();

        [otp] = await db
          .select()
          .from(guestOtp)
          .where(eq(guestOtp.id, newOtp.id))
          .limit(1);

        // TODO: Send OTP via SMS
      }
    }

    // Return QR session and OTP (if applicable)
    return successResponse({
      qrSession: {
        qrCode: qrSession.rotatingKey,
        expiresAt: qrSession.expiresAt,
        createdAt: qrSession.createdAt,
      },
      otp: otp
        ? {
            otpCode: otp.otpCode,
            expiresAt: otp.expiresAt,
            createdAt: otp.createdAt,
          }
        : null,
      invitation: {
        id: invitation.id,
        securityLevel: invitation.securityLevel,
        validFrom: invitation.validFrom,
        validTo: invitation.validTo,
        status: invitation.status,
      },
      qrExpirySeconds,
      otpExpirySeconds,
    });
  } catch (error) {
    console.error('Get guest QR error:', error);
    return errorResponse('An error occurred while generating QR code', 500);
  }
}
