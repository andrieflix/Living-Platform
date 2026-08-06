import { createOrganizationDraft } from "@livingsites/domain";
export function createOrganizationDraftViaPorts(input) {
    const id = input.idGenerator.generatePrefixed("org");
    const now = input.clock.nowIso();
    return createOrganizationDraft({
        id,
        name: input.name,
        slug: input.slug,
        billingEmail: input.billingEmail,
        planId: input.planId,
        now,
    });
}
//# sourceMappingURL=organization-factory.js.map