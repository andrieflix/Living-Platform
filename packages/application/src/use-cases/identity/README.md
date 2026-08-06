# Identity (Users) Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `RegisterUser` — Create a new user account (email + password).
- `UpdateProfile` — Change display name, avatar, or preferences.
- `ChangePassword` — Change the current user's password.
- `RequestPasswordReset` — Send a password reset email.
- `ResetPassword` — Set a new password using a reset token.
- `DeleteAccount` — Soft-delete the user account.

## Queries

- `GetCurrentUser`, `GetUser` (public profile, same org), `ListUsers` (by
  membership).

## Long-running Operations

None.

## Background Jobs

- `PurgeDeletedAccounts` — Hard-delete soft-deleted accounts past retention.
- `SendPasswordResetEmail` — Send the reset email async.

## Events Produced

`UserRegistered`, `ProfileUpdated`, `PasswordChanged`, `PasswordReset`,
`AccountDeleted`.

## Events Consumed

`MemberRemoved` → if the user has no remaining memberships, prompt account
deletion.

## External Dependencies

Auth provider (Supabase Auth), email provider, database provider (profile
data).

## Authorization

Users manage only their own profile and password. Org `owner`/`admin` can
list users in their org. Platform admin can manage any account.

## Future Extension Points

SSO / OAuth, MFA, sessions management, account merging.

See `docs/use-cases.md` §11 for the full catalog.
