/**
 * OrganizationSlugPolicy — validates that a slug is permitted.
 */
import type { Policy, PolicyDecision, PolicyContext } from "../shared";
export interface OrganizationSlugPolicyInput {
    readonly context: PolicyContext;
    readonly slug: string;
}
export declare class OrganizationSlugPolicy implements Policy<OrganizationSlugPolicyInput> {
    readonly name = "OrganizationSlugPolicy";
    readonly category = "organization";
    readonly severity: "hard";
    evaluate(input: OrganizationSlugPolicyInput): Promise<PolicyDecision>;
}
//# sourceMappingURL=slug-policy.d.ts.map