# Media Aggregates

> **Status:** Architecture only. No implementation.

## Aggregates

### Media (Root)
- **Children:** none (Folder is a separate aggregate)
- **Value objects:** AuditTrail, metadata (opaque EXIF/duration)
- **Invariants:** belongs to one Website, immutable url/mimeType/sizeBytes, folderId in same website, soft-delete with retention then storage purge
- **Repository:** MediaRepository
- **Transaction boundary:** Media row (metadata only; file content in storage adapter)

### Folder (Root)
- **Children:** none (tree via parentId references by ID)
- **Value objects:** AuditTrail
- **Invariants:** belongs to one Website, unique name within parent, no circular refs, media re-parented on delete
- **Repository:** FolderRepository
- **Transaction boundary:** Folder row

See `docs/aggregates.md` §10–11 for full details.
