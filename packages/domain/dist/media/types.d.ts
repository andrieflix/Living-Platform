/**
 * Media bounded context — binary assets and their folder organization.
 *
 * Invariant: every Media asset and Folder belongs to exactly one Website.
 * Storage backend (Supabase Storage, S3, etc.) is replaceable; this context
 * only models the domain, never the storage transport.
 */
import type { MediaId, FolderId, WebsiteId, AuditTrail, LifecycleStatus, AggregateVersion } from "../shared";
/** A single binary asset in a website's media library. */
export interface Media {
    readonly id: MediaId;
    readonly websiteId: WebsiteId;
    readonly folderId: FolderId | null;
    /** Original filename as uploaded, e.g. "site-hero.jpg". */
    filename: string;
    /** MIME type, e.g. "image/jpeg". */
    mimeType: string;
    /** Size in bytes. */
    sizeBytes: number;
    /** Width in pixels for images/videos; null otherwise. */
    width?: number;
    /** Height in pixels for images/videos; null otherwise. */
    height?: number;
    /** Alt text for accessibility and SEO. Required for images used in content. */
    altText?: string;
    /** CDN/storage URL for serving. Never a local path. */
    url: string;
    /** Optional thumbnail URL. */
    thumbnailUrl?: string;
    /** Per-asset metadata extracted at upload (EXIF, duration, etc.). */
    metadata?: Readonly<Record<string, unknown>>;
    status: LifecycleStatus;
    /** Optimistic concurrency version. Monotonically incremented on each save. */
    version: AggregateVersion;
    readonly audit: AuditTrail;
}
/** A folder grouping media assets within a website's library. */
export interface Folder {
    readonly id: FolderId;
    readonly websiteId: WebsiteId;
    readonly parentId: FolderId | null;
    name: string;
    /** Sort order within the parent folder. */
    sortOrder: number;
    /** Optimistic concurrency version. Monotonically incremented on each save. */
    version: AggregateVersion;
    readonly audit: AuditTrail;
}
export declare enum MediaKind {
    Image = "image",
    Video = "video",
    Audio = "audio",
    Document = "document",
    Other = "other"
}
/** Helper: maps a MIME type to a MediaKind. Pure contract — no impl here. */
export type MimeToKind = (mimeType: string) => MediaKind;
//# sourceMappingURL=types.d.ts.map