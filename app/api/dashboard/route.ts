import { NextRequest } from 'next/server';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { db } from '@/db';
import {
  guestInvitation,
  securityPersonnel,
  invitationScanEvent,
  guest,
  organizationNode
} from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { toIST } from '@/lib/timezone';

// GET /api/dashboard - Get dashboard statistics and data
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

    // Get query parameters for time range
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('range') || 'today'; // today, week, month

    // Calculate date range for scan frequency chart
    const now = new Date();
    let startDate = new Date();

    if (timeRange === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    }

    // 1. Get Stats - Active Invitations Count
    const activeInvitationsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(guestInvitation)
      .where(
        and(
          eq(guestInvitation.organizationNodeId, organizationNodeId!),
          eq(guestInvitation.status, 'active')
        )
      );
    const activeInvitations = Number(activeInvitationsResult[0]?.count || 0);

    // 2. Get Stats - Upcoming Visits Count (pending invitations)
    const upcomingVisitsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(guestInvitation)
      .where(
        and(
          eq(guestInvitation.organizationNodeId, organizationNodeId!),
          eq(guestInvitation.status, 'pending')
        )
      );
    const upcomingVisits = Number(upcomingVisitsResult[0]?.count || 0);

    // 3. Get Stats - Security Guards Count
    const securityGuardsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(securityPersonnel)
      .where(eq(securityPersonnel.organizationNodeId, organizationNodeId!));
    const securityGuards = Number(securityGuardsResult[0]?.count || 0);

    // 4. Get Stats - Recent Failed Scans (Alerts)
    const recentFailedScansResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(invitationScanEvent)
      .innerJoin(guestInvitation, eq(invitationScanEvent.invitationId, guestInvitation.id))
      .where(
        and(
          eq(guestInvitation.organizationNodeId, organizationNodeId!),
          eq(invitationScanEvent.success, false),
          gte(invitationScanEvent.timestamp, sql`DATE_SUB(NOW(), INTERVAL 24 HOUR)`)
        )
      );
    const alertsPending = Number(recentFailedScansResult[0]?.count || 0);

    // 5. Scan Frequency Data (hourly for today, daily for week/month)
    let scanFrequencyData;

    if (timeRange === 'today') {
      // Group by hour for today
      const hourlyScans = await db
        .select({
          hour: sql<number>`HOUR(${invitationScanEvent.timestamp})`,
          count: sql<number>`count(*)`
        })
        .from(invitationScanEvent)
        .innerJoin(guestInvitation, eq(invitationScanEvent.invitationId, guestInvitation.id))
        .where(
          and(
            eq(guestInvitation.organizationNodeId, organizationNodeId!),
            gte(invitationScanEvent.timestamp, startDate)
          )
        )
        .groupBy(sql`HOUR(${invitationScanEvent.timestamp})`);

      // Create array for all 24 hours
      scanFrequencyData = Array.from({ length: 24 }, (_, i) => {
        const hourData = hourlyScans.find(h => h.hour === i);
        const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
        const ampm = i < 12 ? 'AM' : 'PM';
        return {
          name: `${hour.toString().padStart(2, '0')} ${ampm}`,
          scans: Number(hourData?.count || 0)
        };
      }).filter((_, i) => i % 2 === 0); // Show every 2 hours to avoid clutter

    } else {
      // Group by day for week/month
      const dailyScans = await db
        .select({
          date: sql<string>`DATE(${invitationScanEvent.timestamp})`,
          count: sql<number>`count(*)`
        })
        .from(invitationScanEvent)
        .innerJoin(guestInvitation, eq(invitationScanEvent.invitationId, guestInvitation.id))
        .where(
          and(
            eq(guestInvitation.organizationNodeId, organizationNodeId!),
            gte(invitationScanEvent.timestamp, startDate)
          )
        )
        .groupBy(sql`DATE(${invitationScanEvent.timestamp})`);

      scanFrequencyData = dailyScans.map(day => ({
        name: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scans: Number(day.count || 0)
      }));
    }

    // 6. Security Tier Distribution
    const tierDistribution = await db
      .select({
        level: guestInvitation.requestedSecurityLevel,
        count: sql<number>`count(*)`
      })
      .from(guestInvitation)
      .where(eq(guestInvitation.organizationNodeId, organizationNodeId!))
      .groupBy(guestInvitation.requestedSecurityLevel);

    const totalInvitations = tierDistribution.reduce((sum, tier) => sum + Number(tier.count), 0);

    const distributionData = tierDistribution.map(tier => {
      const percentage = totalInvitations > 0
        ? Math.round((Number(tier.count) / totalInvitations) * 100)
        : 0;

      const colors: Record<number, string> = {
        1: '#3B82F6', // blue
        2: '#10B981', // emerald
        3: '#F59E0B', // amber
        4: '#EF4444'  // rose
      };

      return {
        name: `Level ${tier.level}`,
        value: percentage,
        count: Number(tier.count),
        color: colors[tier.level!] || '#94A3B8'
      };
    });

    // 7. Critical Security Alerts (Recent Failed Scans)
    const criticalAlerts = await db
      .select({
        id: invitationScanEvent.id,
        scannedAt: invitationScanEvent.timestamp,
        success: invitationScanEvent.success,
        failureReason: invitationScanEvent.failureReason,
        guardUsername: securityPersonnel.username,
        guestName: guest.name,
        guestPhone: guest.phone,
        securityLevel: guestInvitation.requestedSecurityLevel
      })
      .from(invitationScanEvent)
      .innerJoin(guestInvitation, eq(invitationScanEvent.invitationId, guestInvitation.id))
      .leftJoin(securityPersonnel, eq(invitationScanEvent.scannedBySecurityPersonnelId, securityPersonnel.id))
      .leftJoin(guest, eq(guestInvitation.guestId, guest.id))
      .where(
        and(
          eq(guestInvitation.organizationNodeId, organizationNodeId!),
          eq(invitationScanEvent.success, false),
          gte(invitationScanEvent.timestamp, sql`DATE_SUB(NOW(), INTERVAL 24 HOUR)`)
        )
      )
      .orderBy(desc(invitationScanEvent.timestamp))
      .limit(10);

    const alerts = criticalAlerts.map(alert => {
      const timeAgo = getTimeAgo(new Date(alert.scannedAt));

      // Determine alert type based on failure reason
      let type = 'UNAUTHORIZED';
      let message = alert.failureReason || 'Scan verification failed';

      if (alert.failureReason?.toLowerCase().includes('otp')) {
        type = 'OTP_FAILURE';
      } else if (alert.failureReason?.toLowerCase().includes('expired')) {
        type = 'EXPIRATION';
      }

      return {
        id: alert.id,
        type,
        time: timeAgo,
        message: `${message}${alert.guestName ? ` - Guest: ${alert.guestName}` : ''}`,
        guard: alert.guardUsername || 'Unknown Guard',
        severity: type === 'OTP_FAILURE' ? 'high' : type === 'EXPIRATION' ? 'medium' : 'low'
      };
    });

    // 8. Get organization node info
    const orgNode = await db
      .select({
        name: organizationNode.name,
        type: organizationNode.type
      })
      .from(organizationNode)
      .where(eq(organizationNode.id, organizationNodeId!))
      .limit(1);

    const dashboardData = {
      stats: {
        activeInvitations,
        upcomingVisits,
        securityGuards,
        alertsPending
      },
      scanFrequency: scanFrequencyData,
      tierDistribution: distributionData,
      alerts,
      organizationInfo: {
        name: orgNode[0]?.name || 'Organization',
        type: orgNode[0]?.type || 'company'
      }
    };

    return successResponse(dashboardData, 'Dashboard data retrieved successfully');

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return serverErrorResponse('Failed to fetch dashboard data');
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}