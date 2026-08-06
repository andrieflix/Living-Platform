# Media Repository Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `MediaRepositoryAdapter` adapts the application-layer `MediaRepository`
and `FolderRepository` interfaces to infrastructure providers. Unlike
purely database-backed adapters, the media adapter also coordinates with the
`StorageAdapter` — metadata goes to the database, file blobs go to storage.

## Planned contracts

- **`MediaRepositoryAdapter`** — extends `MediaRepository` and
  `FolderRepository` with `DatabaseBackedAdapter` lifecycle methods.
- The adapter implementation will use both `DatabaseAdapter` (for metadata)
  and `StorageAdapter` (for file blobs), though the contract only specifies
  the database-backed lifecycle.

## Principles

1. The adapter implements the application-layer contracts — use cases see no
   difference.
2. Metadata (alt text, captions, tags, folder membership) is stored in the
   database; file content is stored in object storage. The adapter
   coordinates both.
3. Soft-delete marks the database record; a background job purges the storage
   object after the retention window.
