/**
 * Database module — Drizzle ORM schema, connection, mapper, and migrations.
 *
 * All Drizzle types are confined to Infrastructure. Row types are NOT
 * exported from the public Infrastructure barrel — they stay private to
 * the Drizzle adapter module. Only approved adapters and composition-facing
 * factories are exported.
 */
export {
  organizations,
  orgStatusEnum,
  plans,
  planTierEnum,
  features,
  featureCategoryEnum,
  planFeatureEntitlements,
  applicationOutbox,
} from "./schema";
export { createDbConnection } from "./connection";
export type { DatabaseConfig, DbConnection } from "./connection";
export { seedPlansAndFeatures, PLAN_FREE_ID, PLAN_LIFETIME_ID, FEATURE_IDS } from "./seed";
export type { SeedResult } from "./seed";
