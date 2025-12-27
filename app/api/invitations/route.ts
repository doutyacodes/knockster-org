import { NextRequest } from 'next/server';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { guestInvitation, guest, orgAdmin } from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// Map database status to frontend status
const mapStatusToFrontend = (dbStatus: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Active',
    'pending': 'Upcoming',
    'expired': 'Expired',
    'revoked': 'Revoked'
  };
  return statusMap[dbStatus] || dbStatus;
};

// Map frontend status to database status
const mapStatusToDatabase = (frontendStatus: string): 'active' | 'pending' | 'expired' | 'revoked' => {
  const statusMap: Record<string, 'active' | 'pending' | 'expired' | 'revoked'> = {
    'Active': 'active',
    'Upcoming': 'pending',
    'Expired': 'expired',
    'Revoked': 'revoked'
  };
  return statusMap[frontendStatus] || 'pending';
};

// Map database security level to frontend format
const mapSecurityLevelToFrontend = (level: number): string => {
  return `L${level}`;
};

// GET /api/invitations - Get all invitations for the org admin
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

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Build query conditions
    const conditions = [eq(guestInvitation.organizationNodeId, organizationNodeId!)];

    if (status && status !== 'all') {
      // Map frontend status to database status
      const dbStatus = mapStatusToDatabase(status);
      conditions.push(eq(guestInvitation.status, dbStatus));
    }

    // Fetch invitations with guest details
    const invitations = await db
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
      .where(and(...conditions))
      .orderBy(desc(guestInvitation.createdAt));

    // Transform to frontend format
    const transformedInvitations = invitations.map(inv => ({
      id: inv.id,
      employeeName: inv.employeeName,
      employeePhone: inv.employeePhone,
      guestName: inv.guestName || 'Unknown',
      guestPhone: inv.guestPhone || 'N/A',
      validFrom: inv.validFrom.toISOString(),
      validTo: inv.validTo.toISOString(),
      securityLevel: mapSecurityLevelToFrontend(inv.securityLevel!),
      status: mapStatusToFrontend(inv.status),
      createdAt: inv.createdAt.toISOString(),
    }));

    return successResponse(transformedInvitations);
  } catch (error) {
    console.error('Get invitations error:', error);
    return errorResponse('An error occurred while fetching invitations', 500);
  }
}

// POST /api/invitations - Create a new invitation
export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(req);

    if (!authResult.success || !authResult.payload) {
      return unauthorizedResponse('Unauthorized');
    }

    const { organizationNodeId, role, id: adminId } = authResult.payload;

    // Only org admins can access this endpoint
    if (role !== 'orgadmin') {
      return unauthorizedResponse('Unauthorized');
    }

    const body = await req.json();
    const {
      employeeName,
      employeePhone,
      guestName,
      guestPhone,
      validFrom,
      validTo,
      securityLevel,
    } = body;

    // Validate required fields
    if (!employeeName || !employeePhone || !guestName || !guestPhone || !validFrom || !validTo || !securityLevel) {
      return errorResponse('All fields are required', 400);
    }

    // Parse security level (convert L1, L2, L3, L4 to 1, 2, 3, 4)
    const securityLevelNum = parseInt(securityLevel.replace('L', ''));
    
    // Validate security level
    if (![1, 2, 3, 4].includes(securityLevelNum)) {
      return errorResponse('Invalid security level', 400);
    }

    // Validate date range
    const validFromDate = new Date(validFrom);
    const validToDate = new Date(validTo);

    if (validFromDate >= validToDate) {
      return errorResponse('validTo must be after validFrom', 400);
    }

    // Find or create guest
    let [existingGuest] = await db
      .select()
      .from(guest)
      .where(eq(guest.phone, guestPhone))
      .limit(1);

    let guestId: string;

    if (existingGuest) {
      guestId = existingGuest.id;
      // Update guest name if it has changed
      if (existingGuest.name !== guestName) {
        await db
          .update(guest)
          .set({ name: guestName })
          .where(eq(guest.id, existingGuest.id));
      }
    } else {
      // Create new guest
      const [newGuest] = await db
        .insert(guest)
        .values({
          name: guestName,
          phone: guestPhone,
        })
        .$returningId();

      guestId = newGuest.id;
    }

    // Determine status based on dates
    const now = new Date();
    let status: 'pending' | 'active' | 'expired' | 'revoked' = 'pending';

    if (validFromDate > now) {
      status = 'pending'; // Upcoming
    } else if (validToDate < now) {
      status = 'expired';
    } else {
      status = 'active';
    }

    // Create invitation
    const [newInvitation] = await db
      .insert(guestInvitation)
      .values({
        guestId,
        organizationNodeId: organizationNodeId!,
        createdByOrgAdminId: adminId!,
        employeeName,
        employeePhone,
        validFrom: validFromDate,
        validTo: validToDate,
        requestedSecurityLevel: securityLevelNum,
        status,
      })
      .$returningId();

    // Fetch the created invitation with guest details
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
      .where(eq(guestInvitation.id, newInvitation.id))
      .limit(1);

    // Transform to frontend format
    const transformedInvitation = {
      id: invitation.id,
      employeeName: invitation.employeeName,
      employeePhone: invitation.employeePhone,
      guestName: invitation.guestName || 'Unknown',
      guestPhone: invitation.guestPhone || 'N/A',
      validFrom: invitation.validFrom.toISOString(),
      validTo: invitation.validTo.toISOString(),
      securityLevel: mapSecurityLevelToFrontend(invitation.securityLevel!),
      status: mapStatusToFrontend(invitation.status),
      createdAt: invitation.createdAt.toISOString(),
    };

    // TODO: Send invitation email/SMS to guest

    return successResponse(transformedInvitation, 201);
  } catch (error) {
    console.error('Create invitation error:', error);
    return errorResponse('An error occurred while creating invitation', 500);
  }
}