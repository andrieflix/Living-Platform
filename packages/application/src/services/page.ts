import type {
  Page,
  PageSnapshot,
  PageId,
  WebsiteId,
  SectionId,
  Result,
  DomainError,
} from "@livingsites/domain";

export interface PageService {
  createPage(input: {
    websiteId: WebsiteId;
    slug: string;
    title: string;
    parentId?: PageId | null;
    isHomepage?: boolean;
  }): Promise<Result<Page, DomainError>>;

  updateContent(
    pageId: PageId,
    changes: { title?: string; description?: string; sectionOrder?: readonly SectionId[] },
  ): Promise<Result<Page, DomainError>>;

  moveSection(pageId: PageId, sectionId: SectionId, newSortOrder: number): Promise<Result<Page, DomainError>>;

  publish(pageId: PageId): Promise<Result<{ page: Page; snapshot: PageSnapshot }, DomainError>>;

  schedulePublish(pageId: PageId, at: string): Promise<Result<Page, DomainError>>;

  unpublish(pageId: PageId): Promise<Result<Page, DomainError>>;

  archive(pageId: PageId): Promise<Result<Page, DomainError>>;

  setHomepage(pageId: PageId): Promise<Result<Page, DomainError>>;

  restoreSnapshot(pageId: PageId, snapshotId: string): Promise<Result<Page, DomainError>>;
}
