import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create MySQL connection pool
const poolConnection = mysql.createPool(process.env.DATABASE_URL);

/**
 * Pin every connection's session time zone to UTC.
 *
 * WHY THIS IS REQUIRED, NOT COSMETIC:
 * Every table in this product uses MySQL `TIMESTAMP` (Drizzle's `timestamp()`).
 * Unlike `DATETIME`, a TIMESTAMP is stored as a UTC instant and **converted to
 * the session time zone on every read**. The production server runs with
 * `system_time_zone = UTC`, so values came back exactly as written. A developer
 * machine running in, say, India Standard Time converts the same stored instant
 * to an IST wall clock, and the driver then hands that string back labelled as
 * UTC — so the whole application reads every timestamp 5h30m off.
 *
 * The symptom is quietly destructive rather than loud: invitations report
 * "not yet active" or "expired" at the wrong moment, QR/OTP expiry windows
 * drift, and `invitation_scan_event` history shifts. Nothing errors.
 *
 * lib/timezone.ts already states the contract — "Database stores everything in
 * UTC, display in IST" — and this is what actually enforces the UTC half of it,
 * independent of whatever time zone the host machine happens to be in.
 *
 * Done per-connection rather than by changing the server's global `time_zone`
 * so that other databases on a shared local MySQL instance are unaffected.
 */
poolConnection.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });
