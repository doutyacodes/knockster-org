import { NextRequest } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { guestInvitation, guest, invitationScanEvent, guestQrSession, guestOtp } from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';

// GET /api/invitations/[id] - Get a specific invitation with details
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

    // Fetch invitation with guest details
    const [invitation] = await db
      .select({
        id: guestInvitation.id,
        guestId: guestInvitation.guestId,
        guestName: guest.name,
        guestPhone: guest.phone,
        employeeName: guestInvitation.employeeName,
        employeePhone: guestInvitation.employeePhone,
        validFrom: guestInvitation.validFrom,
        validTo: guestInvitation.validTo,
        securityLevel: guestInvitation.requestedSecurityLevel,
        status: guestInvitation.status,
        createdAt: guestInvitation.createdAt,
      })
      .from(guestInvitation)
      .leftJoin(guest, eq(guestInvitation.guestId, guest.id))
      .where(
        and(
          eq(guestInvitation.id, id),
          eq(guestInvitation.organizationNodeId, organizationNodeId!)
        )
      )
      .limit(1);

    if (!invitation) {
      return notFoundResponse('Invitation not found');
    }

    // Ensure guest name has a fallback
    const invitationData = {
      ...invitation,
      guestName: invitation.guestName || 'Unknown',
      guestPhone: invitation.guestPhone || 'N/A',
    };

    // Fetch recent scan events for this invitation
    const scanEventsData = await db
      .select({
        id: invitationScanEvent.id,
        scannedAt: invitationScanEvent.timestamp,
        success: invitationScanEvent.success,
        failureReason: invitationScanEvent.failureReason,
        securityLevel: invitationScanEvent.usedSecurityLevel,
      })
      .from(invitationScanEvent)
      .where(eq(invitationScanEvent.invitationId, id))
      .orderBy(desc(invitationScanEvent.timestamp))
      .limit(10);

    // Transform scan events for frontend
    const scanEvents = scanEventsData.map(scan => ({
      id: scan.id,
      scannedAt: scan.scannedAt,
      scanResult: scan.success ? 'SUCCESS' : 'FAILED',
      failureReason: scan.failureReason,
      securityLevel: scan.securityLevel,
    }));

    // Fetch active QR session if exists
    const [qrSession] = await db
      .select({
        id: guestQrSession.id,
        qrCode: guestQrSession.rotatingKey,
        expiresAt: guestQrSession.expiresAt,
      })
      .from(guestQrSession)
      .where(eq(guestQrSession.invitationId, id))
      .orderBy(desc(guestQrSession.createdAt))
      .limit(1);

    return successResponse({
      ...invitationData,
      scanEvents,
      qrSession: qrSession || null,
    });
  } catch (error) {
    console.error('Get invitation error:', error);
    return errorResponse('An error occurred while fetching invitation', 500);
  }
}

// PATCH /api/invitations/[id] - Update an invitation (e.g., revoke)
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
    const { status, validFrom, validTo, securityLevel } = body;

    // Check if invitation exists and belongs to this org
    const [existingInvitation] = await db
      .select()
      .from(guestInvitation)
      .where(
        and(
          eq(guestInvitation.id, id),
          eq(guestInvitation.organizationNodeId, organizationNodeId!)
        )
      )
      .limit(1);

    if (!existingInvitation) {
      return notFoundResponse('Invitation not found');
    }

    // Build update object
    const updateData: any = {};

    if (status) {
      const validStatuses = ['active', 'pending', 'expired', 'revoked'];
      if (!validStatuses.includes(status.toLowerCase())) {
        return errorResponse('Invalid status', 400);
      }
      updateData.status = status.toLowerCase();
    }

    if (validFrom) {
      updateData.validFrom = new Date(validFrom);
    }

    if (validTo) {
      updateData.validTo = new Date(validTo);
    }

    if (securityLevel) {
      if (![1, 2, 3, 4].includes(securityLevel)) {
        return errorResponse('Invalid security level', 400);
      }
      updateData.requestedSecurityLevel = securityLevel;
    }

    // Update invitation
    await db
      .update(guestInvitation)
      .set(updateData)
      .where(eq(guestInvitation.id, id));

    // Fetch updated invitation
    const [updatedInvitation] = await db
      .select({
        id: guestInvitation.id,
        guestId: guestInvitation.guestId,
        guestName: guest.name,
        guestPhone: guest.phone,
        employeeName: guestInvitation.employeeName,
        employeePhone: guestInvitation.employeePhone,
        validFrom: guestInvitation.validFrom,
        validTo: guestInvitation.validTo,
        securityLevel: guestInvitation.requestedSecurityLevel,
        status: guestInvitation.status,
        createdAt: guestInvitation.createdAt,
      })
      .from(guestInvitation)
      .leftJoin(guest, eq(guestInvitation.guestId, guest.id))
      .where(eq(guestInvitation.id, id))
      .limit(1);

    if (!updatedInvitation) {
      return notFoundResponse('Invitation not found after update');
    }

    // Ensure guest data has fallbacks
    const responseData = {
      ...updatedInvitation,
      guestName: updatedInvitation.guestName || 'Unknown',
      guestPhone: updatedInvitation.guestPhone || 'N/A',
    };

    return successResponse(responseData);
  } catch (error) {
    console.error('Update invitation error:', error);
    return errorResponse('An error occurred while updating invitation', 500);
  }
}

// DELETE /api/invitations/[id] - Delete an invitation
export async function DELETE(
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

    // Check if invitation exists and belongs to this org
    const [existingInvitation] = await db
      .select()
      .from(guestInvitation)
      .where(
        and(
          eq(guestInvitation.id, id),
          eq(guestInvitation.organizationNodeId, organizationNodeId!)
        )
      )
      .limit(1);

    if (!existingInvitation) {
      return notFoundResponse('Invitation not found');
    }

    // Delete related records first
    await db.delete(guestQrSession).where(eq(guestQrSession.invitationId, id));
    await db.delete(guestOtp).where(eq(guestOtp.invitationId, id));

    // Note: We keep scan events for audit purposes

    // Delete invitation
    await db.delete(guestInvitation).where(eq(guestInvitation.id, id));

    return successResponse({ message: 'Invitation deleted successfully' });
  } catch (error) {
    console.error('Delete invitation error:', error);
    return errorResponse('An error occurred while deleting invitation', 500);
  }
}
