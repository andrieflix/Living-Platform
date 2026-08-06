/**
 * Telemetry module — metrics and tracing contracts.
 *
 * Contracts only. No implementation in this milestone.
 */

export interface TelemetrySink {
  recordCounter(key: MetricKey, value?: number): void;
  recordGauge(key: MetricKey, value: number): void;
  recordHistogram(key: MetricKey, value: number): void;
  startSpan(name: string, parent?: Span): Span;
}

export interface Meter {
  counter(key: MetricKey, value?: number): void;
  gauge(key: MetricKey, value: number): void;
  histogram(key: MetricKey, value: number): void;
}

export interface Tracer {
  startSpan(name: string, parent?: Span): Span;
}

export interface Span {
  readonly name: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
  readonly correlationId?: string;
  setAttribute(key: string, value: string | number | boolean): void;
  end(): void;
  readonly ended: boolean;
}

export interface MetricKey {
  readonly name: string;
  readonly tags?: Readonly<Record<string, string>>;
}

export interface Telemetry {
  readonly meter: Meter;
  readonly tracer: Tracer;
}
