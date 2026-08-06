/**
 * Export bounded context — producing portable website bundles.
 *
 * An ExportJob represents a request to package a Website (or a snapshot of it)
 * into a downloadable, portable format (static HTML, ZIP, etc.). Jobs are
 * asynchronous and progress-tracked.
 */
import type {
  ExportJobId,
  WebsiteId,
  OrganizationId,
  PageId,
  ISODateString,
  AuditTrail,
  AggregateVersion,
} from "../shared";

/** A single export job. */
export interface ExportJob {
  readonly id: ExportJobId;
  readonly websiteId: WebsiteId;
  readonly organizationId: OrganizationId;
  /** What is being exported. */
  scope: ExportScope;
  /** Output format. */
  format: ExportFormatValue;
  status: ExportJobStatusValue;
  /** 0..1 progress fraction. */
  progress: number;
  /** Number of pages included (filled during processing). */
  pagesCount?: number;
  /** Download URL once status === "completed". */
  downloadUrl?: string;
  /** Error message if status === "failed". */
  error?: string;
  /** Requested at / started at / completed at timestamps. */
  requestedAt: ISODateString;
  startedAt?: ISODateString;
  completedAt?: ISODateString;
  /** Optimistic concurrency version. Monotonically incremented on each save. */
  version: AggregateVersion;
  readonly audit: AuditTrail;
}

/** What gets included in an export. */
export type ExportScope =
  | { kind: "full_site" }
  | { kind: "pages"; pageIds: readonly PageId[] }
  | { kind: "published_only" };

export enum ExportFormat {
  StaticHtml = "static_html",
  Zip = "zip",
  Json = "json",
}

export enum ExportJobStatus {
  Pending = "pending",
  Queued = "queued",
  Processing = "processing",
  Completed = "completed",
  Failed = "failed",
  Canceled = "canceled",
  Expired = "expired",
}

type ExportFormatValue = `${ExportFormat}`;
type ExportJobStatusValue = `${ExportJobStatus}`;
export type { ExportFormatValue, ExportJobStatusValue };
