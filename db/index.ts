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
 * UTC, display in IST" — and this is what enforces the UTC half of it.
 *
 * THE SERVER ITSELF MUST ALSO BE UTC. This pin is necessary but not
 * sufficient, and it is worth being precise about why, because an earlier
 * version of this comment claimed otherwise and the claim is false.
 *
 * Zuppdate shares these exact tables and writes them through Prisma, which
 * treats a TIMESTAMP as naive text: it writes the UTC wall clock verbatim and
 * reads it back verbatim, ignoring the session time zone entirely. MySQL,
 * however, parses that text AS the session zone. So the two agree only when
 * the server's zone is UTC:
 *
 *   server UTC   — Prisma writes "18:23", stored as 18:23Z, both read 18:23Z. OK
 *   server IST   — Prisma writes "18:23" (meaning UTC), MySQL stores 12:53Z;
 *                  an unpinned reader sees 12:53Z (off by 5h30m) and a reader
 *                  pinned to UTC by this very hook sees 07:23Z (off by 11h).
 *
 * Pinning therefore makes a non-UTC server worse, not better. Production runs
 * UTC (verified), so the pin is a no-op safeguard there and the arrangement is
 * sound; a dev machine must set the server, not just the session:
 *
 *   SET PERSIST time_zone = '+00:00';
 *
 * A local MySQL left on SYSTEM/IST does not error. It silently expires every
 * QR the moment it is minted, which is exactly how this was found.
 */
poolConnection.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

export const db = drizzle(poolConnection, { schema, mode: 'default' });
