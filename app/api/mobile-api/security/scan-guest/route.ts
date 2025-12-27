import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import {
  guestInvitation,
  guest,
  guestQrSession,
  securityPersonnel,
  invitationScanEvent,
  organizationNode,
} from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import crypto from 'crypto';

// POST /api/mobile-api/security/scan-guest - Scan guest QR code (L1/L2)
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(req);

    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { id: guardId, role, organizationNodeId: guardOrgId } = authResult.payload;

    // Only guards can access this endpoint
    if (role !== 'guard') {
      return unauthorizedResponse('Unauthorized');
    }

    const body = await req.json();
    const { invitationId, qrCode } = body;

    if (!invitationId || !qrCode) {
      return errorResponse('Invitation ID and QR code are required', 400);
    }

    const sessionQrCode = qrCode;

    // Fetch invitation with guest details
    const invitationData = await db
      .select({
        invitationId: guestInvitation.id,
        guestId: guestInvitation.guestId,
        guestName: guest.name,
        guestPhone: guest.phone,
        employeeName: guestInvitation.employeeName,
        employeePhone: guestInvitation.employeePhone,
        validFrom: guestInvitation.validFrom,
        validTo: guestInvitation.validTo,
        securityLevel: guestInvitation.requestedSecurityLevel,
        status: guestInvitation.status,
        organizationNodeId: guestInvitation.organizationNodeId,
        orgName: organizationNode.name,
        orgType: organizationNode.type,
      })
      .from(guestInvitation)
      .leftJoin(guest, eq(guestInvitation.guestId, guest.id))
      .leftJoin(organizationNode, eq(guestInvitation.organizationNodeId, organizationNode.id))
      .where(eq(guestInvitation.id, invitationId))
      .limit(1);

    if (invitationData.length === 0) {
      // Log failed scan
      await logScanEvent(guardId!, invitationId, 1, false, 'Invitation not found');
      return errorResponse('Invalid invitation', 404);
    }

    const invitation = invitationData[0];

    // Validate QR session
    const qrSession = await db
      .select()
      .from(guestQrSession)
      .where(
        and(
          eq(guestQrSession.invitationId, invitationId),
          eq(guestQrSession.rotatingKey, sessionQrCode)
        )
      )
      .limit(1);

    if (qrSession.length === 0) {
      await logScanEvent(guardId!, invitationId, invitation.securityLevel!, false, 'Invalid QR session');
      return errorResponse('Invalid or expired QR code', 400);
    }

    // Check if QR session is expired
    const session = qrSession[0];
    if (new Date() > new Date(session.expiresAt)) {
      await logScanEvent(guardId!, invitationId, invitation.securityLevel!, false, 'QR code expired');
      return errorResponse('QR code has expired. Please refresh.', 400);
    }

    // Check invitation status
    if (invitation.status === 'revoked') {
      await logScanEvent(guardId!, invitationId, invitation.securityLevel!, false, 'Invitation revoked');
      return errorResponse('This invitation has been revoked', 403);
    }

    if (invitation.status === 'expired') {
      await logScanEvent(guardId!, invitationId, invitation.securityLevel!, false, 'Invitation expired');
      return errorResponse('This invitation has expired', 403);
    }

    // Check time validity
    const now = new Date();
    const validFrom = new Date(invitation.validFrom);
    const validTo = new Date(invitation.validTo);

    if (now < validFrom) {
      await logScanEvent(guardId!, invitationId, invitation.securityLevel!, false, 'Not yet valid');
      return errorResponse(`This invitation is not valid until ${validFrom.toLocaleString()}`, 403);
    }

    if (now > validTo) {
      await logScanEvent(guardId!, invitationId, invitation.securityLevel!, false, 'Time expired');
      return errorResponse('This invitation time period has expired', 403);
    }

    // Check organization hierarchy
    // If guard's org is parent or same as invitation's org, pre-approved
    const isPreApproved = await checkOrganizationHierarchy(guardOrgId!, invitation.organizationNodeId);

    // For L1: Direct approval (no OTP needed)
    if (invitation.securityLevel === 1) {
      // Log successful scan
      await logScanEvent(guardId!, invitationId, 1, true, null);

      return successResponse({
        status: 'success',
        message: 'Access granted - Level 1',
        invitation: {
          id: invitation.invitationId,
          guestName: invitation.guestName,
          guestPhone: invitation.guestPhone,
          employeeName: invitation.employeeName,
          employeePhone: invitation.employeePhone,
          securityLevel: invitation.securityLevel,
          validFrom: invitation.validFrom,
          validTo: invitation.validTo,
          organization: {
            name: invitation.orgName,
            type: invitation.orgType,
          },
          isPreApproved,
        },
      });
    }

    // For L2: Requires OTP verification
    if (invitation.securityLevel === 2) {
      // Return pending status, waiting for OTP
      return successResponse({
        status: 'pending_otp',
        message: 'Please verify OTP - Level 2',
        invitation: {
          id: invitation.invitationId,
          guestName: invitation.guestName,
          guestPhone: invitation.guestPhone,
          employeeName: invitation.employeeName,
          employeePhone: invitation.employeePhone,
          securityLevel: invitation.securityLevel,
          validFrom: invitation.validFrom,
          validTo: invitation.validTo,
          organization: {
            name: invitation.orgName,
            type: invitation.orgType,
          },
          isPreApproved,
        },
      });
    }

    // L3 and L4 should use the guest app scan flow
    await logScanEvent(guardId!, invitationId, invitation.securityLevel!, false, 'Wrong security level for this scan method');
    return errorResponse('This invitation requires guest app authentication', 400);

  } catch (error) {
    console.error('Scan guest error:', error);
    return serverErrorResponse('Failed to process scan');
  }
}

// Helper function to log scan events
async function logScanEvent(
  guardId: string,
  invitationId: string,
  securityLevel: number,
  success: boolean,
  failureReason: string | null
) {
  try {
    await db.insert(invitationScanEvent).values({
      invitationId,
      scannedBySecurityPersonnelId: guardId,
      usedSecurityLevel: securityLevel,
      success,
      failureReason,
    });
  } catch (error) {
    console.error('Failed to log scan event:', error);
  }
}

// Helper function to check organization hierarchy
async function checkOrganizationHierarchy(
  guardOrgId: string,
  invitationOrgId: string
): Promise<boolean> {
  if (guardOrgId === invitationOrgId) {
    return true; // Same organization
  }

  // Check if guard's org is parent of invitation's org
  try {
    let currentOrgId: string | null = invitationOrgId;
    let depth = 0;
    const maxDepth = 10; // Prevent infinite loops

    while (currentOrgId && depth < maxDepth) {
      const org = await db
        .select({ parentId: organizationNode.parentId })
        .from(organizationNode)
        .where(eq(organizationNode.id, currentOrgId))
        .limit(1);

      if (org.length === 0 || !org[0].parentId) {
        break;
      }

      if (org[0].parentId === guardOrgId) {
        return true; // Guard's org is parent
      }

      currentOrgId = org[0].parentId;
      depth++;
    }
  } catch (error) {
    console.error('Organization hierarchy check error:', error);
  }

  return false;
}
