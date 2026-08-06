import { OrganizationSlugPolicy } from "./slug-policy";
import { PlanActivePolicy } from "./plan-active-policy";
export class OrganizationCreationPolicyChain {
    name = "OrganizationCreationPolicyChain";
    slugPolicy;
    planPolicy;
    constructor() {
        this.slugPolicy = new OrganizationSlugPolicy();
        this.planPolicy = new PlanActivePolicy();
    }
    async evaluate(input) {
        const decisions = [];
        const warnings = [];
        const denials = [];
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
//# sourceMappingURL=creation-policy-chain.js.map