import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import {
  guestInvitation,
  securityPersonnel,
  organizationNode,
  invitationScanEvent,
  guestOtp,
} from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import crypto from 'crypto';

// POST /api/mobile-api/guest/scan-security - Guest scans security QR (L3/L4)
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { securityQrCode } = body;

    if (!securityQrCode) {
      return errorResponse('Security QR code is required', 400);
    }

    // Parse security QR code
    let qrData: any;
    try {
      qrData = JSON.parse(securityQrCode);
    } catch {
      return errorResponse('Invalid QR code format', 400);
    }

    const { guardId, organizationNodeId: guardOrgId, signature, type } = qrData;

    if (type !== 'security_qr') {
      return errorResponse('Invalid security QR code', 400);
    }

    // Verify signature
    const expectedSignature = crypto
      .createHash('sha256')
      .update(`${guardId}-${guardOrgId}-${process.env.JWT_SECRET}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      return errorResponse('Invalid or tampered QR code', 400);
    }

    // Get guard details
    const guardData = await db
      .select({
        id: securityPersonnel.id,
        username: securityPersonnel.username,
        status: securityPersonnel.status,
        organizationNodeId: securityPersonnel.organizationNodeId,
        orgName: organizationNode.name,
        orgType: organizationNode.type,
      })
      .from(securityPersonnel)
      .leftJoin(organizationNode, eq(securityPersonnel.organizationNodeId, organizationNode.id))
      .where(eq(securityPersonnel.id, guardId))
      .limit(1);

    if (guardData.length === 0) {
      return errorResponse('Security guard not found', 404);
    }

    const guard = guardData[0];

    if (guard.status === 'disabled') {
      return errorResponse('Security guard is disabled', 403);
    }

    // Find active invitations for this guest
    // Priority: L4 > L3 > L2 > L1 (highest security level takes precedence)
    const now = new Date();

    const activeInvitations = await db
      .select({
        id: guestInvitation.id,
        employeeName: guestInvitation.employeeName,
        employeePhone: guestInvitation.employeePhone,
        validFrom: guestInvitation.validFrom,
        validTo: guestInvitation.validTo,
        securityLevel: guestInvitation.requestedSecurityLevel,
        status: guestInvitation.status,
        organizationNodeId: guestInvitation.organizationNodeId,
        orgName: organizationNode.name,
      })
      .from(guestInvitation)
      .leftJoin(organizationNode, eq(guestInvitation.organizationNodeId, organizationNode.id))
      .where(
        and(
          eq(guestInvitation.guestId, guestId!),
          eq(guestInvitation.status, 'active')
        )
      )
      .orderBy(guestInvitation.requestedSecurityLevel); // Will pick highest

    if (activeInvitations.length === 0) {
      return errorResponse('No active invitations found', 404);
    }

    // Find the highest security level invitation
    const invitation = activeInvitations[activeInvitations.length - 1];

    // Check if invitation requires L3 or L4
    if (invitation.securityLevel !== 3 && invitation.securityLevel !== 4) {
      return errorResponse('This invitation does not support app-based authentication', 400);
    }

    // Check time validity
    const validFrom = new Date(invitation.validFrom);
    const validTo = new Date(invitation.validTo);

    if (now < validFrom) {
      await logScanEvent(guardId, invitation.id, invitation.securityLevel!, false, 'Not yet valid');
      return errorResponse(`This invitation is not valid until ${validFrom.toLocaleString()}`, 403);
    }

    if (now > validTo) {
      await logScanEvent(guardId, invitation.id, invitation.securityLevel!, false, 'Time expired');
      return errorResponse('This invitation time period has expired', 403);
    }

    // Check if invitation is revoked
    if (invitation.status === 'revoked') {
      await logScanEvent(guardId, invitation.id, invitation.securityLevel!, false, 'Invitation revoked');
      return errorResponse('This invitation has been revoked', 403);
    }

    // Check organization hierarchy
    const isPreApproved = await checkOrganizationHierarchy(guardOrgId, invitation.organizationNodeId);

    // For L3: Direct approval (guest app authenticated + security scan)
    if (invitation.securityLevel === 3) {
      // Log successful scan
      await logScanEvent(guardId, invitation.id, 3, true, null);

      // Return success to guest app
      return successResponse({
        scanResult: 'success',
        requiresOtp: false,
        message: 'Access granted - Level 3',
        invitation: {
          id: invitation.id,
          employeeName: invitation.employeeName,
          employeePhone: invitation.employeePhone,
          securityLevel: invitation.securityLevel,
          validFrom: invitation.validFrom,
          validTo: invitation.validTo,
          organization: {
            name: invitation.orgName,
          },
          isPreApproved,
        },
        securityGuard: {
          username: guard.username,
          organization: guard.orgName,
        },
      }, 'Access granted - Level 3');
    }

    // For L4: Generate OTP and require verification
    if (invitation.securityLevel === 4) {
      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Delete any existing unverified OTPs for this invitation
      await db
        .delete(guestOtp)
        .where(
          and(
            eq(guestOtp.invitationId, invitation.id),
            eq(guestOtp.verified, false)
          )
        );

      // Create new OTP
      await db.insert(guestOtp).values({
        invitationId: invitation.id,
        otpCode,
        expiresAt: otpExpiresAt,
        verified: false,
      });

      // Return pending status with OTP (guest shows this to security)
      return successResponse({
        scanResult: 'pending_otp',
        requiresOtp: true,
        otpCode, // Guest shows this to security guard
        otpExpiresAt,
        message: 'Show this OTP to the security guard',
        invitation: {
          id: invitation.id,
          employeeName: invitation.employeeName,
          employeePhone: invitation.employeePhone,
          securityLevel: invitation.securityLevel,
          validFrom: invitation.validFrom,
          validTo: invitation.validTo,
          organization: {
            name: invitation.orgName,
          },
          isPreApproved,
        },
        securityGuard: {
          username: guard.username,
          organization: guard.orgName,
        },
      }, 'OTP generated - Show to security guard');
    }

    return errorResponse('Invalid security level', 400);

  } catch (error) {
    console.error('Scan security error:', error);
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

  try {
    let currentOrgId: string | null = invitationOrgId;
    let depth = 0;
    const maxDepth = 10;

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
        return true;
      }

      currentOrgId = org[0].parentId;
      depth++;
    }
  } catch (error) {
    console.error('Organization hierarchy check error:', error);
  }

  return false;
}
