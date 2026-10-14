import path from "node:path";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { config } from "../config.js";
import * as schema from "./schema.js";

// Works both from `server/db/` under tsx and from `server-built/db/` after `tsc`.
const migrationsFolder = path.resolve(import.meta.dirname, "..", "..", "drizzle");

export const pool = new pg.Pool({ connectionString: config.databaseUrl });
pool.on("error", (error) => {
  console.error("Postgres pool error:", error);
});

export const db = drizzle(pool, { schema });

/** Applies any SQL in drizzle/ that hasn't run yet. Idempotent, so it runs on every boot. */
export const runMigrations = async (): Promise<void> => {
  await migrate(db, { migrationsFolder });
  console.log("\x1b[32m%s\x1b[0m", "Postgres connected, migrations up to date");
};

export const closeDatabase = (): Promise<void> => pool.end();
