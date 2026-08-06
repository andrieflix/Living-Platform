function asPlanId(id) {
    return id;
}
function asFeatureId(id) {
    return id;
}
function asMachineKey(key) {
    return key;
}
function asISODateString(ts) {
    return (ts instanceof Date ? ts.toISOString() : ts);
}
export function rowToPlan(row, entitlements) {
    if (!row.id) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Plan row missing id." } };
    }
    if (!row.slug) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Plan row missing slug." } };
    }
    if (row.version < 1) {
        return { ok: false, error: { code: "invalid_persistence_state", message: `Plan row has invalid version: ${row.version}.` } };
    }
    const audit = {
        createdAt: asISODateString(row.created_at),
        updatedAt: asISODateString(row.updated_at),
        ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
        ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
    };
    const plan = {
        id: asPlanId(row.id),
        tier: row.tier,
        name: row.name,
        ...(row.description !== null ? { description: row.description } : {}),
        priceMonthly: row.price_monthly,
        priceAnnual: row.price_annual,
        currency: row.currency,
        features: entitlements,
        maxWebsites: row.max_websites,
        maxMembers: row.max_members,
        customDomainsAllowed: row.custom_domains_allowed,
        isActive: row.is_active,
        version: row.version,
        audit,
    };
    return { ok: true, value: plan };
}
export function rowToFeature(row) {
    if (!row.id) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Feature row missing id." } };
    }
    if (!row.key) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Feature row missing key." } };
    }
    if (row.version < 1) {
        return { ok: false, error: { code: "invalid_persistence_state", message: `Feature row has invalid version: ${row.version}.` } };
    }
    const feature = {
        id: asFeatureId(row.id),
        key: asMachineKey(row.key),
        category: row.category,
        name: row.name,
        ...(row.description !== null ? { description: row.description } : {}),
        valueType: row.value_type,
        isActive: row.is_active,
        version: row.version,
    };
    return { ok: true, value: feature };
}
export function rowsToEntitlements(entitlementRows, featureRows) {
    const featureMap = new Map();
    for (const fr of featureRows) {
        featureMap.set(fr.id, fr);
    }
    const entitlements = [];
    for (const er of entitlementRows) {
        const featureRow = featureMap.get(er.feature_id);
        if (!featureRow) {
            return {
                ok: false,
                error: {
                    code: "invalid_persistence_state",
                    message: `Entitlement ${er.id} references missing feature ${er.feature_id}.`,
                },
            };
        }
        entitlements.push({
            featureId: asFeatureId(featureRow.id),
            value: Number(er.value),
        });
    }
    return { ok: true, value: entitlements };
}
//# sourceMappingURL=plan-feature-mapper.js.map