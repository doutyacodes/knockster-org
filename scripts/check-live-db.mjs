/**
 * Checks whether a live database is reachable and usable.
 *
 *   node scripts/check-live-db.mjs                      # checks LIVE_COMBINED_DATABASE_URL
 *   node scripts/check-live-db.mjs DATABASE_URL         # checks a different env var
 *   node scripts/check-live-db.mjs "mysql://u:p@h/db"   # checks a URL directly
 *
 * Reads .env itself, so it needs no flags. Plain .mjs with no imports beyond
 * the MySQL driver, so it runs from either project.
 *
 * WHAT IT CAN AND CANNOT TELL YOU
 * On shared/cPanel MySQL, error 1044 ("Access denied ... to database X") is
 * returned BOTH when the database does not exist AND when it exists but your
 * user has no rights to it. MySQL does this deliberately so that probing cannot
 * disclose which databases exist. This script therefore runs a control probe
 * against a deliberately absent database name: if the real target and the
 * control return the same error, existence is genuinely indeterminate from
 * here, and it says so rather than guessing.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

/**
 * Works from either project, which declare different MySQL drivers:
 * knockster-org depends on mysql2 directly, while zuppdate reaches MySQL
 * through @prisma/adapter-mariadb and only has mysql2 transitively via prisma.
 * Relying on that transitive copy would break under a stricter installer or a
 * Prisma dependency bump, so fall back to mariadb, which zuppdate does declare.
 */
function loadDriver() {
  try {
    const mysql2 = require("mysql2/promise");
    return {
      name: "mysql2",
      connect: (cfg) => mysql2.createConnection(cfg),
    };
  } catch {}
  try {
    const mariadb = require("mariadb");
    return {
      name: "mariadb",
      connect: async (cfg) => {
        const conn = await mariadb.createConnection({ ...cfg, connectTimeout: cfg.connectTimeout });
        // Normalise to the small slice of the mysql2 API this script uses:
        // query() returning [rows], and end().
        return {
          query: async (sql, params) => [await conn.query(sql, params)],
          end: () => conn.end(),
        };
      },
    };
  } catch {}
  console.error("Neither mysql2 nor mariadb is installed. Run npm install in this project.");
  process.exit(1);
}

const driver = loadDriver();

function loadEnv() {
  for (const candidate of [resolve(here, "../.env"), resolve(process.cwd(), ".env")]) {
    try {
      const text = readFileSync(candidate, "utf8");
      const out = {};
      for (const line of text.split(/\r?\n/)) {
        const m = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line.trim());
        if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
      return { vars: out, path: candidate };
    } catch {}
  }
  return { vars: {}, path: null };
}

const arg = process.argv[2] ?? "LIVE_COMBINED_DATABASE_URL";
const { vars, path } = loadEnv();
const raw = arg.startsWith("mysql://") ? arg : vars[arg] ?? process.env[arg];

if (!raw) {
  console.error(`No value for ${arg}. Looked in ${path ?? "(no .env found)"} and the environment.`);
  process.exit(1);
}

const url = new URL(raw);
const user = decodeURIComponent(url.username);
const password = decodeURIComponent(url.password);
const database = url.pathname.slice(1);
const host = url.hostname;
const port = Number(url.port) || 3306;

console.log(`host     : ${host}:${port}`);
console.log(`user     : ${user}`);
console.log(`database : ${database}`);
console.log(`driver   : ${driver.name}\n`);

async function tryConnect(db) {
  let conn;
  try {
    conn = await driver.connect({
      host, port, user, password, database: db, connectTimeout: 15000,
    });
    await conn.query("SELECT 1");
    return { ok: true };
  } catch (e) {
    return { ok: false, code: e.code, errno: e.errno, message: e.message };
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}

const target = await tryConnect(database);

if (target.ok) {
  const conn = await driver.connect({ host, port, user, password, database });
  const [[{ n }]] = await conn.query(
    "SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?", [database]);
  const [[{ v }]] = await conn.query("SELECT VERSION() AS v");
  const [[{ tz }]] = await conn.query("SELECT @@system_time_zone AS tz");
  const [grants] = await conn.query("SHOW GRANTS");
  await conn.end();

  console.log(`REACHABLE. MySQL ${v}, system_time_zone=${tz}`);
  // Number(): the mariadb driver returns COUNT(*) as a BigInt, so a bare
  // `n === 0` is false for an empty database and the hint never prints.
  const tableCount = Number(n);
  console.log(`tables present: ${tableCount}${tableCount === 0 ? "  (empty — needs the schema applying)" : ""}`);
  console.log("grants:");
  for (const row of grants) console.log("  " + Object.values(row)[0]);
  if (tz !== "UTC") {
    console.log("\nNOTE: system_time_zone is not UTC. Zuppgate tables use MySQL TIMESTAMP,");
    console.log("which converts on read — see db/index.ts, which pins each session to UTC.");
  }
  process.exit(0);
}

// Not reachable. Work out how much can honestly be concluded.
if (target.errno === 1044) {
  const control = await tryConnect(`zz_control_absent_${Date.now()}`);
  const same = control.errno === 1044;
  console.log(`NOT USABLE: ${target.message}`);
  console.log("\nControl probe against a database that certainly does not exist:");
  console.log(`  ${control.ok ? "unexpectedly connected" : control.message}`);
  if (same) {
    console.log("\nSame error for both, so EXISTENCE CANNOT BE DETERMINED from here —");
    console.log("MySQL returns 1044 for both 'no such database' and 'no rights to it'.");
    console.log("Either way the fix is the same: in cPanel > MySQL Databases, create the");
    console.log(`database if needed, then 'Add User To Database' granting ${user} ALL PRIVILEGES.`);
  } else {
    console.log("\nThe control behaved differently, so this database does appear to EXIST;");
    console.log(`${user} simply has no grant on it. Add it in cPanel > MySQL Databases.`);
  }
  process.exit(2);
}

if (target.errno === 1049) {
  console.log(`DATABASE DOES NOT EXIST: ${target.message}`);
  console.log("Create it in cPanel > MySQL Databases, then grant this user ALL PRIVILEGES.");
  process.exit(2);
}

if (target.errno === 1045) {
  console.log(`BAD CREDENTIALS: ${target.message}`);
  console.log("Check the username and password in the URL.");
  process.exit(2);
}

console.log(`CONNECTION FAILED (${target.code}): ${target.message}`);
process.exit(2);
