# Storage Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `StorageAdapter` represents the capability to upload, download, delete,
and generate presigned URLs for file storage. Media repository and service
implementations use it to store and retrieve media files.

No specific storage provider is named. A future Supabase Storage adapter, an
S3 adapter, or a local filesystem adapter would all implement this contract.

## Planned contracts

- **`StorageAdapter`** — upload, download, delete, presign, stat.
- **`StorageObject`** — metadata for a stored object (key, size, MIME type,
  etag, last-modified).
- **`PresignedUrl`** — a time-limited URL for uploading or downloading.

## Principles

1. **The adapter is provider-agnostic.** It uses generic operations (put,
   get, delete, presign), not provider-specific SDK calls.
2. **Paths are org-scoped.** Storage paths include the org ID to enforce
   tenant isolation at the storage level.
3. **Presigned URLs have TTLs.** The adapter enforces a maximum TTL,
   configurable via platform config.
4. **The adapter uses platform runtime capabilities.** A storage adapter
   implementation uses `Logger` for operation logging.
