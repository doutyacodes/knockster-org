import { sql, type SQL } from 'drizzle-orm';
import { guestInvitation } from '@/db/schema';

/**
 * INVITATION STATUS IS DERIVED, NOT TRUSTED.
 *
 * `guest_invitation.status` is written once at creation (from the dates as they
 * stood at that instant) and again on revoke. Nothing ages it: there is no cron
 * and no scheduled job. So a pass created while its window was open stays
 * 'active' in the column for ever, and one created ahead of time stays
 * 'pending' for ever.
 *
 * That is not hypothetical. On the production data imported into this database,
 * 61 of 67 passes had a stale column: 54 stored 'active' and 7 stored 'pending'
 * were all, in fact, long expired. Every dashboard surface reading the column
 * was reporting 54 live visitors when the real answer was zero.
 *
 * The gate itself was never affected -- `scan-guest` and `scan-security`
 * independently re-check `valid_from`/`valid_to` against the clock before
 * letting anyone through, which is why a stale column never granted access it
 * shouldn't have. It is a reporting bug, not a security one.
 *
 * This mirrors how Zuppdate handles the same problem (see
 * `applyAutoLiveStatus` in zuppdate/app/lib/activity-progress.ts): the stored
 * value is an override for the states a human sets deliberately, and everything
 * time-dependent is computed on read.
 *
 * `revoked` is the one state that genuinely only exists in the column -- it is
 * a human decision, not a function of the clock -- so it always wins.
 */

export type StoredInvitationStatus = 'pending' | 'active' | 'expired' | 'revoked';
export type DerivedInvitationStatus = 'pending' | 'active' | 'expired' | 'revoked';

/** Frontend-facing labels, unchanged from what the UI has always received. */
export type FrontendInvitationStatus = 'Upcoming' | 'Active' | 'Expired' | 'Revoked';

/**
 * The real status of a pass right now.
 *
 * Pass the stored status plus the window. `revoked` short-circuits; otherwise
 * the clock decides. Compared as absolute instants, so this is correct whatever
 * time zone the server runs in.
 */
export function deriveInvitationStatus(
  stored: string,
  validFrom: Date | string,
  validTo: Date | string,
  now: Date = new Date()
): DerivedInvitationStatus {
  if (stored === 'revoked') return 'revoked';

  const from = new Date(validFrom).getTime();
  const to = new Date(validTo).getTime();
  const t = now.getTime();

  // A malformed window should not silently read as live.
  if (Number.isNaN(from) || Number.isNaN(to)) return 'expired';

  if (t < from) return 'pending';
  if (t > to) return 'expired';
  return 'active';
}

const FRONTEND_LABEL: Record<DerivedInvitationStatus, FrontendInvitationStatus> = {
  active: 'Active',
  pending: 'Upcoming',
  expired: 'Expired',
  revoked: 'Revoked',
};

/** Derived status in the label the UI already expects. */
export function invitationStatusForFrontend(
  stored: string,
  validFrom: Date | string,
  validTo: Date | string,
  now: Date = new Date()
): FrontendInvitationStatus {
  return FRONTEND_LABEL[deriveInvitationStatus(stored, validFrom, validTo, now)];
}

/** True when the pass is usable at the gate right now. */
export function isInvitationUsable(
  stored: string,
  validFrom: Date | string,
  validTo: Date | string,
  now: Date = new Date()
): boolean {
  return deriveInvitationStatus(stored, validFrom, validTo, now) === 'active';
}

/**
 * The same derivation as SQL, for queries that must filter or count by status
 * in the database rather than in JS.
 *
 * Deliberately built from the same three inputs in the same order as
 * `deriveInvitationStatus` so the two cannot drift. `NOW()` is evaluated by
 * MySQL; connections are pinned to UTC in db/index.ts, so it is comparable with
 * the TIMESTAMP columns.
 */
export function derivedStatusSql(): SQL<DerivedInvitationStatus> {
  return sql<DerivedInvitationStatus>`
    CASE
      WHEN ${guestInvitation.status} = 'revoked' THEN 'revoked'
      WHEN ${guestInvitation.validTo} < NOW() THEN 'expired'
      WHEN ${guestInvitation.validFrom} > NOW() THEN 'pending'
      ELSE 'active'
    END
  `;
}

/** `WHERE` fragment matching one derived status. Use instead of eq(status, x). */
export function whereDerivedStatus(target: DerivedInvitationStatus): SQL {
  if (target === 'revoked') {
    return sql`${guestInvitation.status} = 'revoked'`;
  }
  if (target === 'expired') {
    return sql`${guestInvitation.status} <> 'revoked' AND ${guestInvitation.validTo} < NOW()`;
  }
  if (target === 'pending') {
    return sql`${guestInvitation.status} <> 'revoked' AND ${guestInvitation.validFrom} > NOW()`;
  }
  return sql`${guestInvitation.status} <> 'revoked'
    AND ${guestInvitation.validFrom} <= NOW()
    AND ${guestInvitation.validTo} >= NOW()`;
}
