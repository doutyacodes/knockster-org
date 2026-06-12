import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { visitorType } from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { organizationNodeId, role } = authResult.payload;

    if (role !== 'orgadmin') {
      return unauthorizedResponse('Unauthorized');
    }

    // Fetch visitor types
    const types = await db
      .select()
      .from(visitorType)
      .where(eq(visitorType.organizationNodeId, organizationNodeId!));

    return successResponse(types);
  } catch (error) {
    console.error('Get visitor types error:', error);
    return errorResponse('Failed to fetch visitor types', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { organizationNodeId, role } = authResult.payload;

    if (role !== 'orgadmin') {
      return unauthorizedResponse('Unauthorized');
    }

    const body = await req.json();
    const { name, defaultSecurityLevel } = body;

    if (!name || !defaultSecurityLevel) {
      return errorResponse('Name and defaultSecurityLevel are required', 400);
    }

    const [newType] = await db
      .insert(visitorType)
      .values({
        organizationNodeId: organizationNodeId!,
        name,
        defaultSecurityLevel,
      })
      .$returningId();

    const [created] = await db
      .select()
      .from(visitorType)
      .where(eq(visitorType.id, newType.id))
      .limit(1);

    return successResponse(created, 201);
  } catch (error) {
    console.error('Create visitor type error:', error);
    return errorResponse('Failed to create visitor type', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { organizationNodeId, role } = authResult.payload;

    if (role !== 'orgadmin') {
      return unauthorizedResponse('Unauthorized');
    }

    const body = await req.json();
    const { id, defaultSecurityLevel } = body;

    if (!id || !defaultSecurityLevel) {
      return errorResponse('ID and defaultSecurityLevel are required', 400);
    }

    await db
      .update(visitorType)
      .set({ defaultSecurityLevel })
      .where(
        and(
          eq(visitorType.id, id),
          eq(visitorType.organizationNodeId, organizationNodeId!)
        )
      );

    const [updated] = await db
      .select()
      .from(visitorType)
      .where(eq(visitorType.id, id))
      .limit(1);

    return successResponse(updated);
  } catch (error) {
    console.error('Update visitor type error:', error);
    return errorResponse('Failed to update visitor type', 500);
  }
}
