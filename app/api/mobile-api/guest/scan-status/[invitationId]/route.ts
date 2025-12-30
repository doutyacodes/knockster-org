import { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import {
  invitationScanEvent,
  securityPersonnel,
} from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse, notFoundResponse } from '@/lib/api-response';
import { toIST } from '@/lib/timezone';

// GET /api/mobile-api/guest/scan-status/[invitationId] - Get latest scan status for invitation
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(req);

    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { role } = authResult.payload;

    // Only guests can access this endpoint
    if (role !== 'guest') {
      return unauthorizedResponse('Unauthorized');
    }

    const { invitationId } = await params;

    // Get the latest scan event for this invitation
    const latestScan = await db
      .select({
        id: invitationScanEvent.id,
        timestamp: invitationScanEvent.timestamp,
        success: invitationScanEvent.success,
        failureReason: invitationScanEvent.failureReason,
        securityLevel: invitationScanEvent.usedSecurityLevel,
        guardUsername: securityPersonnel.username,
      })
      .from(invitationScanEvent)
      .leftJoin(
        securityPersonnel,
        eq(invitationScanEvent.scannedBySecurityPersonnelId, securityPersonnel.id)
      )
      .where(eq(invitationScanEvent.invitationId, invitationId))
      .orderBy(desc(invitationScanEvent.timestamp))
      .limit(1);

    if (latestScan.length === 0) {
      return notFoundResponse('No scan events found for this invitation');
    }

    const scan = latestScan[0];

    return successResponse({
      scanEvent: {
        id: scan.id,
        timestamp: toIST(scan.timestamp),
        success: scan.success,
        failureReason: scan.failureReason,
        securityLevel: scan.securityLevel,
        securityGuard: {
          username: scan.guardUsername,
        },
      },
      status: scan.success ? 'approved' : 'denied',
    }, 'Scan status retrieved successfully');

  } catch (error) {
    console.error('Scan status error:', error);
    return serverErrorResponse('Failed to fetch scan status');
  }
}
