import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { securityPersonnel, organizationNode } from '@/db/schema';
import { authenticateRequest, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response';
import { toIST, formatTimeIST } from '@/lib/timezone';

// GET /api/mobile-api/security/profile - Get security guard's profile
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

    // Get guard profile with organization details
    const guardData = await db
      .select({
        id: securityPersonnel.id,
        username: securityPersonnel.username,
        status: securityPersonnel.status,
        shiftStartTime: securityPersonnel.shiftStartTime,
        shiftEndTime: securityPersonnel.shiftEndTime,
        createdAt: securityPersonnel.createdAt,
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

    return successResponse({
      id: guard.id,
      username: guard.username,
      status: guard.status,
      shiftStartTime: formatTimeIST(guard.shiftStartTime),
      shiftEndTime: formatTimeIST(guard.shiftEndTime),
      createdAt: toIST(guard.createdAt),
      organization: {
        id: guard.organizationNodeId,
        name: guard.orgName || 'Unknown Organization',
        type: guard.orgType || 'unknown',
      },
    }, 'Profile retrieved successfully');

  } catch (error) {
    console.error('Security profile GET error:', error);
    return serverErrorResponse('Failed to fetch profile');
  }
}

// PATCH /api/mobile-api/security/profile - Update security guard's profile
export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    // Currently only supporting password change
    // Future: Support shift time updates, notification preferences, etc.

    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required', 400);
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return errorResponse('New password must be at least 8 characters long', 400);
    }

    // Get current guard data
    const guardData = await db
      .select({
        id: securityPersonnel.id,
        passwordHash: securityPersonnel.passwordHash,
      })
      .from(securityPersonnel)
      .where(eq(securityPersonnel.id, guardId!))
      .limit(1);

    if (guardData.length === 0) {
      return unauthorizedResponse('Guard not found');
    }

    const guard = guardData[0];

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, guard.passwordHash);

    if (!isCurrentPasswordValid) {
      return errorResponse('Current password is incorrect', 401);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db
      .update(securityPersonnel)
      .set({ passwordHash: newPasswordHash })
      .where(eq(securityPersonnel.id, guardId!));

    return successResponse({
      message: 'Password updated successfully. Please log in again.',
    }, 'Password updated successfully');

  } catch (error) {
    console.error('Security profile PATCH error:', error);
    return serverErrorResponse('Failed to update profile');
  }
}
