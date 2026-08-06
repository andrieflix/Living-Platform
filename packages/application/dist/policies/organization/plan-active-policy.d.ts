/**
 * PlanActivePolicy — validates that a selected plan is available and active.
 */
import type { Plan } from "@livingsites/domain";
import type { Policy, PolicyDecision, PolicyContext } from "../shared";
export interface PlanActivePolicyInput {
    readonly context: PolicyContext;
    readonly plan: Plan | null;
    readonly planRequested: boolean;
}
export declare class PlanActivePolicy implements Policy<PlanActivePolicyInput> {
    readonly name = "PlanActivePolicy";
    readonly category = "organization";
    readonly severity: "hard";
    evaluate(input: PlanActivePolicyInput): Promise<PolicyDecision>;
}
//# sourceMappingURL=plan-active-policy.d.ts.map