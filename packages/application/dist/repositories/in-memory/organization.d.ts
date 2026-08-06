/**
 * In-memory OrganizationRepository for tests.
 *
 * Matches production repository semantics:
 * - unique slug enforcement
 * - version 0 candidate → version 1 persisted aggregate
 * - branded IDs preserved
 * - typed errors (DuplicateKeyError, PersistenceUnavailableError)
 * - immutable returned values
 *
 * This is test-support code placed in Application because it implements an
 * Application-layer port without any infrastructure dependency. It is not
 * exported from the main application barrel — consumers import it directly.
 */
import type { Organization, OrganizationId, Plan, PlanId, Feature, FeatureId, PaginatedResult, AggregateVersion } from "@livingsites/domain";
import type { CreateResult, SaveResult, MutationResult } from "../../contracts";
import type { OrganizationRepository, PlanRepository, FeatureRepository, OrganizationListParams } from "../organization";
export declare class InMemoryOrganizationRepository implements OrganizationRepository {
    private store;
    private slugIndex;
    findById(id: OrganizationId): Promise<Organization | null>;
    findBySlug(slug: string): Promise<Organization | null>;
    list(params: OrganizationListParams): Promise<PaginatedResult<Organization>>;
    create(candidate: Organization): Promise<CreateResult<Organization>>;
    save(aggregate: Organization, expectedVersion: AggregateVersion): Promise<SaveResult<Organization>>;
    softDelete(id: OrganizationId, expectedVersion: AggregateVersion): Promise<MutationResult>;
    private toDomain;
    clear(): void;
}
export declare class InMemoryPlanRepository implements PlanRepository {
    private store;
    add(plan: Plan): void;
    findById(id: PlanId): Promise<Plan | null>;
    listActive(): Promise<Plan[]>;
    create(candidate: Omit<Plan, "id" | "audit" | "version">): Promise<CreateResult<Plan>>;
    save(aggregate: Plan, expectedVersion: AggregateVersion): Promise<SaveResult<Plan>>;
}
export declare class InMemoryFeatureRepository implements FeatureRepository {
    private store;
    add(feature: Feature): void;
    findById(id: FeatureId): Promise<Feature | null>;
    findByKey(key: string): Promise<Feature | null>;
    listAll(): Promise<Feature[]>;
    create(candidate: Omit<Feature, "id" | "version">): Promise<CreateResult<Feature>>;
    save(aggregate: Feature, expectedVersion: AggregateVersion): Promise<SaveResult<Feature>>;
}
//# sourceMappingURL=organization.d.ts.map