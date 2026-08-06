# Telemetry Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `TelemetryAdapter` represents the capability to export metrics and traces
to an external telemetry backend. It bridges the platform's
`TelemetrySink` contract to a concrete exporter. A future implementation may
back this with OpenTelemetry, Datadog, or a custom HTTP exporter.

## Planned contracts

- **`TelemetryAdapter`** — flush metrics, spans, and events to a backend.
- **`TelemetryExportBatch`** — a batch of metrics, spans, and events to
  export in a single call.
- **`TelemetryExportResult`** — the result of an export (success, partial,
  failure with error).

## Principles

1. **The adapter is provider-agnostic.** It receives generic metric and span
   shapes from the platform `TelemetrySink`, not provider-specific formats.
2. **Export is batched.** The adapter flushes in batches to reduce overhead.
3. **Export is non-blocking.** A failed export does not affect application
   behavior. The adapter logs the failure and retries on the next flush.
4. **The adapter implements the platform `TelemetrySink` contract.** The
   composition root binds the adapter as the sink for the platform telemetry
   module.
