# Config

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The config module provides a **typed, read-only view of application
configuration** loaded at startup. It is the single source of truth for
non-secret configuration values that runtime services need: limits, timeouts,
URLs, feature defaults, and environment-specific settings.

Config is distinct from environment (which reads raw env vars/secrets) and
from feature flags (which are dynamic, runtime-evaluated toggles). Config is
loaded once at boot and frozen for the application lifetime.

## Planned contracts

- **`ConfigSource`** — a loader interface that produces a `Config` object from
  a source (env vars, JSON file, remote config service).
- **`Config`** — a frozen, typed configuration object with typed accessors for
  each configuration section.
- **`ConfigSection`** — a named section of config (e.g. `HttpConfig`,
  `StorageConfig`, `ExportConfig`) with validated fields.

## Principles

1. **Config is immutable after load.** Once the composition root loads config
   at boot, it is frozen. Runtime code never mutates config.
2. **Config is typed.** Each section has an explicit interface; consumers
   access fields through typed accessors, not string-keyed lookups.
3. **Config does not hold secrets.** Secrets (API keys, database passwords)
   are handled by the environment module and platform secret storage. Config
   holds non-secret settings only.
4. **Config validation happens at boot.** Invalid config fails fast at startup,
   not at first use in a request.
