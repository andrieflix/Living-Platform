/**
 * Organization creation policy chain.
 */
import type { PolicyResult, PolicyInput } from "../shared";
import { OrganizationSlugPolicy, type OrganizationSlugPolicyInput } from "./slug-policy";
import { PlanActivePolicy, type PlanActivePolicyInput } from "./plan-active-policy";
import type { Plan } from "@livingsites/domain";
export interface OrganizationCreationPolicyInput extends PolicyInput {
    readonly slug: string;
    readonly plan: Plan | null;
    readonly planRequested: boolean;
}
export declare class OrganizationCreationPolicyChain {
    readonly name = "OrganizationCreationPolicyChain";
    private readonly slugPolicy;
    private readonly planPolicy;
    constructor();
    evaluate(input: OrganizationCreationPolicyInput): Promise<PolicyResult>;
}
export { OrganizationSlugPolicy, PlanActivePolicy };
export type { OrganizationSlugPolicyInput, PlanActivePolicyInput };
//# sourceMappingURL=creation-policy-chain.d.ts.map