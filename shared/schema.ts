import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Gaming profile fields
  gamertag: varchar("gamertag").unique(),
  bio: text("bio"),
  location: varchar("location"),
  age: integer("age"),
  preferredGames: text("preferred_games").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Match requests table
export const matchRequests = pgTable("match_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameName: varchar("game_name").notNull(),
  gameMode: varchar("game_mode").notNull(), // 1v1, 2v2, 3v3, etc.
  tournamentName: varchar("tournament_name"),
  description: text("description").notNull(),
  status: varchar("status").notNull().default("waiting"), // waiting, connected, declined
  region: varchar("region"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Match connections table
export const matchConnections = pgTable("match_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull().references(() => matchRequests.id),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  accepterId: varchar("accepter_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"), // pending, accepted, declined
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertMatchRequest = typeof matchRequests.$inferInsert;
export type MatchRequest = typeof matchRequests.$inferSelect;
export type InsertMatchConnection = typeof matchConnections.$inferInsert;
export type MatchConnection = typeof matchConnections.$inferSelect;

// Enhanced match request type that includes user profile data
export type MatchRequestWithUser = MatchRequest & {
  gamertag: string | null;
  profileImageUrl: string | null;
};

export const insertUserSchema = createInsertSchema(users);
export const insertMatchRequestSchema = createInsertSchema(matchRequests).omit({ id: true, userId: true, createdAt: true, updatedAt: true });
export const insertMatchConnectionSchema = createInsertSchema(matchConnections).omit({ id: true, createdAt: true, updatedAt: true });