import { mysqlTable, varchar, timestamp, boolean, mysqlEnum, int, text, datetime } from 'drizzle-orm/mysql-core';

/**
 * READ-ONLY view of Zuppdate's tables, for the single-login link.
 *
 * Zuppgate and Zuppdate share one database (`zups`). This file declares just
 * enough of Zuppdate's `users` table for Zuppgate to look a customer up by
 * phone and to read their display details.
 *
 * WHY THIS IS A SEPARATE FILE, NOT PART OF db/schema.ts:
 * drizzle.config.ts points at db/schema.ts. Anything declared there becomes
 * something drizzle-kit believes it owns and may emit DDL for. This is a
 * partial declaration (Zuppdate's `users` has 19 columns and a dozen
 * relations), so letting drizzle-kit see it would be actively dangerous.
 * Keeping it here means it is queryable but invisible to the migration tool.
 *
 * TREAT EVERY TABLE IN THIS FILE AS READ-ONLY. Zuppdate owns these rows and
 * their schema (prisma/schema.prisma). Zuppgate writes exactly one column
 * across the boundary: `guest.user_id`, which lives on Zuppgate's own table.
 *
 * Note the mixed naming: Zuppdate's columns are camelCase in the database
 * (`avatarUrl`, `phoneVerifiedAt`), except `phone_normalized`, which was added
 * for this integration and follows Zuppgate's snake_case convention.
 */
export const zuppdateUsers = mysqlTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(),
  name: varchar('name', { length: 191 }).notNull(),
  email: varchar('email', { length: 191 }),
  /** As the user typed it: may carry +91, spaces or dashes. */
  phone: varchar('phone', { length: 191 }),
  /** Digits-only, last 10. The indexed column to match a visitor's phone on. */
  phoneNormalized: varchar('phone_normalized', { length: 20 }),
  phoneVerifiedAt: timestamp('phoneVerifiedAt', { fsp: 3 }),
  username: varchar('username', { length: 191 }),
  isPrivate: boolean('isPrivate').notNull(),
  avatarUrl: varchar('avatarUrl', { length: 191 }),
  accountType: mysqlEnum('accountType', ['PERSONAL', 'BUSINESS', 'PROPERTY_MANAGER']).notNull(),
  createdAt: timestamp('createdAt', { fsp: 3 }).notNull(),
});

/**
 * EVENT SECURITY — the Zuppdate side of gated events.
 *
 * A Zuppdate event can hand its guests a real Zuppgate entry pass plus
 * food/perk coupons redeemed at the same gate. Zuppgate needs to read these to
 * show a guard what event a pass belongs to, to let a venue admin approve an
 * event being hosted at their node, and to redeem coupons.
 *
 * READ-ONLY, with two exceptions Zuppgate legitimately writes because they are
 * gate actions, not event data: `event_coupon_grants.used_count` and rows in
 * `event_coupon_redemptions`. Everything else belongs to Zuppdate.
 *
 * Note these are DATETIME(3) columns (Prisma's default), NOT the TIMESTAMP that
 * Zuppgate's own tables use — so they are NOT affected by the session time zone
 * pinning in db/index.ts. Zuppdate stores UTC-anchored wall-clock values in
 * them; do not mix them with Zuppgate timestamps in arithmetic without
 * converting deliberately.
 */
export const zuppdateEvents = mysqlTable('events', {
  id: varchar('id', { length: 191 }).primaryKey(),
  organizerId: varchar('organizerId', { length: 191 }).notNull(),
  name: varchar('name', { length: 191 }).notNull(),
  description: text('description'),
  coverImageUrl: varchar('coverImageUrl', { length: 191 }),
  eventType: varchar('eventType', { length: 191 }).notNull(),
  startDate: datetime('startDate', { fsp: 3 }).notNull(),
  endDate: datetime('endDate', { fsp: 3 }),
  location: varchar('location', { length: 191 }),
  publicSlug: varchar('publicSlug', { length: 191 }).notNull(),
  status: mysqlEnum('status', ['DRAFT', 'PUBLISHED']).notNull(),
});

export const zuppdateEventSecurity = mysqlTable('event_security', {
  id: varchar('id', { length: 191 }).primaryKey(),
  eventId: varchar('event_id', { length: 191 }).notNull(),
  isEnabled: boolean('is_enabled').notNull(),
  mode: mysqlEnum('mode', ['VENUE', 'STANDALONE']).notNull(),
  organizationNodeId: varchar('organization_node_id', { length: 36 }),
  venueApproval: mysqlEnum('venue_approval', ['NOT_REQUIRED', 'PENDING', 'APPROVED', 'DECLINED']).notNull(),
  venueRequestedAt: datetime('venue_requested_at', { fsp: 3 }),
  venueDecidedAt: datetime('venue_decided_at', { fsp: 3 }),
  venueDecidedBy: varchar('venue_decided_by', { length: 36 }),
  venueDeclineReason: text('venue_decline_reason'),
  securityLevel: int('security_level').notNull(),
  maxPasses: int('max_passes'),
  passValidFrom: datetime('pass_valid_from', { fsp: 3 }),
  passValidTo: datetime('pass_valid_to', { fsp: 3 }),
});

export const zuppdateEventCoupons = mysqlTable('event_coupons', {
  id: varchar('id', { length: 191 }).primaryKey(),
  eventId: varchar('event_id', { length: 191 }).notNull(),
  title: varchar('title', { length: 120 }).notNull(),
  description: text('description'),
  maxUses: int('max_uses').notNull(),
  validFrom: datetime('valid_from', { fsp: 3 }),
  validTo: datetime('valid_to', { fsp: 3 }),
  isActive: boolean('is_active').notNull(),
  order: int('order').notNull(),
});

/** Writable: `used_count` is incremented by the gate on redemption. */
export const zuppdateEventCouponGrants = mysqlTable('event_coupon_grants', {
  id: varchar('id', { length: 191 }).primaryKey(),
  couponId: varchar('coupon_id', { length: 191 }).notNull(),
  invitationId: varchar('invitation_id', { length: 36 }).notNull(),
  redeemKey: varchar('redeem_key', { length: 64 }).notNull(),
  usedCount: int('used_count').notNull(),
  createdAt: datetime('created_at', { fsp: 3 }).notNull(),
  updatedAt: datetime('updated_at', { fsp: 3 }).notNull(),
});

/** Writable: the gate appends an attempt per scan, successful or not. */
export const zuppdateEventCouponRedemptions = mysqlTable('event_coupon_redemptions', {
  id: varchar('id', { length: 191 }).primaryKey(),
  grantId: varchar('grant_id', { length: 191 }).notNull(),
  redeemedBySecurityPersonnelId: varchar('redeemed_by_security_personnel_id', { length: 36 }),
  success: boolean('success').notNull(),
  failureReason: text('failure_reason'),
  at: datetime('at', { fsp: 3 }).notNull(),
});
