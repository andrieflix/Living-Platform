import type { AnalyticsProfile, AnalyticsSummary, MetricSeries, WebsiteId, ISODateString, PaginatedResult, PaginationParams, AggregateVersion } from "@livingsites/domain";
import type { CreateResult, SaveResult, MutationResult } from "../contracts";
export interface AnalyticsProfileRepository {
    findById(id: string): Promise<AnalyticsProfile | null>;
    findByWebsite(websiteId: WebsiteId): Promise<AnalyticsProfile | null>;
    list(params: PaginationParams & {
        provider?: string;
    }): Promise<PaginatedResult<AnalyticsProfile>>;
    create(candidate: Omit<AnalyticsProfile, "id" | "audit" | "version">): Promise<CreateResult<AnalyticsProfile>>;
    save(aggregate: AnalyticsProfile, expectedVersion: AggregateVersion): Promise<SaveResult<AnalyticsProfile>>;
    delete(id: string, expectedVersion: AggregateVersion): Promise<MutationResult>;
}
export interface AnalyticsMetricsStore {
    getSummary(websiteId: WebsiteId, range: {
        from: ISODateString;
        to: ISODateString;
    }): Promise<AnalyticsSummary>;
    getSeries(websiteId: WebsiteId, metricKey: string, range: {
        from: ISODateString;
        to: ISODateString;
    }): Promise<MetricSeries>;
}
//# sourceMappingURL=analytics.d.ts.map