import { mysqlTable, varchar, timestamp, boolean, mysqlEnum } from 'drizzle-orm/mysql-core';

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
