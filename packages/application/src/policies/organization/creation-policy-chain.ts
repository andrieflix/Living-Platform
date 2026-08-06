/**
 * Organization creation policy chain.
 */
import type {
  PolicyDecision,
  PolicyResult,
  PolicyInput,
} from "../shared";
import { OrganizationSlugPolicy, type OrganizationSlugPolicyInput } from "./slug-policy";
import { PlanActivePolicy, type PlanActivePolicyInput } from "./plan-active-policy";
import type { Plan } from "@livingsites/domain";

export interface OrganizationCreationPolicyInput extends PolicyInput {
  readonly slug: string;
  readonly plan: Plan | null;
  readonly planRequested: boolean;
}

export class OrganizationCreationPolicyChain {
  readonly name = "OrganizationCreationPolicyChain";
  private readonly slugPolicy: OrganizationSlugPolicy;
  private readonly planPolicy: PlanActivePolicy;

  constructor() {
    this.slugPolicy = new OrganizationSlugPolicy();
    this.planPolicy = new PlanActivePolicy();
  }

  async evaluate(input: OrganizationCreationPolicyInput): Promise<PolicyResult> {
    const decisions: PolicyDecision[] = [];
    const warnings: PolicyDecision[] = [];
    const denials: PolicyDecision[] = [];

    const slugDecision = await this.slugPolicy.evaluate({
      context: input.context,
      slug: input.slug,
    });
    decisions.push(slugDecision);
    if (slugDecision.outcome === "deny") {
      denials.push(slugDecision);
      return { decisions, allowed: false, warnings, denials };
    }
    if (slugDecision.outcome === "warn") {
      warnings.push(slugDecision);
    }

    const planDecision = await this.planPolicy.evaluate({
      context: input.context,
      plan: input.plan,
      planRequested: input.planRequested,
    });
    decisions.push(planDecision);
    if (planDecision.outcome === "deny") {
      denials.push(planDecision);
      return { decisions, allowed: false, warnings, denials };
    }
    if (planDecision.outcome === "warn") {
      warnings.push(planDecision);
    }

    return { decisions, allowed: true, warnings, denials };
  }
}

export { OrganizationSlugPolicy, PlanActivePolicy };
export type { OrganizationSlugPolicyInput, PlanActivePolicyInput };
