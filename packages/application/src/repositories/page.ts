import type {
  Page,
  PageSnapshot,
  PageStatus,
  PageId,
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

export interface PageListParams extends PaginationParams {
  websiteId?: WebsiteId;
  status?: PageStatus;
  parentId?: PageId | null;
  search?: string;
}

/**
 * Owns the Page aggregate root, including its Section child entities.
 * Sections are loaded, mutated, and persisted atomically through the
 * Page root. There is no standalone SectionRepository — sections have
 * no public repository port.
 *
 * `create` persists a new Page (candidate is logically version 0; the
 * returned aggregate has version 1). `save` mutates an existing Page and
 * requires expectedVersion. A successful save increments Page.version
 * exactly once — even if multiple sections changed.
 */
export interface PageRepository {
  findById(id: PageId): Promise<Page | null>;
  findBySlug(websiteId: WebsiteId, slug: string): Promise<Page | null>;
  findHomepage(websiteId: WebsiteId): Promise<Page | null>;
  list(params: PageListParams): Promise<PaginatedResult<Page>>;
  listPublished(websiteId: WebsiteId): Promise<Page[]>;
  create(candidate: Omit<Page, "id" | "audit" | "version">): Promise<CreateResult<Page>>;
  save(aggregate: Page, expectedVersion: AggregateVersion): Promise<SaveResult<Page>>;
  softDelete(id: PageId, expectedVersion: AggregateVersion): Promise<MutationResult>;
}

/**
 * PageSnapshot is a separate immutable aggregate. It has its own repository
 * because snapshots are append-only, never mutated, and queried independently
 * of the live Page aggregate. Snapshots do not carry an AggregateVersion —
 * their identity is the (pageId, revisionNumber) pair, which is immutable.
 *
 * `create` persists a new snapshot. There is no `save` method — snapshots
 * are never mutated. `create` does not require expectedVersion.
 */
export interface PageSnapshotRepository {
  findById(snapshotId: string): Promise<PageSnapshot | null>;
  findLatest(pageId: PageId): Promise<PageSnapshot | null>;
  listRevisions(pageId: PageId, params: PaginationParams): Promise<PaginatedResult<PageSnapshot>>;
  create(snapshot: Omit<PageSnapshot, "id"> & { id?: string }): Promise<CreateResult<PageSnapshot>>;
}
