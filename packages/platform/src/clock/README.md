# Clock

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The clock module provides a **time abstraction** so that services never call
`Date.now()` or `new Date()` directly. This makes time-dependent logic
deterministic and testable: tests inject a fake clock; production uses the
real clock.

## Planned contracts

- **`Clock`** — the time provider interface: returns the current time as an
  ISO-8601 string (matching the domain's `ISODateString`) and as a Unix
  epoch millisecond number.
- **`FixedClock`** — a test clock pinned to a specific time, advanced
  manually.
- **`SystemClock`** — the production clock backed by the host system time.

## Principles

1. **Services receive a Clock via injection.** No service constructs `new
   Date()`. The composition root provides the clock.
2. **Clock returns ISODateString for domain use.** The domain's
   `ISODateString` branded type is the canonical timestamp format; the clock
   returns strings in that format.
3. **Clock is singleton.** One clock instance for the application lifetime.
4. **Clock is timezone-agnostic.** All times are UTC. Local time formatting is
   a presentation concern, not a platform concern.
