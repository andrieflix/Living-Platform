# Logging

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The logging module provides a **structured, leveled logging contract** that
every runtime service uses to emit diagnostic output. It decouples log
emission from log destination: the contract defines how to log; the
composition root decides where logs go (console, JSON file, external log
aggregator).

## Planned contracts

- **`Logger`** — the primary logging interface with leveled methods
  (`trace`, `debug`, `info`, `warn`, `error`) that accept structured fields.
- **`LogEntry`** — a structured log record: timestamp, level, message, fields,
  optional correlation id.
- **`LogLevel`** — the severity level enum (re-exported from environment for
  convenience).
- **`LoggerFactory`** — creates a child logger scoped to a named component
  (e.g. `PageService`, `MediaRepository`). Child loggers auto-attach the
  component name and optional correlation id to every entry.

## Principles

1. **Logs are structured, not string-formatted.** Every log call accepts a
   fields object alongside the message. This enables filtering and aggregation
   in log platforms.
2. **Loggers are hierarchical.** A child logger inherits its parent's level
   and sinks but adds a scoped name. This makes it trivial to filter logs by
   component.
3. **No secrets in logs.** The logger contract does not prevent a caller from
   passing a secret, but infrastructure implementations should redact known
   secret fields. Callers must never log raw credentials.
4. **Logging is never blocking.** Log emission is fire-and-forget from the
   caller's perspective; the sink handles buffering and flushing.
