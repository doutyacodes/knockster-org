import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import {
  guestOtp,
  guestInvitation,
  guest,
  invitationScanEvent,
} from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

// POST /api/mobile-api/security/verify-otp - Verify OTP for L2/L4
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(req);

    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { id: guardId, role } = authResult.payload;

    // Only guards can access this endpoint
    if (role !== 'guard') {
      return unauthorizedResponse('Unauthorized');
    }

    const body = await req.json();
    const { invitationId, qrCode, otpCode } = body;

    if (!invitationId || !otpCode) {
      return errorResponse('Invitation ID and OTP code are required', 400);
    }

    // qrCode is optional but included from mobile app for consistency

    // Fetch invitation details
    const invitationData = await db
      .select({
        id: guestInvitation.id,
        guestId: guestInvitation.guestId,
        guestName: guest.name,
        guestPhone: guest.phone,
        employeeName: guestInvitation.employeeName,
        employeePhone: guestInvitation.employeePhone,
        securityLevel: guestInvitation.requestedSecurityLevel,
        status: guestInvitation.status,
        validFrom: guestInvitation.validFrom,
        validTo: guestInvitation.validTo,
      })
      .from(guestInvitation)
      .leftJoin(guest, eq(guestInvitation.guestId, guest.id))
      .where(eq(guestInvitation.id, invitationId))
      .limit(1);

    if (invitationData.length === 0) {
      return errorResponse('Invitation not found', 404);
    }

    const invitation = invitationData[0];

    // Check if invitation requires OTP (L2 or L4)
    if (invitation.securityLevel !== 2 && invitation.securityLevel !== 4) {
      return errorResponse('This invitation does not require OTP verification', 400);
    }

    // Fetch and verify OTP
    const otpData = await db
      .select()
      .from(guestOtp)
      .where(
        and(
          eq(guestOtp.invitationId, invitationId),
          eq(guestOtp.otpCode, otpCode),
          eq(guestOtp.verified, false)
        )
      )
      .limit(1);

    if (otpData.length === 0) {
      // Log failed scan - OTP mismatch
      await db.insert(invitationScanEvent).values({
        invitationId,
        scannedBySecurityPersonnelId: guardId!,
        usedSecurityLevel: invitation.securityLevel!,
        success: false,
        failureReason: 'OTP verification failed - Invalid OTP code',
      });

      return errorResponse('Invalid OTP code', 400);
    }

    const otp = otpData[0];

    // Check if OTP is expired
    if (new Date() > new Date(otp.expiresAt)) {
      // Log failed scan - OTP expired
      await db.insert(invitationScanEvent).values({
        invitationId,
        scannedBySecurityPersonnelId: guardId!,
        usedSecurityLevel: invitation.securityLevel!,
        success: false,
        failureReason: 'OTP verification failed - OTP expired',
      });

      return errorResponse('OTP has expired. Please request a new one.', 400);
    }

    // Mark OTP as verified
    await db
      .update(guestOtp)
      .set({ verified: true })
      .where(eq(guestOtp.id, otp.id));

    // Log successful scan
    await db.insert(invitationScanEvent).values({
      invitationId,
      scannedBySecurityPersonnelId: guardId!,
      usedSecurityLevel: invitation.securityLevel!,
      success: true,
      failureReason: null,
    });

    return successResponse({
      status: 'success',
      message: `Access granted - Level ${invitation.securityLevel}`,
      invitation: {
        id: invitation.id,
        guestName: invitation.guestName,
        guestPhone: invitation.guestPhone,
        employeeName: invitation.employeeName,
        employeePhone: invitation.employeePhone,
        securityLevel: invitation.securityLevel,
        validFrom: invitation.validFrom,
        validTo: invitation.validTo,
      },
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return serverErrorResponse('Failed to verify OTP');
  }
}
