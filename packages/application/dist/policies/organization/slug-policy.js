const RESERVED_SLUGS = [
    "admin", "api", "www", "app", "mail", "ftp", "localhost",
    "support", "help", "billing", "account", "settings",
    "system", "internal", "platform", "staging", "test",
];
export class OrganizationSlugPolicy {
    name = "OrganizationSlugPolicy";
    category = "organization";
    severity = "hard";
    async evaluate(input) {
        const slug = input.slug;
        if (RESERVED_SLUGS.includes(slug)) {
            return {
                outcome: "deny",
                policyName: this.name,
                severity: "hard",
                message: `Slug "${slug}" is reserved and cannot be used.`,
                code: "organization.slug.reserved",
                details: { slug },
            };
        }
        return {
            outcome: "allow",
            policyName: this.name,
            severity: "hard",
            message: "Slug is permitted.",
            code: "organization.slug.allowed",
        };
    }
}
//# sourceMappingURL=slug-policy.js.map