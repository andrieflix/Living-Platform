import type { PlanId } from "@livingsites/domain";

export interface CreateOrganizationInput {
  readonly name: string;
  readonly slug: string;
  readonly billingEmail: string;
  readonly planId?: PlanId;
}
