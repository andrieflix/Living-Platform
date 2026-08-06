# ID Generation

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The ids module provides a **unique identifier generation contract** so that
services never call `crypto.randomUUID()` or `uuid()` directly. Centralizing
ID generation ensures all IDs follow the same format (UUID v7 or ULID for
time-sortable keys), are testable (fake generators for deterministic tests),
and can be traced.

## Planned contracts

- **`IdGenerator`** — generates unique identifiers as strings.
- **`IdFormat`** — enum of supported ID formats (uuid4, uuid7, ulid, nanoid).
- **`PrefixedIdGenerator`** — generates IDs with a type prefix (e.g.
  `org_01J...`, `page_01J...`) for human readability in logs and URLs.

## Principles

1. **IDs are time-sortable by default.** UUID v7 or ULID is preferred so that
   database indexes and log entries sort naturally by creation time.
2. **IDs are strings.** The domain brands them into typed IDs
   (`OrganizationId`, etc.); the platform generator produces the raw string,
   and the composition root or service applies the brand.
3. **ID generation is injectable.** Tests inject a deterministic generator;
   production uses the cryptographic generator.
4. **No ID collisions.** The generator contract guarantees uniqueness within
   the application lifetime; the database enforces uniqueness across
   restarts.
