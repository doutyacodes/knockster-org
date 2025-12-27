import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { securityPersonnel, organizationNode } from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import crypto from 'crypto';

// GET /api/mobile-api/security/qr - Get security guard's QR code and profile
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

    // Get guard details
    const guardData = await db
      .select({
        id: securityPersonnel.id,
        username: securityPersonnel.username,
        status: securityPersonnel.status,
        shiftStartTime: securityPersonnel.shiftStartTime,
        shiftEndTime: securityPersonnel.shiftEndTime,
        organizationNodeId: securityPersonnel.organizationNodeId,
        orgName: organizationNode.name,
        orgType: organizationNode.type,
      })
      .from(securityPersonnel)
      .leftJoin(organizationNode, eq(securityPersonnel.organizationNodeId, organizationNode.id))
      .where(eq(securityPersonnel.id, guardId!))
      .limit(1);

    if (guardData.length === 0) {
      return unauthorizedResponse('Guard not found');
    }

    const guard = guardData[0];

    // Check if guard is active
    if (guard.status === 'disabled') {
      return unauthorizedResponse('Account is disabled');
    }

    // Generate QR code data (for L3/L4 scans)
    // This QR contains guard ID + timestamp for verification
    const qrData = {
      guardId: guard.id,
      organizationNodeId: guard.organizationNodeId,
      timestamp: new Date().toISOString(),
      type: 'security_qr',
      // Add signature to prevent tampering
      signature: crypto
        .createHash('sha256')
        .update(`${guard.id}-${guard.organizationNodeId}-${process.env.JWT_SECRET}`)
        .digest('hex'),
    };

    // Convert to string for QR code generation on mobile
    const qrCodeString = JSON.stringify(qrData);

    return successResponse({
      qrCode: qrCodeString,
      profile: {
        id: guard.id,
        username: guard.username,
        status: guard.status,
        shiftStartTime: guard.shiftStartTime,
        shiftEndTime: guard.shiftEndTime,
        organization: {
          id: guard.organizationNodeId,
          name: guard.orgName || 'Unknown Organization',
          type: guard.orgType || 'unknown',
        },
      },
    }, 'QR code generated successfully');

  } catch (error) {
    console.error('Security QR error:', error);
    return serverErrorResponse('Failed to generate QR code');
  }
}
