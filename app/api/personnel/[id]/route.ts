import { NextRequest } from 'next/server';
import { eq, and, desc, count, sql, ne } from 'drizzle-orm';
import { db } from '@/db';
import { securityPersonnel, guardDevice, invitationScanEvent } from '@/db/schema';
import { authenticateRequest, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';

// GET /api/personnel/[id] - Get specific personnel with details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Fetch personnel with device details
    const [personnelData] = await db
      .select({
        id: securityPersonnel.id,
        username: securityPersonnel.username,
        shiftStart: securityPersonnel.shiftStartTime,
        shiftEnd: securityPersonnel.shiftEndTime,
        status: securityPersonnel.status,
        createdAt: securityPersonnel.createdAt,
        deviceId: guardDevice.id,
        deviceModel: guardDevice.deviceModel,
        deviceOs: guardDevice.osVersion,
        lastSeenAt: guardDevice.lastActive,
      })
      .from(securityPersonnel)
      .leftJoin(guardDevice, eq(securityPersonnel.id, guardDevice.securityPersonnelId))
      .where(
        and(
          eq(securityPersonnel.id, id),
          eq(securityPersonnel.organizationNodeId, organizationNodeId!)
        )
      )
      .limit(1);

    if (!personnelData) {
      return notFoundResponse('Personnel not found');
    }

    // Transform status enum to boolean for frontend
    const personnel = {
      ...personnelData,
      isActive: personnelData.status === 'active',
    };

    // Fetch scan history (recent scans performed by this guard)
    const scanHistoryData = await db
      .select({
        id: invitationScanEvent.id,
        scannedAt: invitationScanEvent.timestamp,
        success: invitationScanEvent.success,
        failureReason: invitationScanEvent.failureReason,
        invitationId: invitationScanEvent.invitationId,
        securityLevel: invitationScanEvent.usedSecurityLevel,
      })
      .from(invitationScanEvent)
      .where(eq(invitationScanEvent.scannedBySecurityPersonnelId, id))
      .orderBy(desc(invitationScanEvent.timestamp))
      .limit(10);

    // Transform scan history for frontend
    const scanHistory = scanHistoryData.map(scan => ({
      ...scan,
      scanResult: scan.success ? 'SUCCESS' : 'FAILED',
    }));

    // Count total scans
    const [{ totalScans }] = await db
      .select({ totalScans: count() })
      .from(invitationScanEvent)
      .where(eq(invitationScanEvent.scannedBySecurityPersonnelId, id));

    // Count successful scans
    const [{ successfulScans }] = await db
      .select({ successfulScans: count() })
      .from(invitationScanEvent)
      .where(
        and(
          eq(invitationScanEvent.scannedBySecurityPersonnelId, id),
          eq(invitationScanEvent.success, true)
        )
      );

    return successResponse({
      ...personnel,
      scanHistory,
      stats: {
        totalScans,
        successfulScans,
        successRate: totalScans > 0 ? ((successfulScans / totalScans) * 100).toFixed(1) : '0',
      },
    });
  } catch (error) {
    console.error('Get personnel error:', error);
    return errorResponse('An error occurred while fetching personnel', 500);
  }
}

// PATCH /api/personnel/[id] - Update personnel (username, shift, status)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const body = await req.json();
    const { username, password, shiftStart, shiftEnd, isActive, unbindDevice } = body;

    // Check if personnel exists and belongs to this org
    const [existingPersonnel] = await db
      .select()
      .from(securityPersonnel)
      .where(
        and(
          eq(securityPersonnel.id, id),
          eq(securityPersonnel.organizationNodeId, organizationNodeId!)
        )
      )
      .limit(1);

    if (!existingPersonnel) {
      return notFoundResponse('Personnel not found');
    }

    // Build update object
    const updateData: any = {};

    if (username) {
      // Check if new username already exists (excluding current user)
      const [existing] = await db
        .select()
        .from(securityPersonnel)
        .where(
          and(
            eq(securityPersonnel.username, username),
            ne(securityPersonnel.id, id)
          )
        )
        .limit(1);

      if (existing) {
        return errorResponse('Username already exists', 400);
      }

      updateData.username = username;
    }

    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    if (shiftStart !== undefined) {
      updateData.shiftStartTime = shiftStart;
    }

    if (shiftEnd !== undefined) {
      updateData.shiftEndTime = shiftEnd;
    }

    if (isActive !== undefined) {
      // Convert boolean to enum
      updateData.status = isActive ? 'active' : 'disabled';

      // If deactivating, also force logout (set forceLogout flag on device)
      if (!isActive) {
        await db
          .update(guardDevice)
          .set({ forceLogout: true })
          .where(eq(guardDevice.securityPersonnelId, id));
      }
    }

    // Unbind device if requested
    if (unbindDevice) {
      await db
        .delete(guardDevice)
        .where(eq(guardDevice.securityPersonnelId, id));
    }

    // Update personnel
    await db
      .update(securityPersonnel)
      .set(updateData)
      .where(eq(securityPersonnel.id, id));

    // Fetch updated personnel
    const [updatedPersonnelData] = await db
      .select({
        id: securityPersonnel.id,
        username: securityPersonnel.username,
        shiftStart: securityPersonnel.shiftStartTime,
        shiftEnd: securityPersonnel.shiftEndTime,
        status: securityPersonnel.status,
        createdAt: securityPersonnel.createdAt,
      })
      .from(securityPersonnel)
      .where(eq(securityPersonnel.id, id))
      .limit(1);

    // Transform status enum to boolean for frontend
    const updatedPersonnel = {
      ...updatedPersonnelData,
      isActive: updatedPersonnelData.status === 'active',
    };

    return successResponse(updatedPersonnel);
  } catch (error) {
    console.error('Update personnel error:', error);
    return errorResponse('An error occurred while updating personnel', 500);
  }
}
