# Authentication Operations

## Local Testing

### Unit Tests

```bash
npm run test:unit
```

Unit tests use in-memory adapters and require no database.

### Integration Tests

```bash
npm run test:integration
```

Integration tests use `@netlify/database-dev` to run against a real local Postgres-compatible database.

### PostgreSQL Compatibility Tests (Optional)

```bash
POSTGRES_COMPAT_DATABASE_URL=postgresql://... npm run test:postgres-compat
```

These tests are excluded from the default test suite and only run when `POSTGRES_COMPAT_DATABASE_URL` is supplied.

## Migrations

Auth migrations are in `netlify/database/migrations/0004_create_auth_and_users.sql`:

- `ba_user` — Better Auth user table
- `ba_session` — Better Auth session table
- `ba_account` — Better Auth account table (password hash, provider linkage)
- `ba_verification` — Better Auth verification token table
- `platform_users` — Living Platform User aggregate table

All migrations are additive and forward-only.

## Netlify CLI Commands

```bash
npx netlify database status
npx netlify database migrations apply
npx netlify dev
```

Netlify CLI 26+ is required. Remote branch checks are skipped when the repository is not linked or the environment is not authenticated.

## Production Composition

Production composition (`composeProduction`) fails fast on:
- Missing or short `BETTER_AUTH_SECRET` (minimum 32 characters)
- Invalid `BETTER_AUTH_URL`
- Missing or invalid trusted origins
- Email verification enabled without an `EmailAdapter`

Production composition contains no test-support imports and no in-memory authentication storage.

## Environment Setup

1. Set `BETTER_AUTH_SECRET` to a random string of at least 32 characters
2. Set `BETTER_AUTH_URL` to your application's base URL
3. Set `TRUSTED_ORIGINS` to a comma-separated list of trusted origins
4. Set `AUTH_REGISTRATION_MODE` to `invite_only` or `disabled` for production
5. If email verification is enabled, provide an `EmailAdapter` implementation
