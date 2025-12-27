import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orgAdmin, organizationNode } from '@/db/schema';
import { authenticateRequest, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// GET /api/profile - Get current admin profile
export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(req);

    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { id, role } = authResult.payload;

    // Only org admins can access this endpoint
    if (role !== 'orgadmin') {
      return unauthorizedResponse('Unauthorized');
    }

    // Fetch admin profile with organization info
    const [admin] = await db
      .select({
        id: orgAdmin.id,
        email: orgAdmin.email,
        organizationNodeId: orgAdmin.organizationNodeId,
        organizationName: organizationNode.name,
        organizationType: organizationNode.type,
        createdAt: orgAdmin.createdAt,
      })
      .from(orgAdmin)
      .leftJoin(organizationNode, eq(orgAdmin.organizationNodeId, organizationNode.id))
      .where(eq(orgAdmin.id, id!))
      .limit(1);

    if (!admin) {
      return unauthorizedResponse('Admin not found');
    }

    return successResponse(admin);
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('An error occurred while fetching profile', 500);
  }
}

// PATCH /api/profile - Update current admin profile
export async function PATCH(req: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(req);

    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { id, role } = authResult.payload;

    // Only org admins can access this endpoint
    if (role !== 'orgadmin') {
      return unauthorizedResponse('Unauthorized');
    }

    const body = await req.json();
    const { password } = body;

    // Build update object
    const updateData: any = {};

    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return errorResponse('No fields to update', 400);
    }

    // Update admin
    await db
      .update(orgAdmin)
      .set(updateData)
      .where(eq(orgAdmin.id, id!));

    // Fetch updated profile
    const [updatedAdmin] = await db
      .select({
        id: orgAdmin.id,
        email: orgAdmin.email,
        organizationNodeId: orgAdmin.organizationNodeId,
        createdAt: orgAdmin.createdAt,
      })
      .from(orgAdmin)
      .where(eq(orgAdmin.id, id!))
      .limit(1);

    return successResponse(updatedAdmin);
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('An error occurred while updating profile', 500);
  }
}
