import type { AnalyticsProfile, AnalyticsSummary, MetricSeries, WebsiteId, ISODateString, Result, DomainError } from "@livingsites/domain";
export interface AnalyticsService {
    configureProfile(websiteId: WebsiteId, profile: Omit<AnalyticsProfile, "id" | "websiteId" | "audit">): Promise<Result<AnalyticsProfile, DomainError>>;
    getSummary(websiteId: WebsiteId, range: {
        from: ISODateString;
        to: ISODateString;
    }): Promise<Result<AnalyticsSummary, DomainError>>;
    getSeries(websiteId: WebsiteId, metricKey: string, range: {
        from: ISODateString;
        to: ISODateString;
    }): Promise<Result<MetricSeries, DomainError>>;
}
//# sourceMappingURL=analytics.d.ts.map