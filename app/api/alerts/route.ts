import { NextRequest } from 'next/server';
import { eq, and, desc, gte, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  invitationScanEvent,
  guestInvitation,
  guest,
  securityPersonnel,
} from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/alerts - Get all security alerts (failed scans) for the org admin
export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(req);

    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { organizationNodeId, role } = authResult.payload;

    // Only org admins can access this endpoint
    if (role !== 'orgadmin') {
      return unauthorizedResponse('Unauthorized');
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const timeFilter = searchParams.get('time') || 'all'; // all, today, week
    const severityFilter = searchParams.get('severity') || 'all'; // all, high, medium

    // Calculate date filter
    let dateCondition;
    if (timeFilter === 'today') {
      dateCondition = gte(invitationScanEvent.timestamp, sql`CURDATE()`);
    } else if (timeFilter === 'week') {
      dateCondition = gte(invitationScanEvent.timestamp, sql`DATE_SUB(NOW(), INTERVAL 7 DAY)`);
    }

    // Build base conditions
    const conditions = [
      eq(guestInvitation.organizationNodeId, organizationNodeId!),
      eq(invitationScanEvent.success, false), // Only failed scans
    ];

    if (dateCondition) {
      conditions.push(dateCondition);
    }

    // Fetch all failed scan events
    const failedScans = await db
      .select({
        id: invitationScanEvent.id,
        timestamp: invitationScanEvent.timestamp,
        failureReason: invitationScanEvent.failureReason,
        securityLevel: invitationScanEvent.usedSecurityLevel,
        guardId: invitationScanEvent.scannedBySecurityPersonnelId,
        guardUsername: securityPersonnel.username,
        guestId: guestInvitation.guestId,
        guestName: guest.name,
        guestPhone: guest.phone,
        invitationId: guestInvitation.id,
        invitationStatus: guestInvitation.status,
      })
      .from(invitationScanEvent)
      .innerJoin(guestInvitation, eq(invitationScanEvent.invitationId, guestInvitation.id))
      .leftJoin(guest, eq(guestInvitation.guestId, guest.id))
      .leftJoin(securityPersonnel, eq(invitationScanEvent.scannedBySecurityPersonnelId, securityPersonnel.id))
      .where(and(...conditions))
      .orderBy(desc(invitationScanEvent.timestamp));

    // Transform to alert format
    const alerts = failedScans.map(scan => {
      const failureReason = scan.failureReason || 'Scan verification failed';

      // Determine alert type and severity
      let type = 'UNAUTHORIZED_ATTEMPT';
      let severity: 'high' | 'medium' | 'low' = 'medium';

      if (failureReason.toLowerCase().includes('otp')) {
        type = 'OTP_FAILURE';
        severity = 'high';
      } else if (failureReason.toLowerCase().includes('expired')) {
        type = 'EXPIRATION';
        severity = 'medium';
      } else if (failureReason.toLowerCase().includes('invalid') || failureReason.toLowerCase().includes('qr')) {
        type = 'INVALID_QR';
        severity = 'high';
      } else if (failureReason.toLowerCase().includes('unauthorized')) {
        type = 'UNAUTHORIZED_ATTEMPT';
        severity = 'high';
      }

      // Generate detailed message
      let message = failureReason;
      if (scan.guestName) {
        message = `${failureReason} - Guest: ${scan.guestName}`;
      }
      if (scan.guardUsername) {
        message += ` (Guard: ${scan.guardUsername})`;
      }

      return {
        id: scan.id,
        type,
        severity,
        message,
        failureReason,
        timestamp: scan.timestamp,
        guestName: scan.guestName || 'Unknown Guest',
        guestPhone: scan.guestPhone || 'N/A',
        guardUsername: scan.guardUsername || 'Unknown Guard',
        securityLevel: scan.securityLevel,
        invitationId: scan.invitationId,
        invitationStatus: scan.invitationStatus,
      };
    });

    // Filter by severity if specified
    const filteredAlerts = severityFilter === 'all'
      ? alerts
      : alerts.filter(alert => alert.severity === severityFilter);

    // Get summary stats
    const stats = {
      total: filteredAlerts.length,
      high: filteredAlerts.filter(a => a.severity === 'high').length,
      medium: filteredAlerts.filter(a => a.severity === 'medium').length,
      low: filteredAlerts.filter(a => a.severity === 'low').length,
      today: filteredAlerts.filter(a => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(a.timestamp) >= today;
      }).length,
    };

    return successResponse({
      alerts: filteredAlerts,
      stats,
    }, 'Alerts retrieved successfully');

  } catch (error) {
    console.error('Alerts API Error:', error);
    return serverErrorResponse('Failed to fetch alerts');
  }
}

// DELETE /api/alerts/[id] - Dismiss/acknowledge an alert
// Note: We don't actually delete scan events (audit trail), but we could add an "acknowledged" field
// For now, dismissal is handled client-side
