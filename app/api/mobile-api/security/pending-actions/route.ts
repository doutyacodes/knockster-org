import { NextRequest } from 'next/server';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  invitationScanEvent,
  guestInvitation,
  guest,
  guestOtp,
  securityPersonnel,
} from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { toIST } from '@/lib/timezone';

// GET /api/mobile-api/security/pending-actions - Check for pending L3 scans and L4 OTPs
export async function GET(req: NextRequest) {
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

    // 1. Check for recent L3 successful scans (last 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

    const recentL3Scans = await db
      .select({
        scanId: invitationScanEvent.id,
        invitationId: invitationScanEvent.invitationId,
        scannedAt: invitationScanEvent.timestamp,
        securityLevel: invitationScanEvent.usedSecurityLevel,
        guestName: guest.name,
        guestPhone: guest.phone,
        employeeName: guestInvitation.employeeName,
        employeePhone: guestInvitation.employeePhone,
      })
      .from(invitationScanEvent)
      .innerJoin(guestInvitation, eq(invitationScanEvent.invitationId, guestInvitation.id))
      .leftJoin(guest, eq(guestInvitation.guestId, guest.id))
      .where(
        and(
          eq(invitationScanEvent.scannedBySecurityPersonnelId, guardId!),
          eq(invitationScanEvent.usedSecurityLevel, 3),
          eq(invitationScanEvent.success, true),
          gte(invitationScanEvent.timestamp, thirtySecondsAgo)
        )
      )
      .orderBy(desc(invitationScanEvent.timestamp))
      .limit(1);

    // 2. Check for pending L4 OTPs (unverified and not expired)
    const now = new Date();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Get guard's organization to find OTPs for invitations in their org
    const guardData = await db
      .select({
        organizationNodeId: securityPersonnel.organizationNodeId,
      })
      .from(securityPersonnel)
      .where(eq(securityPersonnel.id, guardId!))
      .limit(1);

    const guardOrgId = guardData[0]?.organizationNodeId;

    const pendingL4Otps = await db
      .select({
        otpId: guestOtp.id,
        invitationId: guestOtp.invitationId,
        otpCode: guestOtp.otpCode,
        expiresAt: guestOtp.expiresAt,
        createdAt: guestOtp.createdAt,
        guestName: guest.name,
        guestPhone: guest.phone,
        employeeName: guestInvitation.employeeName,
        employeePhone: guestInvitation.employeePhone,
        securityLevel: guestInvitation.requestedSecurityLevel,
      })
      .from(guestOtp)
      .innerJoin(guestInvitation, eq(guestOtp.invitationId, guestInvitation.id))
      .leftJoin(guest, eq(guestInvitation.guestId, guest.id))
      .where(
        and(
          eq(guestOtp.verified, false),
          gte(guestOtp.expiresAt, now),
          gte(guestOtp.createdAt, fiveMinutesAgo),
          eq(guestInvitation.requestedSecurityLevel, 4),
          guardOrgId ? eq(guestInvitation.organizationNodeId, guardOrgId) : sql`1=1`
        )
      )
      .orderBy(desc(guestOtp.createdAt))
      .limit(1);

    // Format response
    const pendingL3Scans = recentL3Scans.map(scan => ({
      invitationId: scan.invitationId,
      guestName: scan.guestName || 'Unknown Guest',
      guestPhone: scan.guestPhone || 'N/A',
      employeeName: scan.employeeName,
      employeePhone: scan.employeePhone,
      scannedAt: toIST(scan.scannedAt),
      securityLevel: scan.securityLevel,
    }));

    const pendingL4OtpRequests = pendingL4Otps.map(otp => ({
      invitationId: otp.invitationId,
      guestName: otp.guestName || 'Unknown Guest',
      guestPhone: otp.guestPhone || 'N/A',
      employeeName: otp.employeeName,
      employeePhone: otp.employeePhone,
      requiresOtp: true,
      expiresAt: toIST(otp.expiresAt),
      generatedAt: toIST(otp.createdAt),
      securityLevel: otp.securityLevel,
    }));

    return successResponse({
      hasL3Scans: pendingL3Scans.length > 0,
      hasL4Otps: pendingL4OtpRequests.length > 0,
      pendingL3Scans,
      pendingL4Otps: pendingL4OtpRequests,
    }, 'Pending actions retrieved successfully');

  } catch (error) {
    console.error('Pending actions error:', error);
    return serverErrorResponse('Failed to fetch pending actions');
  }
}
