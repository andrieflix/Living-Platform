import type {
  Organization,
  FeatureOverride,
  OrganizationId,
  PlanId,
  Result,
  DomainError,
} from "@livingsites/domain";

export interface OrganizationService {
  createOrganization(input: {
    slug: string;
    name: string;
    billingEmail: string;
    planId?: PlanId;
  }): Promise<Result<Organization, DomainError>>;

  applyFeatureOverride(
    organizationId: OrganizationId,
    override: FeatureOverride,
  ): Promise<Result<Organization, DomainError>>;

  resolveFeature(
    organizationId: OrganizationId,
    featureKey: string,
  ): Promise<Result<{ enabled: boolean; value: number }, DomainError>>;

  changePlan(
    organizationId: OrganizationId,
    planId: PlanId,
  ): Promise<Result<Organization, DomainError>>;

  archive(id: OrganizationId): Promise<Result<void, DomainError>>;
}
