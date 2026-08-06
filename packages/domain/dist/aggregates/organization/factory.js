import { DRAFT_VERSION } from "./draft";
export function createOrganizationDraft(input) {
    const audit = {
        createdAt: input.now,
        updatedAt: input.now,
    };
    return {
        id: input.id,
        slug: input.slug,
        name: input.name,
        billingEmail: input.billingEmail,
        planId: input.planId,
        status: "active",
        featureOverrides: [],
        version: DRAFT_VERSION,
        audit,
    };
}
//# sourceMappingURL=factory.js.map