# Seeding

## Migration vs Seed Data

**Migrations** define schema. **Seeds** populate platform-global
reference data. Seeds run via `npm run db:seed`, never automatically.

## Controlled Upsert Strategy

Seeds use **controlled upsert**: seed-owned fields are updated on rerun,
operational fields are preserved.

### Seed-owned fields (updated on rerun)

Plans: `tier`, `slug`, `name`, `description`, `price_monthly`,
`price_annual`, `currency`, `max_websites`, `max_members`,
`custom_domains_allowed`, `is_active`

Features: `key`, `category`, `name`, `description`, `value_type`,
`is_active`

Entitlements: `value`

### Preserved fields (never overwritten by seed)

- `version` (aggregate version)
- `created_at`, `updated_at` (audit metadata — `updated_at` is set on
  update, `created_at` is never changed)
- `created_by`, `updated_by` (operational audit)
- `deactivated_at` (admin-controlled deactivation state)

## Seeded Plans

| ID | Slug | Tier | Name |
|----|------|------|------|
| `plan_free` | free | starter | Free |
| `plan_lifetime` | lifetime | business | Lifetime |

## Seeded Features

| ID | Key | Category | Value Type |
|----|-----|----------|-----------|
| `feat_website_limit` | website_limit | limit | number |
| `feat_custom_domain` | custom_domain | capability | boolean |
| `feat_export_access` | export_access | capability | boolean |
| `feat_page_builder` | page_builder | capability | boolean |
| `feat_forms_access` | forms_access | capability | boolean |
| `feat_seo_access` | seo_access | capability | boolean |
| `feat_analytics_access` | analytics_access | capability | boolean |

## Idempotency

Rerunning the seed:
- Creates no duplicates (upsert by stable primary key)
- Updates changed seed-owned fields deterministically
- Preserves operational fields (version, audit, deactivation)
- Creates no customer-specific or Tajon-specific data

## Tests

Integration tests verify:
- Seed applies successfully
- Rerun creates no duplicates
- Changed seed-owned fields update deterministically
- Operational fields are preserved across reruns
- No Tajon-specific organization is created
