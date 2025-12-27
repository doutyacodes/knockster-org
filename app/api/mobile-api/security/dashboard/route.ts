import { NextRequest } from 'next/server';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  invitationScanEvent,
  guestInvitation,
  guest,
  securityPersonnel,
} from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';

// GET /api/mobile-api/security/dashboard - Get security guard's dashboard stats
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

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get guard's scan stats for today
    const todayScans = await db
      .select({
        total: sql<number>`count(*)`,
        successful: sql<number>`sum(case when ${invitationScanEvent.success} = true then 1 else 0 end)`,
        failed: sql<number>`sum(case when ${invitationScanEvent.success} = false then 1 else 0 end)`,
      })
      .from(invitationScanEvent)
      .where(
        and(
          eq(invitationScanEvent.scannedBySecurityPersonnelId, guardId!),
          gte(invitationScanEvent.timestamp, today)
        )
      );

    // Get all-time stats
    const allTimeScans = await db
      .select({
        total: sql<number>`count(*)`,
        successful: sql<number>`sum(case when ${invitationScanEvent.success} = true then 1 else 0 end)`,
        failed: sql<number>`sum(case when ${invitationScanEvent.success} = false then 1 else 0 end)`,
      })
      .from(invitationScanEvent)
      .where(eq(invitationScanEvent.scannedBySecurityPersonnelId, guardId!));

    // Get recent scan activity (last 10)
    const recentScans = await db
      .select({
        id: invitationScanEvent.id,
        timestamp: invitationScanEvent.timestamp,
        success: invitationScanEvent.success,
        failureReason: invitationScanEvent.failureReason,
        securityLevel: invitationScanEvent.usedSecurityLevel,
        guestName: guest.name,
        guestPhone: guest.phone,
        invitationStatus: guestInvitation.status,
      })
      .from(invitationScanEvent)
      .innerJoin(guestInvitation, eq(invitationScanEvent.invitationId, guestInvitation.id))
      .leftJoin(guest, eq(guestInvitation.guestId, guest.id))
      .where(eq(invitationScanEvent.scannedBySecurityPersonnelId, guardId!))
      .orderBy(desc(invitationScanEvent.timestamp))
      .limit(10);

    // Get active invitations count for the guard's organization
    const guardInfo = await db
      .select({
        organizationNodeId: securityPersonnel.organizationNodeId,
      })
      .from(securityPersonnel)
      .where(eq(securityPersonnel.id, guardId!))
      .limit(1);

    let activeInvitationsCount = 0;
    if (guardInfo.length > 0) {
      const activeInvitations = await db
        .select({ count: sql<number>`count(*)` })
        .from(guestInvitation)
        .where(
          and(
            eq(guestInvitation.organizationNodeId, guardInfo[0].organizationNodeId),
            eq(guestInvitation.status, 'active')
          )
        );
      activeInvitationsCount = Number(activeInvitations[0]?.count || 0);
    }

    // Calculate success rate
    const todayTotal = Number(todayScans[0]?.total || 0);
    const todaySuccessful = Number(todayScans[0]?.successful || 0);
    const todaySuccessRate = todayTotal > 0 ? Math.round((todaySuccessful / todayTotal) * 100) : 0;

    const allTimeTotal = Number(allTimeScans[0]?.total || 0);
    const allTimeSuccessful = Number(allTimeScans[0]?.successful || 0);
    const allTimeSuccessRate = allTimeTotal > 0 ? Math.round((allTimeSuccessful / allTimeTotal) * 100) : 0;

    return successResponse({
      stats: {
        today: {
          total: todayTotal,
          successful: todaySuccessful,
          failed: Number(todayScans[0]?.failed || 0),
          successRate: todaySuccessRate,
        },
        allTime: {
          total: allTimeTotal,
          successful: allTimeSuccessful,
          failed: Number(allTimeScans[0]?.failed || 0),
          successRate: allTimeSuccessRate,
        },
        activeInvitations: activeInvitationsCount,
      },
      recentActivity: recentScans.map(scan => ({
        id: scan.id,
        timestamp: scan.timestamp,
        success: scan.success,
        failureReason: scan.failureReason,
        securityLevel: scan.securityLevel,
        guestName: scan.guestName || 'Unknown Guest',
        guestPhone: scan.guestPhone || 'N/A',
        invitationStatus: scan.invitationStatus,
      })),
    }, 'Dashboard data retrieved successfully');

  } catch (error) {
    console.error('Security dashboard error:', error);
    return serverErrorResponse('Failed to fetch dashboard data');
  }
}
