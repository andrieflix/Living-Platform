# Logging Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `LoggingAdapter` represents the capability to route structured log
entries to an external log destination. It bridges the platform's `Logger`
contract to a concrete log sink. A future implementation may back this with
console JSON, a file-based logger, or an external log aggregator (e.g.
Logtail, Datadog Logs).

## Planned contracts

- **`LoggingAdapter`** — flushes `LogEntry` records to a destination.
- **`LogFlushResult`** — the result of a flush operation.

## Principles

1. **The adapter is provider-agnostic.** It receives `LogEntry` records from
   the platform logging module, not provider-specific log formats.
2. **Logging is non-blocking.** The adapter buffers entries and flushes
   asynchronously. A failed flush does not affect application behavior.
3. **The adapter implements the platform `LoggerFactory` contract.** The
   composition root binds the adapter as the logger factory for the platform
   logging module.
4. **Secrets are redacted.** The adapter redacts known secret fields (API
   keys, tokens, passwords) before forwarding to the destination.
