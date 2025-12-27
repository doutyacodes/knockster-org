import { NextRequest } from 'next/server';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { guestInvitation, guest, orgAdmin } from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

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
      // Cast status to the enum type using sql
      conditions.push(sql`${guestInvitation.status} = ${status.toLowerCase()}`);
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

    return successResponse(invitations);
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

    // Validate security level
    if (![1, 2, 3, 4].includes(securityLevel)) {
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
    let status: 'upcoming' | 'active' | 'expired' = 'pending';

    if (validFromDate > now) {
      status = 'upcoming';
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
        createdByOrgAdminId: adminId,
        employeeName,
        employeePhone,
        validFrom: validFromDate,
        validTo: validToDate,
        requestedSecurityLevel: securityLevel,
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

    // TODO: Send invitation email/SMS to guest

    return successResponse(invitation, 201);
  } catch (error) {
    console.error('Create invitation error:', error);
    return errorResponse('An error occurred while creating invitation', 500);
  }
}
