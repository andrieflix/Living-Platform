# Media Policies

> **Status:** Architecture only. No implementation.

## Purpose

Govern upload constraints, processing, and storage.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `MediaTypePolicy` | hard | Deny if MIME type is not allowed. |
| `FileSizePolicy` | hard | Deny if file size exceeds plan or platform max. |
| `ImageDimensionsPolicy` | mixed | Warn if too large; deny if below minimum. |
| `StorageQuotaPolicy` | hard | Deny if upload exceeds org storage quota. (Shared with subscription.) |
| `DuplicateUploadPolicy` | soft | Warn if a media item with the same hash exists. |
| `DangerousContentPolicy` | hard | Deny if file extension is dangerous. |
| `AltTextPolicy` | soft | Warn if alt text is empty or too short. |

## Inputs

`mimeType`, `fileSize`, `width`, `height`, `fileHash`, `plan`, `orgId`.

## Evaluation

Synchronous. Evaluated at upload time (before storage) and at metadata update
time (alt text). `StorageQuotaPolicy` is shared with subscription policies.

See `docs/policies.md` §5 for the full catalog.
