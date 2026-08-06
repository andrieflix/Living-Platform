export class PlanActivePolicy {
    name = "PlanActivePolicy";
    category = "organization";
    severity = "hard";
    async evaluate(input) {
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
//# sourceMappingURL=plan-active-policy.js.map