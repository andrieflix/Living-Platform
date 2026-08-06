# ADR 010: Identity-Linkage Consistency Strategy

## Status

Approved

## Context

Living Platform uses Better Auth as its authentication provider. When a new user registers, two separate records must be created:

1. A **Better Auth identity** (user, account with password hash, session) — created by Better Auth's `signUpEmail` API
2. A **Living Platform User** aggregate (with `authSubjectId` linking to the Better Auth user) — created by the `RegisterUser` use case via `UserCreator`

These two operations cannot share a single repository transaction because Better Auth controls its own persistence flow through its Drizzle adapter. The Better Auth API does not expose a hook that allows inserting the Platform User row within the same database transaction as the Better Auth user creation.

## Decision

We implement a **documented compensation flow**:

1. The `RegisterUser` use case calls `AuthenticationPort.registerWithEmail()` to create the Better Auth identity
2. If successful, the use case creates a `UserDraft` and calls `UserCreator.create()` to persist the Platform User
3. If Platform User creation fails (duplicate, persistence error, invalid state), the use case calls `AuthenticationPort.revokeSession()` to revoke the newly created auth identity
4. The failure is returned as a typed error
5. No active authentication identity is left without a corresponding Platform User

### Why not atomic?

Better Auth's `signUpEmail` endpoint manages its own database operations. The Drizzle adapter it uses does not expose a transaction boundary that the Application layer can join. Attempting to wrap both operations in a single transaction would require reaching into Better Auth's internals, which violates the provider boundary.

### Future improvement

If Better Auth adds database hooks or a pre/post-create callback that provides access to the transaction, we can upgrade to atomic linkage. Until then, the compensation flow is the documented strategy.

## Consequences

- A brief window exists where a Better Auth identity exists without a Platform User (between steps 1 and 2)
- If the process crashes between steps 1 and 2, an orphaned Better Auth identity may remain
- A future cleanup job should detect and handle orphaned identities
- The compensation flow handles all detectable failures within the use case
- The `UserRegistered` event is only emitted after successful Platform User persistence, so downstream consumers never see a registration event without a corresponding User
