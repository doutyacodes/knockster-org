import { eq, and, isNull, asc } from 'drizzle-orm';
import { db } from '@/db';
import { guest } from '@/db/schema';
import { zuppdateUsers } from '@/db/zuppdate-schema';

/**
 * SINGLE LOGIN ACROSS ZUPPGATE AND ZUPPDATE
 * =========================================
 * Zuppgate and Zuppdate are separate products sharing one database. A customer
 * has one identity — their Zuppdate `users` row — and Zuppgate's `guest` row is
 * a visitor profile pointing at it via `guest.user_id`.
 *
 * The join key is the phone number, because that is the only identifier both
 * products collect: Zuppgate's guest app logs in with a phone and nothing else.
 *
 * WHAT THIS LINK IS NOT
 * ---------------------
 * It is a DATA link, never an AUTHENTICATION one. The guest app's login
 * (/api/mobile-api/guest/login) accepts a bare phone number with no OTP and no
 * password, whereas a Zuppdate account is created behind a verified Firebase
 * phone OTP. So a Zuppgate guest token must never be accepted as a Zuppdate
 * session — otherwise knowing someone's phone number would be enough to reach
 * their Zuppdate account. The two products keep separate signing secrets
 * (JWT_SECRET vs SESSION_SECRET) and separate token shapes, which enforces this
 * structurally. Do not add a shared-secret shortcut between them without
 * putting real verification in front of the guest login first.
 *
 * LINK-ONLY, NEVER CREATE
 * -----------------------
 * These helpers only ever attach a guest to an ALREADY EXISTING Zuppdate user.
 * They never create a `users` row. Auto-creating one per visitor would fill the
 * customer table with thousands of passwordless phone-only accounts and would
 * mean an unverified phone number had minted a real identity.
 */

/**
 * Digits-only, last 10 — must stay byte-identical to Zuppdate's
 * `normalizePhone()` in app/lib/phone.ts, or the two products will disagree
 * about who is who.
 *
 * Last-10 rather than full-string because Zuppdate stores whatever the user
 * typed (+91 98765 43210) while Zuppgate stores bare digits (9876543210).
 */
export function normalizePhone(phone: string | null | undefined): string {
  return (phone ?? '').replace(/[^\d]/g, '').slice(-10);
}

/**
 * Finds the Zuppdate account for a phone number, or null.
 *
 * REFUSES TO GUESS WHEN A PHONE NUMBER IS AMBIGUOUS. `users.phone_normalized`
 * is indexed but not unique, because two rows can differ on `phone`
 * (+919886019202 vs "98860 19202" vs 9886019202) and so slip past the unique
 * index on the raw column while normalizing to the same value. The production
 * data really does contain this: one number maps to three different accounts
 * with three different names.
 *
 * An earlier version took the oldest account in that situation. That is wrong
 * in a way that matters — the payload below carries a name, email and username,
 * so picking the wrong row shows one customer's identity to a different person
 * holding that phone. A missing link is a missing convenience; a wrong link is
 * a cross-customer data leak. So when more than one account matches, this
 * returns null and the visitor simply stays unlinked until each account has a
 * phone number of its own (see scripts/link-zuppgate-guests.ts, which reports
 * every collision on each run).
 *
 * A phone that normalizes to fewer than 10 digits is treated as unmatched
 * rather than prefix-matching every malformed row.
 */
export async function findZuppdateUserByPhone(phone: string | null | undefined) {
  const normalized = normalizePhone(phone);
  if (normalized.length < 10) return null;

  // Fetch 2, not 1: we need to know whether the match is unique.
  const matches = await db
    .select({
      id: zuppdateUsers.id,
      name: zuppdateUsers.name,
      email: zuppdateUsers.email,
      username: zuppdateUsers.username,
      avatarUrl: zuppdateUsers.avatarUrl,
      phoneVerifiedAt: zuppdateUsers.phoneVerifiedAt,
      accountType: zuppdateUsers.accountType,
    })
    .from(zuppdateUsers)
    .where(eq(zuppdateUsers.phoneNormalized, normalized))
    .orderBy(asc(zuppdateUsers.createdAt))
    .limit(2);

  if (matches.length > 1) {
    console.warn(
      `account-link: phone ${normalized} matches ${matches.length}+ Zuppdate accounts; refusing to link (give each account its own number first)`
    );
    return null;
  }

  return matches[0] ?? null;
}

/**
 * Attaches a guest row to its Zuppdate account if one exists, and returns the
 * linked user (or null when there is no matching account).
 *
 * Idempotent, and safe to call on every guest login. The write is guarded by
 * `isNull(guest.userId)` so an established link is never silently repointed —
 * if a guest is already linked we return that account as-is. This matters
 * because `guest.phone` is mutable from the org dashboard: without the guard,
 * an admin correcting a typo in a phone number could move an existing visitor
 * history onto a different customer's account.
 *
 * Never throws: a failure to link is cosmetic (the visitor simply doesn't see
 * their Zuppdate profile), and must not take down a gate login or an invitation
 * being issued.
 */
export async function linkGuestToUser(guestId: string, phone: string | null | undefined) {
  try {
    const [existing] = await db
      .select({ userId: guest.userId })
      .from(guest)
      .where(eq(guest.id, guestId))
      .limit(1);

    if (existing?.userId) {
      const [alreadyLinked] = await db
        .select({
          id: zuppdateUsers.id,
          name: zuppdateUsers.name,
          email: zuppdateUsers.email,
          username: zuppdateUsers.username,
          avatarUrl: zuppdateUsers.avatarUrl,
          phoneVerifiedAt: zuppdateUsers.phoneVerifiedAt,
          accountType: zuppdateUsers.accountType,
        })
        .from(zuppdateUsers)
        .where(eq(zuppdateUsers.id, existing.userId))
        .limit(1);
      return alreadyLinked ?? null;
    }

    const user = await findZuppdateUserByPhone(phone);
    if (!user) return null;

    await db
      .update(guest)
      .set({ userId: user.id })
      .where(and(eq(guest.id, guestId), isNull(guest.userId)));

    return user;
  } catch (error) {
    console.error('linkGuestToUser failed (non-fatal):', error);
    return null;
  }
}

/**
 * The additive block appended to mobile API `guest` payloads.
 *
 * MOBILE CONTRACT: this only ever ADDS keys. The guest and security Expo apps
 * are built against the previous response shape and are not in this repo, so
 * every existing key must keep its name and type — in particular `guest.id`
 * stays Zuppgate's uuid, never the Zuppdate user id. Unknown keys are ignored
 * by the apps, so no app release is needed to ship this.
 */
export function zuppdateAccountPayload(
  user: Awaited<ReturnType<typeof findZuppdateUserByPhone>>
) {
  return {
    userId: user?.id ?? null,
    hasZuppdateAccount: !!user,
    zuppdateAccount: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatarUrl,
          phoneVerified: !!user.phoneVerifiedAt,
          accountType: user.accountType,
        }
      : null,
  };
}
