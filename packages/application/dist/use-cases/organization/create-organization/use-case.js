import { createOrganizationDraftViaPorts } from "../../../services/organization-factory";
import { OrganizationCreationPolicyChain } from "../../../policies/organization";
import { validateCreateOrganizationInput } from "./validator";
export async function createOrganization(input, deps) {
    const validation = validateCreateOrganizationInput(input);
    if (!validation.ok) {
        return { ok: false, error: validation.error };
    }
    const { name, slug, billingEmail } = validation.normalized;
    const existing = await deps.organizationRepository.findBySlug(slug);
    if (existing !== null) {
        return {
            ok: false,
            error: { code: "duplicate_slug", message: `An organization with slug "${slug}" already exists.`, slug },
        };
    }
    let plan = null;
    let planRequested = false;
    if (input.planId !== undefined) {
        planRequested = true;
        const found = await deps.planRepository.findById(input.planId);
        if (found === null) {
            return {
                ok: false,
                error: { code: "plan_not_available", message: "Selected plan was not found.", planId: String(input.planId) },
            };
        }
        plan = found;
    }
    const policyContext = {
        now: deps.clock.nowIso(),
    };
    const policyChain = new OrganizationCreationPolicyChain();
    const policyResult = await policyChain.evaluate({
        context: policyContext,
        slug,
        plan,
        planRequested,
    });
    if (!policyResult.allowed) {
        const firstDenial = policyResult.denials[0];
        if (firstDenial === undefined) {
            return {
                ok: false,
                error: { code: "policy_denial", message: "Policy evaluation denied the request.", policyName: "unknown" },
            };
        }
        return {
            ok: false,
            error: {
                code: "policy_denial",
                message: firstDenial.message,
                policyName: firstDenial.policyName,
                details: firstDenial.details,
            },
        };
    }
    const draft = createOrganizationDraftViaPorts({
        name,
        slug: slug,
        billingEmail,
        planId: input.planId ?? null,
        clock: deps.clock,
        idGenerator: deps.idGenerator,
    });
    const event = {
        type: "organization.created",
        occurredAt: deps.clock.nowIso(),
        eventScope: { scope: "organization", organizationId: draft.id },
        slug: draft.slug,
        planId: draft.planId,
    };
    if (deps.organizationCreationPersistence) {
        const atomicResult = await deps.organizationCreationPersistence.createWithEvent(draft, event);
        if (!atomicResult.ok) {
            const err = atomicResult.error;
            switch (err.code) {
                case "duplicate_key":
                    return {
                        ok: false,
                        error: { code: "duplicate_slug", message: err.message, slug },
                    };
                case "persistence_unavailable":
                    return {
                        ok: false,
                        error: { code: "persistence_unavailable", message: err.message },
                    };
                case "invalid_persistence_state":
                    return {
                        ok: false,
                        error: { code: "invalid_persistence_state", message: err.message },
                    };
            }
        }
        const created = atomicResult.value;
        if (created.version !== 1) {
            return {
                ok: false,
                error: {
                    code: "invalid_persistence_state",
                    message: `Expected persisted version 1, got ${created.version}.`,
                },
            };
        }
        return { ok: true, value: { organization: created } };
    }
    const createResult = await deps.organizationRepository.create(draft);
    if (!createResult.ok) {
        const err = createResult.error;
        switch (err.code) {
            case "duplicate_key":
                return {
                    ok: false,
                    error: { code: "duplicate_slug", message: err.message, slug },
                };
            case "persistence_unavailable":
                return {
                    ok: false,
                    error: { code: "persistence_unavailable", message: err.message },
                };
            case "invalid_persistence_state":
                return {
                    ok: false,
                    error: { code: "invalid_persistence_state", message: err.message },
                };
        }
    }
    const created = createResult.value;
    if (created.version !== 1) {
        return {
            ok: false,
            error: {
                code: "invalid_persistence_state",
                message: `Expected persisted version 1, got ${created.version}.`,
            },
        };
    }
    await deps.eventPublisher.publish(event);
    return { ok: true, value: { organization: created } };
}
//# sourceMappingURL=use-case.js.map