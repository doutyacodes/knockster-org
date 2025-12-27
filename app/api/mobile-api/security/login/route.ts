import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { securityPersonnel, guardDevice, organizationNode } from '@/db/schema';
import { verifyPassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

// POST /api/mobile-api/security/login - Security personnel login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, deviceInfo } = body;

    if (!username || !password) {
      return errorResponse('Username and password are required', 400);
    }

    // Find security personnel by username
    const personnel = await db
      .select()
      .from(securityPersonnel)
      .where(eq(securityPersonnel.username, username))
      .limit(1);

    if (personnel.length === 0) {
      return errorResponse('Invalid credentials', 401);
    }

    const guard = personnel[0];

    // Check if guard is active
    if (guard.status === 'disabled') {
      return errorResponse('Account is disabled. Contact administrator.', 403);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, guard.passwordHash);
    if (!isPasswordValid) {
      return errorResponse('Invalid credentials', 401);
    }

    // Check if device needs to be force logged out
    const existingDevice = await db
      .select()
      .from(guardDevice)
      .where(eq(guardDevice.securityPersonnelId, guard.id))
      .limit(1);

    if (existingDevice.length > 0 && existingDevice[0].forceLogout) {
      // Delete old device session
      await db
        .delete(guardDevice)
        .where(eq(guardDevice.securityPersonnelId, guard.id));
    }

    // Register/update device if provided
    if (deviceInfo) {
      const { deviceId, deviceModel, osVersion } = deviceInfo;

      // Delete existing device for this guard
      await db
        .delete(guardDevice)
        .where(eq(guardDevice.securityPersonnelId, guard.id));

      // Insert new device
      await db.insert(guardDevice).values({
        securityPersonnelId: guard.id,
        deviceModel: deviceModel || 'unknown',
        osVersion: osVersion || 'unknown',
        lastActive: new Date(),
        forceLogout: false,
      });
    }

    // Update last active
    await db
      .update(securityPersonnel)
      .set({ lastActive: new Date() })
      .where(eq(securityPersonnel.id, guard.id));

    // Get organization info
    const orgInfo = await db
      .select({
        id: organizationNode.id,
        name: organizationNode.name,
        type: organizationNode.type,
      })
      .from(organizationNode)
      .where(eq(organizationNode.id, guard.organizationNodeId))
      .limit(1);

    // Generate JWT token
    const token = generateToken({
      id: guard.id,
      username: guard.username,
      role: 'guard',
      organizationNodeId: guard.organizationNodeId,
    });

    return successResponse({
      token,
      guard: {
        id: guard.id,
        username: guard.username,
        status: guard.status,
        shiftStartTime: guard.shiftStartTime,
        shiftEndTime: guard.shiftEndTime,
        organization: orgInfo[0] || null,
      },
    }, 'Login successful');

  } catch (error) {
    console.error('Security login error:', error);
    return errorResponse('Login failed', 500);
  }
}
