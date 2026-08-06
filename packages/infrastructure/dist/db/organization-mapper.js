function asOrganizationId(id) {
    return id;
}
function asPlanId(id) {
    return id;
}
function asFeatureId(id) {
    return id;
}
function asSlug(slug) {
    return slug;
}
function asISODateString(ts) {
    return ts;
}
export function rowToOrganization(row) {
    if (!row.id) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Organization row missing id." } };
    }
    if (!row.slug) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Organization row missing slug." } };
    }
    if (row.version < 1) {
        return { ok: false, error: { code: "invalid_persistence_state", message: `Organization row has invalid version: ${row.version}.` } };
    }
    let featureOverrides = [];
    try {
        const parsed = JSON.parse(row.feature_overrides);
        if (Array.isArray(parsed)) {
            featureOverrides = parsed.map((o) => ({
                featureId: asFeatureId(String(o.featureId)),
                value: Number(o.value),
                enabled: Boolean(o.enabled),
                ...(o.reason !== undefined ? { reason: String(o.reason) } : {}),
                appliedAt: asISODateString(String(o.appliedAt)),
            }));
        }
    }
    catch {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Organization row has invalid feature_overrides JSON." } };
    }
    const audit = {
        createdAt: asISODateString(row.created_at.toISOString()),
        updatedAt: asISODateString(row.updated_at.toISOString()),
        ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
        ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
    };
    const org = {
        id: asOrganizationId(row.id),
        slug: asSlug(row.slug),
        name: row.name,
        billingEmail: row.billing_email,
        planId: row.plan_id !== null ? asPlanId(row.plan_id) : null,
        status: row.status,
        featureOverrides,
        version: row.version,
        audit,
    };
    return { ok: true, value: org };
}
export function draftToInsertData(draft, persistedVersion) {
    return {
        id: String(draft.id),
        name: draft.name,
        slug: String(draft.slug),
        billing_email: draft.billingEmail,
        plan_id: draft.planId !== null ? String(draft.planId) : null,
        status: draft.status,
        feature_overrides: JSON.stringify(draft.featureOverrides),
        version: persistedVersion,
        created_at: new Date(draft.audit.createdAt),
        updated_at: new Date(draft.audit.updatedAt),
        created_by: draft.audit.createdBy !== undefined ? String(draft.audit.createdBy) : null,
        updated_by: draft.audit.updatedBy !== undefined ? String(draft.audit.updatedBy) : null,
        deleted_at: null,
    };
}
//# sourceMappingURL=organization-mapper.js.map