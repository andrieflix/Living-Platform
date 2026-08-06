import type {
  ExportJob,
  ExportScope,
  ExportFormatValue,
  ExportJobId,
  WebsiteId,
  OrganizationId,
  Result,
  DomainError,
} from "@livingsites/domain";

export interface ExportService {
  requestExport(input: {
    websiteId: WebsiteId;
    organizationId: OrganizationId;
    scope: ExportScope;
    format: ExportFormatValue;
  }): Promise<Result<ExportJob, DomainError>>;

  cancel(jobId: ExportJobId): Promise<Result<ExportJob, DomainError>>;

  getStatus(jobId: ExportJobId): Promise<Result<ExportJob, DomainError>>;

  reportProgress(jobId: ExportJobId, progress: number): Promise<Result<ExportJob, DomainError>>;

  complete(jobId: ExportJobId, downloadUrl: string, pagesCount: number): Promise<Result<ExportJob, DomainError>>;

  fail(jobId: ExportJobId, error: string): Promise<Result<ExportJob, DomainError>>;
}
