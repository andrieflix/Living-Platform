import type {
  Media,
  Folder,
  MediaId,
  FolderId,
  WebsiteId,
  Result,
  DomainError,
} from "@livingsites/domain";

/** Result of an upload handshake — the service prepares a target, caller uploads. */
export interface UploadTarget {
  readonly mediaId: MediaId;
  readonly uploadUrl: string;
  readonly method: "POST" | "PUT";
  readonly headers: Readonly<Record<string, string>>;
  readonly expiresAt: string;
}

export interface MediaService {
  beginUpload(input: {
    websiteId: WebsiteId;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    folderId?: FolderId | null;
  }): Promise<Result<UploadTarget, DomainError>>;

  finalizeUpload(mediaId: MediaId): Promise<Result<Media, DomainError>>;

  updateMetadata(
    mediaId: MediaId,
    changes: { altText?: string; filename?: string; folderId?: FolderId | null },
  ): Promise<Result<Media, DomainError>>;

  delete(mediaId: MediaId): Promise<Result<void, DomainError>>;

  createFolder(input: {
    websiteId: WebsiteId;
    parentId: FolderId | null;
    name: string;
  }): Promise<Result<Folder, DomainError>>;

  renameFolder(folderId: FolderId, name: string): Promise<Result<Folder, DomainError>>;
  deleteFolder(folderId: FolderId): Promise<Result<void, DomainError>>;
}
