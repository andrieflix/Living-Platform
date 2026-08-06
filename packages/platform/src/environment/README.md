# Environment

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The environment module provides **secure access to environment variables and
secrets**. It is the single place where raw environment values are read and
validated. All other modules receive their configuration through the config
module (non-secret) or through injected secret references (secret).

Environment is distinct from config: environment reads raw strings from the
host; config is the typed, frozen result of processing those values.

## Planned contracts

- **`EnvironmentSource`** — reads raw environment variables from the host
  (e.g. `process.env`, Deno env, or a `.env` file loader).
- **`Environment`** — a validated, typed view of environment variables
  including named secret references (never raw secret values exposed to
  callers).
- **`SecretRef`** — an opaque reference to a secret stored in platform secret
  storage. Callers use the ref to grant infrastructure access without ever
  seeing the secret value.

## Principles

1. **Secrets are never logged, serialized, or exposed as raw strings.** The
   environment module returns `SecretRef` references; only the infrastructure
   provider resolves a ref to the actual credential, and only at connection
   time.
2. **Environment is read once at boot.** After startup, the environment is
   frozen. No runtime code reads `process.env` directly.
3. **Missing required values fail fast.** If a required env var or secret is
   missing, the environment module throws at boot, not at first use.
4. **Environment is provider-agnostic.** It reads from the host environment
   abstraction, not from a specific cloud provider's secret manager. The
   composition root decides which `EnvironmentSource` to use.
