import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// ============================================================================
// DO NOT RUN `drizzle-kit push` OR `drizzle-kit generate` AGAINST THIS DATABASE
// ============================================================================
// Zuppgate and Zuppdate now share one database (`zups`), and its schema is
// owned end-to-end by Zuppdate's prisma/schema.prisma. Drizzle is used here as
// a query builder only.
//
// Why this matters: drizzle-kit only knows about the 21 tables in db/schema.ts.
// Pushing would see Zuppdate's 56 tables as unknown and offer to drop them —
// and `db/schema.ts` declares only 8 of this product's 25 real foreign keys, so
// a push would also silently delete the other 17 constraints.
//
// To change the Zuppgate schema:
//   1. Edit the ZUPPGATE section of zuppdate/prisma/schema.prisma.
//   2. Run `npx prisma migrate dev --name <change>` from the zuppdate project.
//   3. Mirror the change in db/schema.ts here so queries stay type-correct.
//
// `drizzle-kit studio` is read-only and remains safe to use.
export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
