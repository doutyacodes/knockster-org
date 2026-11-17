import { NextRequest } from 'next/server';
import { eq, and, asc, desc } from 'drizzle-orm';
import { db } from '@/db';
import { guestInvitation, guest, invitationScanEvent, guestQrSession, guestOtp, securityPersonnel, orgAdmin } from '@/db/schema';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';
import { toIST, fromIST } from '@/lib/timezone';

/**
 * One step in a pass's life, for the timeline on the invitation detail page.
 *
 * Carries BOTH an absolute instant and a display label on purpose. `at` is ISO
 * UTC, which is what the client compares against "now" to decide whether a step
 * has happened yet. `atLabel` is the IST string the rest of this app shows.
 *
 * Doing it this way avoids a trap: `toIST()` returns "yyyy-MM-dd HH:mm:ss" with
 * no zone marker, and `new Date(...)` on that parses it as the BROWSER's local
 * time. That happens to be right on an IST machine and silently wrong anywhere
 * else, so it must not be used for comparisons.
 */
type TimelineStep = {
  kind:
    | 'CREATED'
    | 'WINDOW_OPEN'
    | 'QR_ISSUED'
    | 'OTP_ISSUED'
    | 'OTP_VERIFIED'
    | 'SCAN_GRANTED'
    | 'SCAN_DENIED'
    | 'REVOKED'
    | 'WINDOW_CLOSED';
  at: string;
  atLabel: string | null;
  title: string;
  detail?: string | null;
  securityLevel?: number | null;
  guard?: string | null;
};

// GET /api/invitations/[id] - Get a specific invitation with details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Fetch invitation with guest details
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
        // For the timeline's "created by" line only; stripped from the
        // response below rather than exposing an internal admin id.
        createdByOrgAdminId: guestInvitation.createdByOrgAdminId,
      })
      .from(guestInvitation)
      .leftJoin(guest, eq(guestInvitation.guestId, guest.id))
      .where(
        and(
          eq(guestInvitation.id, id),
          eq(guestInvitation.organizationNodeId, organizationNodeId!)
        )
      )
      .limit(1);

    if (!invitation) {
      return notFoundResponse('Invitation not found');
    }

    // Ensure guest name has a fallback
    const { createdByOrgAdminId, ...invitationFields } = invitation;
    const invitationData = {
      ...invitationFields,
      guestName: invitation.guestName || 'Unknown',
      guestPhone: invitation.guestPhone || 'N/A',
    };

    // Fetch scan events, now with the guard who performed each one. Limit
    // raised from 10 to 50: the timeline below is a full account of the pass,
    // and silently dropping the oldest entries would misrepresent it.
    const scanEventsData = await db
      .select({
        id: invitationScanEvent.id,
        scannedAt: invitationScanEvent.timestamp,
        success: invitationScanEvent.success,
        failureReason: invitationScanEvent.failureReason,
        securityLevel: invitationScanEvent.usedSecurityLevel,
        guardUsername: securityPersonnel.username,
      })
      .from(invitationScanEvent)
      .leftJoin(securityPersonnel, eq(invitationScanEvent.scannedBySecurityPersonnelId, securityPersonnel.id))
      .where(eq(invitationScanEvent.invitationId, id))
      .orderBy(desc(invitationScanEvent.timestamp))
      .limit(50);

    // Transform scan events for frontend with IST timezone
    const scanEvents = scanEventsData.map(scan => ({
      id: scan.id,
      scannedAt: toIST(scan.scannedAt),
      scanResult: scan.success ? 'SUCCESS' : 'FAILED',
      failureReason: scan.failureReason,
      securityLevel: scan.securityLevel,
    }));

    // Fetch active QR session if exists
    const [qrSession] = await db
      .select({
        id: guestQrSession.id,
        qrCode: guestQrSession.rotatingKey,
        expiresAt: guestQrSession.expiresAt,
      })
      .from(guestQrSession)
      .where(eq(guestQrSession.invitationId, id))
      .orderBy(desc(guestQrSession.createdAt))
      .limit(1);

    // ---- Pass timeline -----------------------------------------------------
    // Every recorded moment in this pass's life, in one chronological list.
    // Assembled server-side so the sourcing rules live in exactly one place;
    // whether a step has happened yet is left to the client, which compares
    // `at` against the current time so the timeline advances on its own.
    //
    // There is deliberately no "guest left" step: invitation_scan_event has no
    // direction, so a departure is not recorded anywhere. WINDOW_CLOSED is the
    // honest end of the pass -- the access window closing, not the guest
    // physically leaving.
    const [allQrSessions, allOtps, creator] = await Promise.all([
      db
        .select({ createdAt: guestQrSession.createdAt })
        .from(guestQrSession)
        .where(eq(guestQrSession.invitationId, id))
        .orderBy(asc(guestQrSession.createdAt)),
      db
        .select({
          createdAt: guestOtp.createdAt,
          verified: guestOtp.verified,
          expiresAt: guestOtp.expiresAt,
        })
        .from(guestOtp)
        .where(eq(guestOtp.invitationId, id))
        .orderBy(asc(guestOtp.createdAt)),
      db
        .select({ email: orgAdmin.email })
        .from(orgAdmin)
        .where(eq(orgAdmin.id, createdByOrgAdminId))
        .limit(1),
    ]);

    const step = (
      kind: TimelineStep['kind'],
      at: Date | null,
      title: string,
      extra: Partial<TimelineStep> = {}
    ): TimelineStep | null =>
      at ? { kind, at: new Date(at).toISOString(), atLabel: toIST(at), title, ...extra } : null;

    const steps: (TimelineStep | null)[] = [
      step('CREATED', invitation.createdAt, 'Pass created', {
        detail: creator[0]?.email ? `by ${creator[0].email}` : null,
      }),
      step('WINDOW_OPEN', invitation.validFrom, 'Access window opens'),
    ];

    if (allQrSessions.length > 0) {
      steps.push(
        step('QR_ISSUED', allQrSessions[0].createdAt, 'QR pass issued', {
          detail:
            allQrSessions.length > 1
              ? `rotated ${allQrSessions.length - 1} more time${allQrSessions.length - 1 === 1 ? '' : 's'}`
              : null,
        })
      );
    }

    // ONE OTP step, for the most recently issued code -- the same collapsing
    // the QR step above does. A single L4 entry can mint a code per attempt
    // (the production data has passes with several), and a row each would bury
    // the gate scans that actually matter under repeated "OTP issued".
    //
    // There is no separate "verified" step: `guest_otp` records THAT a code was
    // verified but not WHEN -- no verified_at column. An earlier version
    // anchored verification to `expires_at`, which put it a full OTP lifetime
    // (300s) late and rendered it *after* the gate had already granted access.
    // Reporting it against the issue time we do know beats inventing one that
    // contradicts the scan record.
    //
    // When an earlier code was the one verified and the latest was not, that is
    // said explicitly rather than quietly dropped -- it is what explains a
    // successful scan sitting between the two.
    if (allOtps.length > 0) {
      const lastOtp = allOtps[allOtps.length - 1];
      const anyVerified = allOtps.some((o) => o.verified);
      const detailParts: string[] = [];
      if (allOtps.length > 1) {
        detailParts.push(`${allOtps.length} codes issued`);
      }
      if (!lastOtp.verified) {
        detailParts.push(anyVerified ? 'an earlier code was verified' : 'not verified');
      }

      steps.push(
        step(
          lastOtp.verified || anyVerified ? 'OTP_VERIFIED' : 'OTP_ISSUED',
          lastOtp.createdAt,
          lastOtp.verified ? 'OTP issued and verified' : 'OTP issued',
          { detail: detailParts.length > 0 ? detailParts.join(' · ') : null }
        )
      );
    }

    for (const scan of scanEventsData) {
      steps.push(
        step(
          scan.success ? 'SCAN_GRANTED' : 'SCAN_DENIED',
          scan.scannedAt,
          scan.success ? 'Access granted at gate' : 'Access denied at gate',
          {
            detail: scan.failureReason,
            securityLevel: scan.securityLevel,
            guard: scan.guardUsername,
          }
        )
      );
    }

    if (invitation.status === 'revoked') {
      // No revoked_at column exists, so this is anchored to the row's last
      // known state rather than the moment of revocation.
      steps.push(step('REVOKED', invitation.validTo, 'Pass revoked'));
    } else {
      steps.push(step('WINDOW_CLOSED', invitation.validTo, 'Access window closed'));
    }

    // Chronological, except that CREATED always leads. An admin can set
    // valid_from slightly in the past, which sorts "Access window opens" above
    // "Pass created" and reads as the window opening before the pass existed.
    const KIND_RANK: Partial<Record<TimelineStep['kind'], number>> = { CREATED: -1 };
    const timeline = steps
      .filter((s): s is TimelineStep => s !== null)
      .sort((a, b) => {
        const rank = (KIND_RANK[a.kind] ?? 0) - (KIND_RANK[b.kind] ?? 0);
        if (rank !== 0) return rank;
        return new Date(a.at).getTime() - new Date(b.at).getTime();
      });

    return successResponse({
      ...invitationData,
      validFrom: toIST(invitationData.validFrom),
      validTo: toIST(invitationData.validTo),
      createdAt: toIST(invitationData.createdAt),
      scanEvents,
      qrSession: qrSession ? {
        ...qrSession,
        expiresAt: toIST(qrSession.expiresAt),
      } : null,
      timeline,
    });
  } catch (error) {
    console.error('Get invitation error:', error);
    return errorResponse('An error occurred while fetching invitation', 500);
  }
}

// PATCH /api/invitations/[id] - Update an invitation (e.g., revoke)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const { status, validFrom, validTo, securityLevel } = body;

    // Check if invitation exists and belongs to this org
    const [existingInvitation] = await db
      .select()
      .from(guestInvitation)
      .where(
        and(
          eq(guestInvitation.id, id),
          eq(guestInvitation.organizationNodeId, organizationNodeId!)
        )
      )
      .limit(1);

    if (!existingInvitation) {
      return notFoundResponse('Invitation not found');
    }

    // Build update object
    const updateData: any = {};

    if (status) {
      const validStatuses = ['active', 'pending', 'expired', 'revoked'];
      if (!validStatuses.includes(status.toLowerCase())) {
        return errorResponse('Invalid status', 400);
      }
      updateData.status = status.toLowerCase();
    }

    if (validFrom) {
      updateData.validFrom = fromIST(validFrom);
    }

    if (validTo) {
      updateData.validTo = fromIST(validTo);
    }

    if (securityLevel) {
      if (![1, 2, 3, 4].includes(securityLevel)) {
        return errorResponse('Invalid security level', 400);
      }
      updateData.requestedSecurityLevel = securityLevel;
    }

    // Update invitation
    await db
      .update(guestInvitation)
      .set(updateData)
      .where(eq(guestInvitation.id, id));

    // Fetch updated invitation
    const [updatedInvitation] = await db
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
      .where(eq(guestInvitation.id, id))
      .limit(1);

    if (!updatedInvitation) {
      return notFoundResponse('Invitation not found after update');
    }

    // Ensure guest data has fallbacks and convert dates to IST
    const responseData = {
      ...updatedInvitation,
      guestName: updatedInvitation.guestName || 'Unknown',
      guestPhone: updatedInvitation.guestPhone || 'N/A',
      validFrom: toIST(updatedInvitation.validFrom),
      validTo: toIST(updatedInvitation.validTo),
      createdAt: toIST(updatedInvitation.createdAt),
    };

    return successResponse(responseData);
  } catch (error) {
    console.error('Update invitation error:', error);
    return errorResponse('An error occurred while updating invitation', 500);
  }
}

// DELETE /api/invitations/[id] - Delete an invitation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Check if invitation exists and belongs to this org
    const [existingInvitation] = await db
      .select()
      .from(guestInvitation)
      .where(
        and(
          eq(guestInvitation.id, id),
          eq(guestInvitation.organizationNodeId, organizationNodeId!)
        )
      )
      .limit(1);

    if (!existingInvitation) {
      return notFoundResponse('Invitation not found');
    }

    // Delete related records first
    await db.delete(guestQrSession).where(eq(guestQrSession.invitationId, id));
    await db.delete(guestOtp).where(eq(guestOtp.invitationId, id));

    // Note: We keep scan events for audit purposes

    // Delete invitation
    await db.delete(guestInvitation).where(eq(guestInvitation.id, id));

    return successResponse({ message: 'Invitation deleted successfully' });
  } catch (error) {
    console.error('Delete invitation error:', error);
    return errorResponse('An error occurred while deleting invitation', 500);
  }
}
