export class InMemoryUserRepository {
    store = new Map();
    authSubjectIndex = new Map();
    emailIndex = new Map();
    async findById(id) {
        const row = this.store.get(String(id));
        return row ? this.toDomain(row) : null;
    }
    async findByAuthSubjectId(authSubjectId) {
        const id = this.authSubjectIndex.get(String(authSubjectId));
        if (!id)
            return null;
        const row = this.store.get(id);
        return row ? this.toDomain(row) : null;
    }
    async findByEmail(email) {
        const normalized = email.trim().toLowerCase();
        const id = this.emailIndex.get(normalized);
        if (!id)
            return null;
        const row = this.store.get(id);
        return row ? this.toDomain(row) : null;
    }
    async create(draft) {
        const authSubjectId = String(draft.authSubjectId);
        if (this.authSubjectIndex.has(authSubjectId)) {
            return {
                ok: false,
                error: {
                    code: "duplicate_key",
                    message: `A user with authSubjectId "${authSubjectId}" already exists.`,
                    field: "auth_subject_id",
                    value: authSubjectId,
                },
            };
        }
        const normalizedEmail = draft.email.trim().toLowerCase();
        if (this.emailIndex.has(normalizedEmail)) {
            return {
                ok: false,
                error: {
                    code: "duplicate_key",
                    message: `A user with email "${normalizedEmail}" already exists.`,
                    field: "email",
                    value: normalizedEmail,
                },
            };
        }
        const row = {
            id: draft.id,
            authSubjectId: draft.authSubjectId,
            email: normalizedEmail,
            displayName: draft.displayName,
            status: draft.status,
            version: 1,
            audit: { createdAt: draft.audit.createdAt, updatedAt: draft.audit.updatedAt },
        };
        this.store.set(String(draft.id), row);
        this.authSubjectIndex.set(authSubjectId, String(draft.id));
        this.emailIndex.set(normalizedEmail, String(draft.id));
        return { ok: true, value: this.toDomain(row) };
    }
    toDomain(row) {
        return {
            id: row.id,
            authSubjectId: row.authSubjectId,
            email: row.email,
            displayName: row.displayName,
            status: row.status,
            version: row.version,
            audit: row.audit,
        };
    }
    clear() {
        this.store.clear();
        this.authSubjectIndex.clear();
        this.emailIndex.clear();
    }
}
//# sourceMappingURL=in-memory-user-repository.js.map