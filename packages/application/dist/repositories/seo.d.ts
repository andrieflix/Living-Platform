import type { SEOProfile, SchemaProfile, RobotsPolicy, WebsiteId, PageId, PaginatedResult, PaginationParams, AggregateVersion } from "@livingsites/domain";
import type { CreateResult, SaveResult, MutationResult } from "../contracts";
export interface SEOProfileRepository {
    findById(id: string): Promise<SEOProfile | null>;
    findForPage(pageId: PageId): Promise<SEOProfile | null>;
    findDefaultsForWebsite(websiteId: WebsiteId): Promise<SEOProfile | null>;
    listForWebsite(websiteId: WebsiteId, params: PaginationParams): Promise<PaginatedResult<SEOProfile>>;
    create(candidate: Omit<SEOProfile, "id" | "audit" | "version">): Promise<CreateResult<SEOProfile>>;
    save(aggregate: SEOProfile, expectedVersion: AggregateVersion): Promise<SaveResult<SEOProfile>>;
    delete(id: string, expectedVersion: AggregateVersion): Promise<MutationResult>;
}
export interface SchemaProfileRepository {
    findById(id: string): Promise<SchemaProfile | null>;
    findByKey(websiteId: WebsiteId, key: string): Promise<SchemaProfile | null>;
    listForWebsite(websiteId: WebsiteId): Promise<SchemaProfile[]>;
    listForPage(pageId: PageId): Promise<SchemaProfile[]>;
    create(candidate: Omit<SchemaProfile, "id" | "audit" | "version">): Promise<CreateResult<SchemaProfile>>;
    save(aggregate: SchemaProfile, expectedVersion: AggregateVersion): Promise<SaveResult<SchemaProfile>>;
    delete(id: string, expectedVersion: AggregateVersion): Promise<MutationResult>;
}
export interface RobotsPolicyRepository {
    findByWebsite(websiteId: WebsiteId): Promise<RobotsPolicy | null>;
    create(policy: Omit<RobotsPolicy, "websiteId"> & {
        websiteId: WebsiteId;
    }): Promise<CreateResult<RobotsPolicy>>;
    save(aggregate: RobotsPolicy, expectedVersion: AggregateVersion): Promise<SaveResult<RobotsPolicy>>;
}
//# sourceMappingURL=seo.d.ts.map