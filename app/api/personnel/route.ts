import { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { securityPersonnel, guardDevice } from '@/db/schema';
import { authenticateRequest, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { toIST, formatTimeIST, parseTimeToUTC } from '@/lib/timezone';

// GET /api/personnel - Get all security personnel for the org
export async function GET(req: NextRequest) {
  try {
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
    const personnel = await db
      .select({
        id: securityPersonnel.id,
        username: securityPersonnel.username,
        shiftStart: securityPersonnel.shiftStartTime,
        shiftEnd: securityPersonnel.shiftEndTime,
        isActive: securityPersonnel.status,
        createdAt: securityPersonnel.createdAt,
        deviceId: guardDevice.id,
        deviceModel: guardDevice.deviceModel,
        deviceOs: guardDevice.osVersion,
        lastSeenAt: guardDevice.lastActive,
      })
      .from(securityPersonnel)
      .leftJoin(guardDevice, eq(securityPersonnel.id, guardDevice.securityPersonnelId))
      .where(eq(securityPersonnel.organizationNodeId, organizationNodeId!))
      .orderBy(desc(securityPersonnel.createdAt));

    // Transform status enum to boolean and convert dates to IST
    const transformedPersonnel = personnel.map(p => ({
      ...p,
      isActive: p.isActive === 'active',
      shiftStart: formatTimeIST(p.shiftStart),
      shiftEnd: formatTimeIST(p.shiftEnd),
      createdAt: toIST(p.createdAt),
      lastSeenAt: toIST(p.lastSeenAt),
    }));

    return successResponse(transformedPersonnel);
  } catch (error) {
    console.error('Get personnel error:', error);
    return errorResponse('An error occurred while fetching personnel', 500);
  }
}

// POST /api/personnel - Create new security personnel
export async function POST(req: NextRequest) {
  try {
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
    const { username, password, shiftStart, shiftEnd } = body;

    // Validate required fields
    if (!username || !password) {
      return errorResponse('Username and password are required', 400);
    }

    // Check if username already exists
    const [existing] = await db
      .select()
      .from(securityPersonnel)
      .where(eq(securityPersonnel.username, username))
      .limit(1);

    if (existing) {
      return errorResponse('Username already exists', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Convert shift times from IST to UTC if provided
    const shiftStartUTC = shiftStart ? parseTimeToUTC(shiftStart) : null;
    const shiftEndUTC = shiftEnd ? parseTimeToUTC(shiftEnd) : null;

    // Create personnel
    const [newPersonnel] = await db
      .insert(securityPersonnel)
      .values({
        organizationNodeId: organizationNodeId!,
        username,
        passwordHash,
        shiftStartTime: shiftStartUTC,
        shiftEndTime: shiftEndUTC,
        status: 'active',
      })
      .$returningId();

    // Fetch the created personnel
    const [personnel] = await db
      .select({
        id: securityPersonnel.id,
        username: securityPersonnel.username,
        shiftStart: securityPersonnel.shiftStartTime,
        shiftEnd: securityPersonnel.shiftEndTime,
        isActive: securityPersonnel.status,
        createdAt: securityPersonnel.createdAt,
      })
      .from(securityPersonnel)
      .where(eq(securityPersonnel.id, newPersonnel.id))
      .limit(1);

    // Transform status to boolean and convert dates to IST
    const transformed = {
      ...personnel,
      isActive: personnel.isActive === 'active',
      shiftStart: formatTimeIST(personnel.shiftStart),
      shiftEnd: formatTimeIST(personnel.shiftEnd),
      createdAt: toIST(personnel.createdAt),
    };

    return successResponse(transformed, 201);
  } catch (error) {
    console.error('Create personnel error:', error);
    return errorResponse('An error occurred while creating personnel', 500);
  }
}
