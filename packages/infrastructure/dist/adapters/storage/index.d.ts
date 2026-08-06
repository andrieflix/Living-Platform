/**
 * Storage adapter contracts — provider-agnostic file storage capability.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { Logger } from "@livingsites/platform";
/** A file storage adapter: upload, download, delete, presign, stat. */
export interface StorageAdapter {
    upload(params: StorageUploadParams): Promise<StorageObject>;
    download(key: string): Promise<StorageDownloadResult>;
    delete(key: string): Promise<void>;
    presignDownload(key: string, ttlMs: number): Promise<PresignedUrl>;
    presignUpload(key: string, ttlMs: number): Promise<PresignedUrl>;
    stat(key: string): Promise<StorageObject | null>;
    readonly logger: Logger;
}
export interface StorageUploadParams {
    readonly key: string;
    readonly body: Uint8Array | ArrayBuffer;
    readonly mimeType: string;
    readonly metadata?: Readonly<Record<string, string>>;
}
export interface StorageObject {
    readonly key: string;
    readonly size: number;
    readonly mimeType: string;
    readonly etag: string;
    readonly lastModified: string;
    readonly metadata?: Readonly<Record<string, string>>;
}
export interface StorageDownloadResult {
    readonly body: Uint8Array;
    readonly object: StorageObject;
}
export interface PresignedUrl {
    readonly url: string;
    readonly expiresAt: string;
    readonly method: "GET" | "PUT";
}
//# sourceMappingURL=index.d.ts.map