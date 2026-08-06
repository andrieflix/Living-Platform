import type {
  Organization,
  OrganizationDraft,
  Plan,
  Feature,
  OrganizationId,
  PlanId,
  FeatureId,
  PaginatedResult,
  PaginationParams,
  AggregateVersion,
} from "@livingsites/domain";
import type {
  CreateResult,
  SaveResult,
  MutationResult,
} from "../contracts";

export interface OrganizationListParams extends PaginationParams {
  planId?: PlanId;
  status?: "active" | "archived" | "deleted";
  search?: string;
}

/**
 * Read-only organization repository port.
 * The CreateOrganization use case depends only on this capability.
 */
export interface OrganizationReader {
  findById(id: OrganizationId): Promise<Organization | null>;
  findBySlug(slug: string): Promise<Organization | null>;
  list(params: OrganizationListParams): Promise<PaginatedResult<Organization>>;
}

/**
 * Organization creation repository port.
 * Accepts an OrganizationDraft and returns an Organization at version 1.
 */
export interface OrganizationCreator {
  create(candidate: OrganizationDraft): Promise<CreateResult<Organization>>;
}

/**
 * Full organization repository port — read, create, and mutate.
 * Mutation methods are not used by CreateOrganization and may be
 * unimplemented in adapters that only support creation.
 */
export interface OrganizationRepository extends OrganizationReader, OrganizationCreator {
  save(aggregate: Organization, expectedVersion: AggregateVersion): Promise<SaveResult<Organization>>;
  softDelete(id: OrganizationId, expectedVersion: AggregateVersion): Promise<MutationResult>;
}

/**
 * Read-only plan repository port.
 * CreateOrganization depends only on this capability.
 */
export interface PlanReader {
  findById(id: PlanId): Promise<Plan | null>;
  findActiveById(id: PlanId): Promise<Plan | null>;
  listActive(): Promise<Plan[]>;
}

export interface PlanRepository extends PlanReader {
  create(candidate: Omit<Plan, "id" | "audit" | "version">): Promise<CreateResult<Plan>>;
  save(aggregate: Plan, expectedVersion: AggregateVersion): Promise<SaveResult<Plan>>;
}

/**
 * Read-only feature repository port.
 * CreateOrganization policy evaluation may need to resolve features
 * and list entitlements for a plan.
 */
export interface FeatureReader {
  findById(id: FeatureId): Promise<Feature | null>;
  findByKey(key: string): Promise<Feature | null>;
  listForPlan(planId: PlanId): Promise<Feature[]>;
}

export interface FeatureRepository extends FeatureReader {
  listAll(): Promise<Feature[]>;
  create(candidate: Omit<Feature, "id" | "version">): Promise<CreateResult<Feature>>;
  save(aggregate: Feature, expectedVersion: AggregateVersion): Promise<SaveResult<Feature>>;
}
