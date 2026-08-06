# ADR 009: RLS Deferred to Authentication/Tenant Engine Milestone

## Status

Accepted

## Context

Sprint 10 added RLS (Row Level Security) statements to database migrations
that were modeled on Supabase auth assumptions (`auth.uid()`, Supabase
JWT claims, Supabase roles). The corrective milestone replaces Supabase
with Netlify Database, which is server-side Postgres and does not
automatically provide Supabase auth context.

The current platform has no authentication or tenant context. The
Organization slice is pre-authentication. Retaining RLS policies that
depend on `auth.uid()` or Supabase roles would cause runtime failures —
those functions and roles do not exist in Netlify Database.

## Decision

1. **Remove Supabase-specific RLS assumptions.** The migrations in
   `netlify/database/migrations/` do not include RLS statements.
   Standard database constraints (primary keys, foreign keys, unique
   indexes, NOT NULL) remain in place.

2. **Do not enable RLS at this milestone.** The server-side database
   role has full access to all tables. This is acceptable because:
   - The application accesses the database server-side only (via
     Infrastructure adapters and the composition root).
   - There is no browser-to-database direct access.
   - There is no multi-tenant isolation requirement until authentication
     and tenant context exist.

3. **Defer RLS to the Authentication/Tenant Engine milestone.** When
   authentication is added, RLS policies will be designed with the
   actual auth provider (not Supabase), tenant context, and ownership
   predicates appropriate to the platform's multi-tenant model.

4. **Document this deferral explicitly.** This ADR serves as the
   documented decision. The previous ADR 008 (Transactional Outbox)
   is not affected — it addresses persistence atomicity, not access
   control.

## Consequences

- The server-side database role can perform all required operations
  without RLS policy failures.
- No `auth.uid()`, Supabase JWT, or Supabase role dependencies remain.
- Tenant isolation is NOT implemented and must not be assumed.
- When authentication is added, a new ADR will document the RLS
  strategy with the actual auth provider.
