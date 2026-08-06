# Telemetry

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The telemetry module provides contracts for **observing runtime behavior**:
metrics, traces, and spans. It decouples instrumentation from the telemetry
backend (e.g. OpenTelemetry, Datadog, custom) so that services can record
metrics and traces without knowing which aggregator is configured.

Telemetry is distinct from logging (discrete diagnostic events) and analytics
(business metrics about website visitors). Telemetry measures the platform's
own performance and health.

## Planned contracts

- **`TelemetrySink`** — the backend abstraction that receives metrics and
  spans. The composition root binds this to a concrete exporter.
- **`Meter`** — records numeric metrics: counters, gauges, histograms.
- **`Tracer`** — creates spans that measure a unit of work with start/end
  timing and parent-child relationships.
- **`Span`** — an in-flight trace span; ended spans are flushed to the sink.
- **`MetricKey`** — a typed, named metric identifier with tags.

## Principles

1. **Telemetry is non-blocking.** Recording a metric or starting a span must
   not measurably slow down the operation it observes.
2. **Telemetry is optional at the contract level.** If no sink is configured,
   the no-op implementation discards all telemetry. Services instrument freely
   without worrying about whether a backend is present.
3. **Telemetry is provider-agnostic.** The contracts use generic shapes
   (counters, gauges, histograms, spans). Mapping to OpenTelemetry, Datadog,
   or a custom backend is an infrastructure concern.
4. **Traces propagate correlation ids.** A span carries a correlation id that
   links to the logger's correlation id, so logs and traces can be joined.
