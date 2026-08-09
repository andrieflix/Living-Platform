/**
 * Identity linkage schema and reconciliation worker.
 *
 * Tracks the durable state of the link between a Better Auth identity
 * and a Platform User. When the RegisterUser use case creates a Better Auth
 * identity, it also creates a 'pending' linkage record. If Platform User
 * creation succeeds, the linkage is marked 'linked'. If it fails, the
 * linkage remains 'pending' and the reconciliation worker retries it.
 *
 * This prevents orphaned Better Auth identities from accumulating silently.
 */
import { pgTable, text, integer, timestamp, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";

export const linkageStatusEnum = pgEnum("linkage_status", ["pending", "linked", "failed"]);

export const identityLinkages = pgTable(
  "identity_linkages",
  {
    id: text("id").primaryKey(),
    auth_subject_id: text("auth_subject_id").notNull(),
    email: text("email").notNull(),
    display_name: text("display_name").notNull(),
    status: linkageStatusEnum("status").notNull().default("pending"),
    platform_user_id: text("platform_user_id"),
    failure_reason: text("failure_reason"),
    attempts: integer("attempts").notNull().default(0),
    max_attempts: integer("max_attempts").notNull().default(5),
    next_attempt_at: timestamp("next_attempt_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    completed_at: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("identity_linkages_auth_subject_idx").on(table.auth_subject_id),
    index("identity_linkages_status_idx").on(table.status, table.next_attempt_at),
  ],
);

export type IdentityLinkageRow = typeof identityLinkages.$inferSelect;
export type IdentityLinkageInsert = typeof identityLinkages.$inferInsert;
