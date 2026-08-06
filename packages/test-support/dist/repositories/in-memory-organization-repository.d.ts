/**
 * In-memory OrganizationRepository for tests.
 *
 * Implements OrganizationReader, OrganizationCreator, and the full
 * OrganizationRepository port using an in-memory Map.
 *
 * Create behavior matches production:
 * - accepts OrganizationDraft (version 0)
 * - returns Organization at version 1
 * - enforces unique slug
 * - typed errors (DuplicateKeyError)
 */
import type { Organization, OrganizationDraft, OrganizationId, Plan, PlanId, Feature, FeatureId, PaginatedResult, AggregateVersion } from "@livingsites/domain";
import type { CreateResult, SaveResult, MutationResult } from "@livingsites/application";
import type { OrganizationRepository, OrganizationReader, OrganizationCreator, PlanRepository, PlanReader, FeatureRepository, FeatureReader, OrganizationListParams } from "@livingsites/application";
export declare class InMemoryOrganizationRepository implements OrganizationRepository {
    private store;
    private slugIndex;
    findById(id: OrganizationId): Promise<Organization | null>;
    findBySlug(slug: string): Promise<Organization | null>;
    list(params: OrganizationListParams): Promise<PaginatedResult<Organization>>;
    create(candidate: OrganizationDraft): Promise<CreateResult<Organization>>;
    save(aggregate: Organization, expectedVersion: AggregateVersion): Promise<SaveResult<Organization>>;
    softDelete(id: OrganizationId, expectedVersion: AggregateVersion): Promise<MutationResult>;
    private toDomain;
    clear(): void;
}
export declare class InMemoryPlanRepository implements PlanRepository {
    private store;
    add(plan: Plan): void;
    findById(id: PlanId): Promise<Plan | null>;
    findActiveById(id: PlanId): Promise<Plan | null>;
    listActive(): Promise<Plan[]>;
    create(candidate: Omit<Plan, "id" | "audit" | "version">): Promise<CreateResult<Plan>>;
    save(aggregate: Plan, expectedVersion: AggregateVersion): Promise<SaveResult<Plan>>;
}
export declare class InMemoryFeatureRepository implements FeatureRepository {
    private store;
    private entitlements;
    add(feature: Feature): void;
    addEntitlement(planId: string, featureId: string, value: number): void;
    findById(id: FeatureId): Promise<Feature | null>;
    findByKey(key: string): Promise<Feature | null>;
    listForPlan(planId: PlanId): Promise<Feature[]>;
    listAll(): Promise<Feature[]>;
    create(candidate: Omit<Feature, "id" | "version">): Promise<CreateResult<Feature>>;
    save(aggregate: Feature, expectedVersion: AggregateVersion): Promise<SaveResult<Feature>>;
}
export type { OrganizationReader, OrganizationCreator, PlanReader, FeatureReader };
//# sourceMappingURL=in-memory-organization-repository.d.ts.map