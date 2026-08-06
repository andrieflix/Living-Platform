import type {
  Section,
  SectionId,
  PageId,
  WebsiteId,
  Result,
  DomainError,
} from "@livingsites/domain";

export interface SectionService {
  create(input: {
    websiteId: WebsiteId;
    pageId: PageId;
    sectionTypeKey: string;
    props?: Record<string, unknown>;
    sortOrder?: number;
  }): Promise<Result<Section, DomainError>>;

  updateProps(
    sectionId: SectionId,
    props: Record<string, unknown>,
  ): Promise<Result<Section, DomainError>>;

  setLocaleOverride(
    sectionId: SectionId,
    locale: string,
    overrides: Record<string, unknown>,
  ): Promise<Result<Section, DomainError>>;

  reorder(pageId: PageId, orderedIds: readonly SectionId[]): Promise<Result<readonly Section[], DomainError>>;

  duplicate(sectionId: SectionId): Promise<Result<Section, DomainError>>;

  remove(sectionId: SectionId): Promise<Result<void, DomainError>>;

  validate(
    sectionTypeKey: string,
    props: Record<string, unknown>,
  ): Promise<Result<{ valid: boolean; errors?: readonly string[] }, DomainError>>;
}
