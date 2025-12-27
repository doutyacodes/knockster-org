import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { orgAdmin } from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api-response';

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

    // Fetch admin details
    const [admin] = await db
      .select({
        id: orgAdmin.id,
        email: orgAdmin.email,
        organizationNodeId: orgAdmin.organizationNodeId,
        createdAt: orgAdmin.createdAt,
      })
      .from(orgAdmin)
      .where(eq(orgAdmin.id, id!))
      .limit(1);

    if (!admin) {
      return unauthorizedResponse('Admin not found');
    }

    return successResponse(admin);
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('An error occurred', 500);
  }
}
