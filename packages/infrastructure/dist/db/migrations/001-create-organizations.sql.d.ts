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
export declare const migrationSql = "\nCREATE TABLE IF NOT EXISTS organizations (\n  id TEXT PRIMARY KEY,\n  name TEXT NOT NULL,\n  slug TEXT NOT NULL UNIQUE,\n  billing_email TEXT NOT NULL,\n  plan_id TEXT,\n  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),\n  feature_overrides TEXT NOT NULL DEFAULT '[]',\n  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),\n  created_at TIMESTAMPTZ NOT NULL,\n  updated_at TIMESTAMPTZ NOT NULL,\n  created_by TEXT,\n  updated_by TEXT,\n  deleted_at TIMESTAMPTZ\n);\n\nCREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations (slug);\nCREATE INDEX IF NOT EXISTS idx_organizations_plan_id ON organizations (plan_id);\nCREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations (status);\n";
//# sourceMappingURL=001-create-organizations.sql.d.ts.map