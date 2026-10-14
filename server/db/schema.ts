import { sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Stored lower-cased (see db/users.ts), so the unique index is effectively
  // case-insensitive.
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const tracks = pgTable(
  "tracks",
  {
    // Minted in Node before the upload starts, so the object keys in the
    // bucket can be grouped under the track id.
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default(""),
    album: text("album").notNull().default(""),
    artist: text("artist").notNull().default(""),
    body: text("body").notNull().default(""),
    audioKey: text("audio_key").notNull(),
    artKey: text("art_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    // The 'simple' configuration skips English stemming, which would mangle
    // artist names and non-English titles.
    search: tsvector("search")
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`to_tsvector('simple', ${tracks.title} || ' ' || ${tracks.artist} || ' ' || ${tracks.album} || ' ' || ${tracks.body})`,
      ),
  },
  (table) => [
    index("tracks_search_idx").using("gin", table.search),
    index("tracks_created_at_idx").on(table.createdAt.desc()),
  ],
);

// connect-pg-simple's table, declared here so the migrations own every table.
export const session = pgTable(
  "session",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire", { precision: 6 }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);
