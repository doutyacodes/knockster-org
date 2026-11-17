import { eq, asc, desc } from 'drizzle-orm';
import { db } from '@/db';
import { invitationScanEvent, guestQrSession, guestOtp, securityPersonnel, orgAdmin } from '@/db/schema';
import { toIST } from '@/lib/timezone';

/**
 * THE one place a pass's timeline is assembled.
 *
 * Two pages show it and they must never drift: the org admin's detail page
 * (/invitations/[id]) and the visitor's own pass page (/guest/[invitationId]).
 * Writing the sourcing rules twice is how the two end up disagreeing about what
 * happened to a pass, so both routes call this.
 *
 * Each step carries BOTH an absolute instant and a display label on purpose.
 * `at` is ISO UTC, which is what the client compares against "now" to decide
 * whether a step has happened yet. `atLabel` is the IST string the rest of the
 * app shows.
 *
 * That split matters: `toIST()` returns "yyyy-MM-dd HH:mm:ss" with no zone
 * marker, and `new Date(...)` on that parses it as the BROWSER's local time --
 * right on an IST machine, silently wrong anywhere else. It must not be used
 * for comparisons.
 */

export type TimelineStep = {
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

/**
 * Who is going to read it.
 *
 * `guest` strips anything about the organisation's own people: the admin who
 * issued the pass, and which guard scanned it. A visitor has no business
 * knowing either, and both would otherwise leak staff identities onto a page
 * that needs no authentication at all to open.
 */
export type TimelineAudience = 'admin' | 'guest';

type InvitationRow = {
  createdAt: Date;
  validFrom: Date;
  validTo: Date;
  status: string;
  /**
   * Only needed for the 'admin' audience, which resolves it to the issuing
   * admin's email. The guest view never shows that, so guest callers can leave
   * it out rather than selecting a column they have no use for.
   */
  createdByOrgAdminId?: string | null;
};

export async function buildPassTimeline(
  invitationId: string,
  invitation: InvitationRow,
  audience: TimelineAudience
): Promise<TimelineStep[]> {
  const [qrSessions, otps, scans, creator] = await Promise.all([
    db
      .select({ createdAt: guestQrSession.createdAt })
      .from(guestQrSession)
      .where(eq(guestQrSession.invitationId, invitationId))
      .orderBy(asc(guestQrSession.createdAt)),
    db
      .select({ createdAt: guestOtp.createdAt, verified: guestOtp.verified })
      .from(guestOtp)
      .where(eq(guestOtp.invitationId, invitationId))
      .orderBy(asc(guestOtp.createdAt)),
    db
      .select({
        scannedAt: invitationScanEvent.timestamp,
        success: invitationScanEvent.success,
        failureReason: invitationScanEvent.failureReason,
        securityLevel: invitationScanEvent.usedSecurityLevel,
        guardUsername: securityPersonnel.username,
      })
      .from(invitationScanEvent)
      .leftJoin(securityPersonnel, eq(invitationScanEvent.scannedBySecurityPersonnelId, securityPersonnel.id))
      .where(eq(invitationScanEvent.invitationId, invitationId))
      .orderBy(desc(invitationScanEvent.timestamp))
      .limit(50),
    audience === 'admin' && invitation.createdByOrgAdminId
      ? db
          .select({ email: orgAdmin.email })
          .from(orgAdmin)
          .where(eq(orgAdmin.id, invitation.createdByOrgAdminId))
          .limit(1)
      : Promise.resolve([] as { email: string }[]),
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
      detail: audience === 'admin' && creator[0]?.email ? `by ${creator[0].email}` : null,
    }),
    step('WINDOW_OPEN', invitation.validFrom, 'Access window opens'),
  ];

  // One QR step, collapsing rotations -- the key rotates every few minutes, so
  // a row each would be nothing but noise.
  if (qrSessions.length > 0) {
    steps.push(
      step('QR_ISSUED', qrSessions[0].createdAt, 'QR pass issued', {
        detail:
          qrSessions.length > 1
            ? `rotated ${qrSessions.length - 1} more time${qrSessions.length - 1 === 1 ? '' : 's'}`
            : null,
      })
    );
  }

  // One OTP step, for the most recently issued code. A single L4 entry can mint
  // a code per attempt, and a row each buried the gate scans that matter.
  //
  // There is no separate "verified" step: guest_otp records THAT a code was
  // verified but not WHEN -- no verified_at column. Anchoring verification to
  // `expires_at` (an earlier attempt) put it a full OTP lifetime late and
  // rendered it AFTER the gate had already granted access.
  //
  // Where an earlier code was the verified one and the latest was not, say so
  // rather than dropping it: it is what explains a successful scan between the
  // two.
  if (otps.length > 0) {
    const lastOtp = otps[otps.length - 1];
    const anyVerified = otps.some((o) => o.verified);
    const detailParts: string[] = [];
    if (otps.length > 1) detailParts.push(`${otps.length} codes issued`);
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

  for (const scan of scans) {
    steps.push(
      step(
        scan.success ? 'SCAN_GRANTED' : 'SCAN_DENIED',
        scan.scannedAt,
        scan.success ? 'Access granted at gate' : 'Access denied at gate',
        {
          detail: scan.failureReason,
          securityLevel: scan.securityLevel,
          guard: audience === 'admin' ? scan.guardUsername : null,
        }
      )
    );
  }

  // There is deliberately no "guest left" step. invitation_scan_event has no
  // direction column, so an entry and an exit are indistinguishable and no
  // departure is recorded anywhere. WINDOW_CLOSED is the honest end of a pass:
  // the access window closing, not the guest leaving.
  if (invitation.status === 'revoked') {
    // No revoked_at column exists, so this anchors to the row's validity end
    // rather than the moment of revocation.
    steps.push(step('REVOKED', invitation.validTo, 'Pass revoked'));
  } else {
    steps.push(step('WINDOW_CLOSED', invitation.validTo, 'Access window closed'));
  }

  // Chronological, except that CREATED always leads. An admin can set
  // valid_from slightly in the past, which otherwise sorts "Access window
  // opens" above "Pass created" and reads as the window opening before the
  // pass existed.
  const KIND_RANK: Partial<Record<TimelineStep['kind'], number>> = { CREATED: -1 };
  return steps
    .filter((s): s is TimelineStep => s !== null)
    .sort((a, b) => {
      const rank = (KIND_RANK[a.kind] ?? 0) - (KIND_RANK[b.kind] ?? 0);
      if (rank !== 0) return rank;
      return new Date(a.at).getTime() - new Date(b.at).getTime();
    });
}
