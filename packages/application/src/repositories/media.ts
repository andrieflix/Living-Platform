import type {
  Media,
  Folder,
  MediaKind,
  MediaId,
  FolderId,
  WebsiteId,
  PaginatedResult,
  PaginationParams,
  AggregateVersion,
} from "@livingsites/domain";
import type {
  CreateResult,
  SaveResult,
  MutationResult,
} from "../contracts";

export interface MediaListParams extends PaginationParams {
  websiteId?: WebsiteId;
  folderId?: FolderId | null;
  kind?: MediaKind;
  mimeType?: string;
  search?: string;
}

export interface MediaRepository {
  findById(id: MediaId): Promise<Media | null>;
  list(params: MediaListParams): Promise<PaginatedResult<Media>>;
  create(candidate: Omit<Media, "id" | "audit" | "version">): Promise<CreateResult<Media>>;
  save(aggregate: Media, expectedVersion: AggregateVersion): Promise<SaveResult<Media>>;
  softDelete(id: MediaId, expectedVersion: AggregateVersion): Promise<MutationResult>;
}

export interface FolderRepository {
  findById(id: FolderId): Promise<Folder | null>;
  listForWebsite(websiteId: WebsiteId): Promise<Folder[]>;
  listChildren(parentId: FolderId | null, websiteId: WebsiteId): Promise<Folder[]>;
  create(candidate: Omit<Folder, "id" | "audit" | "version">): Promise<CreateResult<Folder>>;
  save(aggregate: Folder, expectedVersion: AggregateVersion): Promise<SaveResult<Folder>>;
  delete(id: FolderId, expectedVersion: AggregateVersion): Promise<MutationResult>;
}
