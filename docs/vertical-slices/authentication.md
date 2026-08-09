# Authentication Vertical Slice

## Overview

This document describes the first authentication vertical slice for Living Platform, implemented using Better Auth with email-and-password authentication, secure sessions, and identity linkage to the Living Platform User aggregate.

## Architecture

### Authentication Boundary

The Application layer defines a provider-independent `AuthenticationPort` that exposes only the capabilities Living Platform needs:

- `registerWithEmail`
- `signInWithEmail`
- `signOut`
- `getSession`
- `revokeSession`
- `verifyEmail`
- `generateEmailVerificationToken`

Application-owned types (`AuthenticatedIdentity`, `AuthenticationSession`, `RegistrationInput`, `SignInInput`, `AuthenticationError`) do not expose Better Auth types, cookies, or database table types.

Better Auth-specific code lives only in:
- `packages/infrastructure/src/adapters/better-auth/` — the adapter
- `packages/composition/src/production.ts` — the composition root
- `app/lib/auth.ts` — the Next.js route handler entry point

### Identity Ownership Model

**Authentication identity** — owned by Better Auth:
- Credentials and password hash
- Sessions
- Account/provider linkage
- Verification tokens

**Living Platform User** — owned by the Domain:
- `UserId` (Domain-owned, not the Better Auth user ID)
- `authSubjectId` (opaque reference to the Better Auth user ID)
- Email (normalized)
- Display name
- Lifecycle status
- Audit fields
- Future Membership relationships

The `authSubjectId` is unique across all Platform Users. The Better Auth internal user ID never becomes the Domain `UserId` implicitly.

### Registration Transaction

The `RegisterUser` use case:
1. Validates and normalizes input
2. Checks registration mode (open/invite_only/disabled)
3. Creates the Better Auth identity via `AuthenticationPort`
4. Creates the Living Platform User aggregate
5. Persists the User linkage via `UserCreator`
6. If persistence fails, compensates by revoking the auth identity
7. Emits `UserRegistered` only after successful persistence
8. Returns a typed result

### Consistency Strategy

Better Auth identity creation and Platform User creation cannot share a single repository transaction because Better Auth controls part of the persistence flow. We use a documented compensation flow:

1. Create the Better Auth identity
2. Attempt to create the Platform User
3. If Platform User creation fails, revoke the Better Auth session/identity
4. Record the failure safely
5. Never leave an active authentication identity without a corresponding Platform User

See ADR 010 for the permanent decision.

### Registration Modes

`AUTH_REGISTRATION_MODE` environment variable controls registration:

- `open` — anyone can register (development default)
- `invite_only` — registration requires an invitation (production default; not yet implemented, returns `invitation_required`)
- `disabled` — registration is blocked entirely

Registration mode is enforced server-side by the `RegisterUser` use case. Changing UI visibility alone is insufficient.

### Email Verification

Email verification is enabled via Better Auth's built-in workflow. Email delivery is provider-agnostic through the `EmailVerificationPort`:

- Test-support provides `CapturingVerificationEmailAdapter`
- Development may log a safe verification URL only when explicitly enabled
- Production composition fails fast if email verification is enabled but no `EmailAdapter` is configured
- No production no-op email sender
- Verification tokens never appear in standard logs
- Verification links use trusted origins

### Session Security

- HTTP-only cookies
- Secure cookies in production
- SameSite=lax
- CSRF protection via Better Auth's supported model
- Trusted-origin checks
- No session token in localStorage
- No authentication secret in client bundles
- No raw session database rows exposed to UI

### Events

- `UserRegistered` — durable through the outbox
- `EmailVerified` — emitted on successful verification
- `UserSignedIn` / `UserSignedOut` — deferred (not forced through the outbox unless audit requirements justify it)

No password, session token, verification token, full cookie data, or raw IP addresses appear in events or logs.

## Next.js Routes

- `/login` — email/password sign-in form
- `/register` — registration form (respects registration mode)
- `/verify-email` — email verification completion
- `/admin` — protected placeholder showing display name, email, and sign-out
- `/api/auth/[...all]` — Better Auth route handler

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BETTER_AUTH_SECRET` | Yes (production) | Secret key for signing sessions (min 32 chars) |
| `BETTER_AUTH_URL` | Yes (production) | Application base URL |
| `TRUSTED_ORIGINS` | Yes (production) | Comma-separated trusted origins |
| `AUTH_REGISTRATION_MODE` | No | `open`, `invite_only`, or `disabled` (default: `invite_only`) |
| `EMAIL_VERIFICATION_ENABLED` | No | `true` to require email verification |
| `POSTGRES_COMPAT_DATABASE_URL` | No | For optional PostgreSQL compatibility tests |

## First Admin Bootstrap Strategy

The first Super Admin will be bootstrapped through a dedicated, audited CLI command or a sealed bootstrap token — not through open registration. No Super Admin email is hardcoded. This capability is deferred to a future sprint.

## Known Deferred Capabilities

- Organization authorization
- Membership permissions
- Custom roles
- Organization invitations
- Client dashboards
- Website management, pages, page builder
- Media, SEO, forms
- Billing
- Social OAuth, MFA, magic links
- API keys, plugins
- Password reset flow
- Password strength meter UI
- User update/archive/restore/delete
- First-admin bootstrap CLI
