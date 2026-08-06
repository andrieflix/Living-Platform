/**
 * PlanActivePolicy — validates that a selected plan is available and active.
 */
import type { Plan } from "@livingsites/domain";
import type {
  Policy,
  PolicyDecision,
  PolicyContext,
} from "../shared";

export interface PlanActivePolicyInput {
  readonly context: PolicyContext;
  readonly plan: Plan | null;
  readonly planRequested: boolean;
}

export class PlanActivePolicy implements Policy<PlanActivePolicyInput> {
  readonly name = "PlanActivePolicy";
  readonly category = "organization";
  readonly severity = "hard" as const;

  async evaluate(input: PlanActivePolicyInput): Promise<PolicyDecision> {
    if (!input.planRequested) {
      return {
        outcome: "allow",
        policyName: this.name,
        severity: "hard",
        message: "No plan selected; organization may trial without a plan.",
        code: "organization.plan.none_requested",
      };
    }

    if (input.plan === null) {
      return {
        outcome: "deny",
        policyName: this.name,
        severity: "hard",
        message: "Selected plan was not found.",
        code: "organization.plan.not_found",
      };
    }

    if (!input.plan.isActive) {
      return {
        outcome: "deny",
        policyName: this.name,
        severity: "hard",
        message: `Plan "${input.plan.tier}" is not active.`,
        code: "organization.plan.inactive",
        details: { planId: input.plan.id, tier: input.plan.tier },
      };
    }

    return {
      outcome: "allow",
      policyName: this.name,
      severity: "hard",
      message: "Plan is active and available.",
      code: "organization.plan.active",
    };
  }
}
