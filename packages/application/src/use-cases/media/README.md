# Media Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `UploadMedia` — Upload a file, store it, create a media record.
- `UpdateMediaMetadata` — Change alt text, caption, or tags.
- `MoveMediaToFolder` — Move a media item to a different folder.
- `DeleteMedia` — Soft-delete a media item.
- `CreateFolder`, `UpdateFolder`, `DeleteFolder` — Manage media folders.

## Queries

- `GetMedia`, `ListMedia`, `ListFolders`, `GetMediaUrl` (presigned, time-limited).

## Long-running Operations

- `ProcessUpload` — Generate thumbnails, extract metadata, transcode video.

## Background Jobs

- `GenerateThumbnails` — After upload completes.
- `TranscodeVideo` — After upload (video only).
- `PurgeDeletedMedia` — Hard-delete storage objects past retention.

## Events Produced

`MediaUploaded`, `MediaMetadataUpdated`, `MediaDeleted`, `MediaProcessed`,
`FolderCreated`, `FolderUpdated`, `FolderDeleted`.

## Events Consumed

`WebsiteArchived` → cascade-soft-delete all media.

## External Dependencies

Storage provider, database provider, image processing service, video
transcoding service.

## Authorization

Website `editor`+: upload, update, move, create folders. Website `admin`+:
delete media and folders.

## Future Extension Points

CDN integration, AI alt-text generation, drag-and-drop folder organization,
media search.

See `docs/use-cases.md` §5 for the full catalog.
