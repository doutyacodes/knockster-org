import { NextRequest } from 'next/server';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { db } from '@/db';
import { orgAdmin, organizationNode, auditLog } from '@/db/schema';
import { zuppdateEvents, zuppdateEventSecurity } from '@/db/zuppdate-schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { toIST } from '@/lib/timezone';

/**
 * Zuppdate events asking to be hosted at this organisation's gate.
 *
 * An organiser can nominate a venue from Zuppdate, but nobody may issue passes
 * into somebody else's door unilaterally — so a request lands here and the
 * venue's own admin decides.
 *
 * Scoped to the admin's own node AND its descendants, matching how the rest of
 * this product treats hierarchy: an admin for a tech park should see requests
 * aimed at its buildings, not just at the park itself.
 */

async function descendantIds(parentIds: string[]): Promise<string[]> {
  if (parentIds.length === 0) return [];
  const children = await db
    .select({ id: organizationNode.id })
    .from(organizationNode)
    .where(inArray(organizationNode.parentId, parentIds));
  if (children.length === 0) return [];
  const ids = children.map((c) => c.id);
  return [...ids, ...(await descendantIds(ids))];
}

async function adminScope(adminId: string): Promise<{ nodeIds: string[]; rootId: string } | null> {
  const [admin] = await db
    .select({ organizationNodeId: orgAdmin.organizationNodeId })
    .from(orgAdmin)
    .where(eq(orgAdmin.id, adminId))
    .limit(1);
  if (!admin) return null;
  const all = [admin.organizationNodeId, ...(await descendantIds([admin.organizationNodeId]))];
  return { nodeIds: all, rootId: admin.organizationNodeId };
}

// GET /api/event-requests?status=PENDING — events wanting to use this gate
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) return unauthorizedResponse('Unauthorized');

    const { id: adminId, role } = authResult.payload;
    if (role !== 'orgadmin') return unauthorizedResponse('Unauthorized');

    const scope = await adminScope(adminId!);
    if (!scope) return unauthorizedResponse('Admin not found');

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const conditions = [
      inArray(zuppdateEventSecurity.organizationNodeId, scope.nodeIds),
      eq(zuppdateEventSecurity.mode, 'VENUE'),
    ];
    if (status && status !== 'all') {
      conditions.push(eq(zuppdateEventSecurity.venueApproval, status as 'PENDING' | 'APPROVED' | 'DECLINED'));
    }

    const rows = await db
      .select({
        securityId: zuppdateEventSecurity.id,
        eventId: zuppdateEventSecurity.eventId,
        approval: zuppdateEventSecurity.venueApproval,
        requestedAt: zuppdateEventSecurity.venueRequestedAt,
        decidedAt: zuppdateEventSecurity.venueDecidedAt,
        declineReason: zuppdateEventSecurity.venueDeclineReason,
        securityLevel: zuppdateEventSecurity.securityLevel,
        maxPasses: zuppdateEventSecurity.maxPasses,
        isEnabled: zuppdateEventSecurity.isEnabled,
        nodeId: zuppdateEventSecurity.organizationNodeId,
        nodeName: organizationNode.name,
        eventName: zuppdateEvents.name,
        eventSlug: zuppdateEvents.publicSlug,
        eventType: zuppdateEvents.eventType,
        eventStart: zuppdateEvents.startDate,
        eventEnd: zuppdateEvents.endDate,
        eventLocation: zuppdateEvents.location,
        eventStatus: zuppdateEvents.status,
      })
      .from(zuppdateEventSecurity)
      .innerJoin(zuppdateEvents, eq(zuppdateEventSecurity.eventId, zuppdateEvents.id))
      .leftJoin(organizationNode, eq(zuppdateEventSecurity.organizationNodeId, organizationNode.id))
      .where(and(...conditions))
      .orderBy(desc(zuppdateEventSecurity.venueRequestedAt));

    return successResponse(
      rows.map((r) => ({
        ...r,
        // Zuppdate's event dates are DATETIME(3) UTC-anchored wall clock, not
        // this product's TIMESTAMP columns, so they are shown as stored rather
        // than converted — converting would shift an organiser's stated time.
        requestedAt: toIST(r.requestedAt),
        decidedAt: toIST(r.decidedAt),
      }))
    );
  } catch (error) {
    console.error('Get event requests error:', error);
    return errorResponse('An error occurred', 500);
  }
}

// PATCH /api/event-requests — approve or decline one
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success || !authResult.payload) return unauthorizedResponse('Unauthorized');

    const { id: adminId, role } = authResult.payload;
    if (role !== 'orgadmin') return unauthorizedResponse('Unauthorized');

    const body = await req.json();
    const { eventId, decision, reason } = body ?? {};
    if (!eventId || (decision !== 'APPROVED' && decision !== 'DECLINED')) {
      return errorResponse('eventId and a decision of APPROVED or DECLINED are required', 400);
    }

    const scope = await adminScope(adminId!);
    if (!scope) return unauthorizedResponse('Admin not found');

    // The request must actually point at a node this admin runs. Without this,
    // any org admin could approve any event anywhere.
    const [request] = await db
      .select({ id: zuppdateEventSecurity.id, nodeId: zuppdateEventSecurity.organizationNodeId })
      .from(zuppdateEventSecurity)
      .where(
        and(
          eq(zuppdateEventSecurity.eventId, eventId),
          eq(zuppdateEventSecurity.mode, 'VENUE'),
          inArray(zuppdateEventSecurity.organizationNodeId, scope.nodeIds)
        )
      )
      .limit(1);

    if (!request) {
      return errorResponse('That request is not for one of your venues', 403);
    }

    await db
      .update(zuppdateEventSecurity)
      .set({
        venueApproval: decision,
        venueDecidedAt: new Date(),
        venueDecidedBy: adminId!,
        venueDeclineReason: decision === 'DECLINED' ? (reason?.toString().slice(0, 1000) || null) : null,
      })
      .where(eq(zuppdateEventSecurity.id, request.id));

    await db.insert(auditLog).values({
      actorType: 'OrgAdmin',
      actorId: adminId!,
      action: decision === 'APPROVED' ? 'EVENT_GATE_APPROVED' : 'EVENT_GATE_DECLINED',
      metadata: { eventId, nodeId: request.nodeId, reason: reason ?? null },
    });

    return successResponse({ eventId, decision }, `Request ${decision.toLowerCase()}`);
  } catch (error) {
    console.error('Decide event request error:', error);
    return errorResponse('An error occurred', 500);
  }
}
