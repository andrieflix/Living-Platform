/**
 * Analytics bounded context — measurement configuration and aggregated metrics.
 *
 * AnalyticsProfile holds provider integration config per website. Raw event
 * ingestion and provider API calls are implementation concerns; the domain
 * models the profile and the aggregated metrics surfaced to the UI.
 */
import type { WebsiteId, PageId, ISODateString, AuditTrail, AggregateVersion } from "../shared";
/** Per-website analytics integration configuration. */
export interface AnalyticsProfile {
    readonly id: string;
    readonly websiteId: WebsiteId;
    /** Provider key, e.g. "google", "plausible", "internal". */
    provider: AnalyticsProviderValue;
    /** Provider-specific integration credentials references (never raw secrets). */
    config: Readonly<Record<string, unknown>>;
    /** Whether server-side event forwarding is enabled. */
    serverSideForwarding: boolean;
    /** Whether cookieless/tracking-consent mode is enabled. */
    consentMode: boolean;
    isActive: boolean;
    /** Optimistic concurrency version. Monotonically incremented on each save. */
    version: AggregateVersion;
    readonly audit: AuditTrail;
}
/** A single aggregated metric data point. */
export interface MetricPoint {
    readonly date: ISODateString;
    readonly value: number;
}
/** A named series of metric points for charting. */
export interface MetricSeries {
    readonly key: string;
    readonly label: string;
    readonly unit: "count" | "percent" | "duration_ms" | "bytes";
    readonly points: readonly MetricPoint[];
}
/** Top-level analytics summary for a website over a date range. */
export interface AnalyticsSummary {
    readonly websiteId: WebsiteId;
    readonly range: {
        from: ISODateString;
        to: ISODateString;
    };
    readonly series: readonly MetricSeries[];
    /** Per-page breakdown of pageviews. */
    topPages: readonly PageAnalyticsRow[];
    /** Top referrers. */
    topReferrers: readonly ReferrerRow[];
    /** Geographic distribution (country-level). */
    topCountries: readonly GeoRow[];
}
export interface PageAnalyticsRow {
    readonly pageId: PageId;
    readonly path: string;
    readonly pageviews: number;
    readonly visitors: number;
    readonly avgTimeOnPageMs: number;
    readonly bounceRate: number;
}
export interface ReferrerRow {
    readonly source: string;
    readonly pageviews: number;
}
export interface GeoRow {
    readonly country: string;
    readonly pageviews: number;
    readonly visitors: number;
}
export declare enum AnalyticsProvider {
    Internal = "internal",
    Google = "google",
    Plausible = "plausible",
    Fathom = "fathom",
    Custom = "custom"
}
export declare enum MetricKey {
    Pageviews = "pageviews",
    UniqueVisitors = "unique_visitors",
    BounceRate = "bounce_rate",
    AvgSessionDuration = "avg_session_duration",
    AvgPageLoadMs = "avg_page_load_ms",
    Conversions = "conversions"
}
type AnalyticsProviderValue = `${AnalyticsProvider}`;
export {};
//# sourceMappingURL=types.d.ts.map