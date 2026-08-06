/**
 * Telemetry adapter contracts — provider-agnostic telemetry export capability.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { TelemetrySink, Span, MetricKey } from "@livingsites/platform";
/** Exports metrics and traces to an external telemetry backend. */
export interface TelemetryAdapter extends TelemetrySink {
    flush(): Promise<TelemetryExportResult>;
    shutdown(): Promise<void>;
}
export interface TelemetryExportBatch {
    readonly counters: readonly TelemetryCounterRecord[];
    readonly gauges: readonly TelemetryGaugeRecord[];
    readonly histograms: readonly TelemetryHistogramRecord[];
    readonly spans: readonly Span[];
}
export interface TelemetryCounterRecord {
    readonly key: MetricKey;
    readonly value: number;
    readonly timestamp: string;
}
export interface TelemetryGaugeRecord {
    readonly key: MetricKey;
    readonly value: number;
    readonly timestamp: string;
}
export interface TelemetryHistogramRecord {
    readonly key: MetricKey;
    readonly value: number;
    readonly timestamp: string;
}
export interface TelemetryExportResult {
    readonly success: boolean;
    readonly exported: number;
    readonly failed: number;
    readonly error?: string;
}
//# sourceMappingURL=index.d.ts.map