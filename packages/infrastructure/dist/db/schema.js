/**
 * Drizzle schema for all Living Sites tables.
 *
 * Internal to Infrastructure. Row types are NOT exported from the
 * Infrastructure public barrel — they stay private to the Drizzle adapter
 * modules. Only adapters and composition-facing factories are exported.
 */
import { pgTable, text, integer, numeric, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
/* ---------- Organizations ---------- */
export const orgStatusEnum = pgEnum("org_status", ["active", "archived", "deleted"]);
export const organizations = pgTable("organizations", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    billing_email: text("billing_email").notNull(),
    plan_id: text("plan_id"),
    status: orgStatusEnum("status").notNull().default("active"),
    feature_overrides: text("feature_overrides").notNull().default("[]"),
    version: integer("version").notNull().default(1),
    created_at: timestamp("created_at", { withTimezone: true }).notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull(),
    created_by: text("created_by"),
    updated_by: text("updated_by"),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
});
/* ---------- Plans ---------- */
export const planTierEnum = pgEnum("plan_tier", ["starter", "pro", "business", "enterprise"]);
export const featureCategoryEnum = pgEnum("feature_category", ["limit", "capability", "addon"]);
export const plans = pgTable("plans", {
    id: text("id").primaryKey(),
    tier: planTierEnum("tier").notNull(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    price_monthly: integer("price_monthly").notNull().default(0),
    price_annual: integer("price_annual").notNull().default(0),
    currency: text("currency").notNull().default("usd"),
    max_websites: integer("max_websites"),
    max_members: integer("max_members"),
    custom_domains_allowed: boolean("custom_domains_allowed").notNull().default(false),
    is_active: boolean("is_active").notNull().default(true),
    version: integer("version").notNull().default(1),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    created_by: text("created_by"),
    updated_by: text("updated_by"),
    deactivated_at: timestamp("deactivated_at", { withTimezone: true }),
});
/* ---------- Features ---------- */
export const features = pgTable("features", {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    category: featureCategoryEnum("category").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    value_type: text("value_type").notNull().default("boolean"),
    is_active: boolean("is_active").notNull().default(true),
    version: integer("version").notNull().default(1),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    created_by: text("created_by"),
    updated_by: text("updated_by"),
});
/* ---------- Plan Feature Entitlements ---------- */
export const planFeatureEntitlements = pgTable("plan_feature_entitlements", {
    id: text("id").primaryKey(),
    plan_id: text("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
    feature_id: text("feature_id").notNull().references(() => features.id, { onDelete: "cascade" }),
    value: numeric("value").notNull().default("0"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
/* ---------- Application Outbox ---------- */
export const applicationOutbox = pgTable("application_outbox", {
    id: text("id").primaryKey(),
    event_type: text("event_type").notNull(),
    aggregate_type: text("aggregate_type").notNull(),
    aggregate_id: text("aggregate_id").notNull(),
    organization_id: text("organization_id"),
    website_id: text("website_id"),
    payload: jsonb("payload").notNull(),
    occurred_at: timestamp("occurred_at", { withTimezone: true }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    status: text("status").notNull().default("pending"),
    attempt_count: integer("attempt_count").notNull().default(0),
    available_at: timestamp("available_at", { withTimezone: true }).notNull().defaultNow(),
    processed_at: timestamp("processed_at", { withTimezone: true }),
    last_error: text("last_error"),
    idempotency_key: text("idempotency_key").notNull().unique(),
    schema_version: text("schema_version").notNull().default("1.0.0"),
});
//# sourceMappingURL=schema.js.map