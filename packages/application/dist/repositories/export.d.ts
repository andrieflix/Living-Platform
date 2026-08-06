import type { ExportJob, ExportJobStatusValue, ExportJobId, WebsiteId, OrganizationId, PaginatedResult, PaginationParams, AggregateVersion } from "@livingsites/domain";
import type { CreateResult, SaveResult } from "../contracts";
export interface ExportJobListParams extends PaginationParams {
    websiteId?: WebsiteId;
    organizationId?: OrganizationId;
    status?: ExportJobStatusValue;
}
export interface ExportJobRepository {
    findById(id: ExportJobId): Promise<ExportJob | null>;
    list(params: ExportJobListParams): Promise<PaginatedResult<ExportJob>>;
    create(candidate: Omit<ExportJob, "id" | "audit" | "version">): Promise<CreateResult<ExportJob>>;
    save(aggregate: ExportJob, expectedVersion: AggregateVersion): Promise<SaveResult<ExportJob>>;
    updateStatus(id: ExportJobId, status: ExportJobStatusValue, expectedVersion: AggregateVersion, changes?: Partial<Pick<ExportJob, "progress" | "pagesCount" | "downloadUrl" | "error" | "startedAt" | "completedAt">>): Promise<SaveResult<ExportJob>>;
}
//# sourceMappingURL=export.d.ts.map