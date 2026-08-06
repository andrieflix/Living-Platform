/**
 * OrganizationSlugPolicy — validates that a slug is permitted.
 */
import type {
  Policy,
  PolicyDecision,
  PolicyContext,
} from "../shared";

export interface OrganizationSlugPolicyInput {
  readonly context: PolicyContext;
  readonly slug: string;
}

const RESERVED_SLUGS: readonly string[] = [
  "admin", "api", "www", "app", "mail", "ftp", "localhost",
  "support", "help", "billing", "account", "settings",
  "system", "internal", "platform", "staging", "test",
];

export class OrganizationSlugPolicy implements Policy<OrganizationSlugPolicyInput> {
  readonly name = "OrganizationSlugPolicy";
  readonly category = "organization";
  readonly severity = "hard" as const;

  async evaluate(input: OrganizationSlugPolicyInput): Promise<PolicyDecision> {
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
