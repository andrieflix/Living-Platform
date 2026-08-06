# Export Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `StartExportJob` — Begin an export (full, partial, or single page) in a specified format.
- `CancelExportJob` — Cancel a running export job.
- `DeleteExportJob` — Delete a completed export job and its output.

## Queries

- `GetExportJob`, `ListExportJobs`, `DownloadExport` (presigned URL).

## Long-running Operations

- `ExecuteExport` — Gather snapshots, render to target format (HTML, ZIP,
  PDF, JSON), upload to storage, mark job complete.

## Background Jobs

- `ExecuteExportJob` — Run `ExecuteExport` for a queued job.
- `PurgeOldExports` — Delete export outputs past retention.
- `RetryFailedExport` — Retry a job that failed due to a transient error.

## Events Produced

`ExportJobStarted`, `ExportJobCompleted`, `ExportJobFailed`,
`ExportJobCancelled`.

## Events Consumed

None. Export reads from content and rendering contexts but does not react to
events.

## External Dependencies

Database provider, storage provider, rendering service, queue provider.

## Authorization

Website `admin`+ for all export operations.

## Future Extension Points

Scheduled exports, import, custom export templates, multi-site export.

See `docs/use-cases.md` §9 for the full catalog.
