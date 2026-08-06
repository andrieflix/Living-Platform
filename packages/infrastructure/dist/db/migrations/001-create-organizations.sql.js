/**
 * Forward-only migration: create the organizations table.
 *
 * Run via: npx drizzle-kit push
 * Or with a configured PostgreSQL connection:
 *   DATABASE_URL=postgresql://user:pass@host:port/dbname npx drizzle-kit push
 *
 * This migration is additive — it creates a new table. It does not alter
 * or drop any existing tables. The unique slug constraint ensures global
 * slug uniqueness. The version column enforces optimistic concurrency.
 */
export const migrationSql = `
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  billing_email TEXT NOT NULL,
  plan_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  feature_overrides TEXT NOT NULL DEFAULT '[]',
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  created_by TEXT,
  updated_by TEXT,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations (slug);
CREATE INDEX IF NOT EXISTS idx_organizations_plan_id ON organizations (plan_id);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations (status);
`;
//# sourceMappingURL=001-create-organizations.sql.js.map