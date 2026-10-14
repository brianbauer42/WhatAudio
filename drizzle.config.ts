import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Used by `pnpm run db:generate` / `db:migrate`. The server itself applies
// migrations on boot (see server/db/index.ts) with the same folder.
export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://whataudio:whataudio@127.0.0.1:5432/whataudio",
  },
});
