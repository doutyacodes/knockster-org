import { NextRequest } from 'next/server';
import { eq, desc, or } from 'drizzle-orm';
import { db } from '@/db';
import {
  guestInvitation,
  invitationScanEvent,
  organizationNode,
} from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/mobile-api/guest/history - Get guest's invitation history
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

    // Fetch all invitations for this guest
    const invitations = await db
      .select({
        id: guestInvitation.id,
        employeeName: guestInvitation.employeeName,
        employeePhone: guestInvitation.employeePhone,
        validFrom: guestInvitation.validFrom,
        validTo: guestInvitation.validTo,
        securityLevel: guestInvitation.requestedSecurityLevel,
        status: guestInvitation.status,
        createdAt: guestInvitation.createdAt,
        organizationName: organizationNode.name,
        organizationType: organizationNode.type,
      })
      .from(guestInvitation)
      .leftJoin(organizationNode, eq(guestInvitation.organizationNodeId, organizationNode.id))
      .where(eq(guestInvitation.guestId, guestId!))
      .orderBy(desc(guestInvitation.createdAt));

    // Get scan history for each invitation
    const invitationsWithHistory = await Promise.all(
      invitations.map(async (invitation) => {
        const scans = await db
          .select({
            id: invitationScanEvent.id,
            timestamp: invitationScanEvent.timestamp,
            success: invitationScanEvent.success,
            failureReason: invitationScanEvent.failureReason,
            securityLevel: invitationScanEvent.usedSecurityLevel,
          })
          .from(invitationScanEvent)
          .where(eq(invitationScanEvent.invitationId, invitation.id))
          .orderBy(desc(invitationScanEvent.timestamp))
          .limit(5);

        return {
          ...invitation,
          scanHistory: scans,
          totalScans: scans.length,
          lastScan: scans.length > 0 ? scans[0].timestamp : null,
        };
      })
    );

    // Categorize invitations (database uses: 'active', 'pending', 'expired', 'revoked')
    const activeInvitations = invitationsWithHistory.filter(
      inv => inv.status === 'active'
    );
    const upcomingInvitations = invitationsWithHistory.filter(
      inv => inv.status === 'pending' // 'pending' is the database status for upcoming
    );
    const pastInvitations = invitationsWithHistory.filter(
      inv => inv.status === 'expired' || inv.status === 'revoked'
    );

    return successResponse({
      summary: {
        total: invitationsWithHistory.length,
        active: activeInvitations.length,
        upcoming: upcomingInvitations.length,
        past: pastInvitations.length,
      },
      active: activeInvitations,
      upcoming: upcomingInvitations,
      past: pastInvitations,
    }, 'History retrieved successfully');

  } catch (error) {
    console.error('Guest history error:', error);
    return serverErrorResponse('Failed to fetch history');
  }
}