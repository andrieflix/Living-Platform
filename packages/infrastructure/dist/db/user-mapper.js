function asUserId(id) {
    return id;
}
function asAuthSubjectId(id) {
    return id;
}
function asISODateString(ts) {
    return (ts instanceof Date ? ts.toISOString() : ts);
}
export function rowToUser(row) {
    if (!row.id) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Platform user row missing id." } };
    }
    if (!row.auth_subject_id) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Platform user row missing auth_subject_id." } };
    }
    if (!row.email) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Platform user row missing email." } };
    }
    if (row.version < 1) {
        return { ok: false, error: { code: "invalid_persistence_state", message: `Platform user row has invalid version: ${row.version}.` } };
    }
    const audit = {
        createdAt: asISODateString(row.created_at),
        updatedAt: asISODateString(row.updated_at),
        ...(row.created_by !== null ? { createdBy: row.created_by } : {}),
        ...(row.updated_by !== null ? { updatedBy: row.updated_by } : {}),
    };
    const user = {
        id: asUserId(row.id),
        authSubjectId: asAuthSubjectId(row.auth_subject_id),
        email: row.email,
        displayName: row.display_name,
        status: row.status,
        version: row.version,
        audit,
    };
    return { ok: true, value: user };
}
export function userDraftToInsertData(draft, persistedVersion) {
    return {
        id: String(draft.id),
        auth_subject_id: String(draft.authSubjectId),
        email: draft.email,
        display_name: draft.displayName,
        status: draft.status,
        version: persistedVersion,
        created_at: new Date(draft.audit.createdAt),
        updated_at: new Date(draft.audit.updatedAt),
        created_by: draft.audit.createdBy !== undefined ? String(draft.audit.createdBy) : null,
        updated_by: draft.audit.updatedBy !== undefined ? String(draft.audit.updatedBy) : null,
        deleted_at: null,
    };
}
//# sourceMappingURL=user-mapper.js.map