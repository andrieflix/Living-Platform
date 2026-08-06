export class InMemoryOrganizationRepository {
    store = new Map();
    slugIndex = new Map();
    async findById(id) {
        const row = this.store.get(String(id));
        return row ? this.toDomain(row) : null;
    }
    async findBySlug(slug) {
        const id = this.slugIndex.get(slug);
        if (!id)
            return null;
        const row = this.store.get(id);
        return row ? this.toDomain(row) : null;
    }
    async list(params) {
        let items = Array.from(this.store.values());
        if (params.status) {
            items = items.filter((o) => o.status === params.status);
        }
        if (params.planId) {
            items = items.filter((o) => String(o.planId) === String(params.planId));
        }
        const total = items.length;
        const start = (params.page - 1) * params.pageSize;
        const pageItems = items.slice(start, start + params.pageSize);
        return {
            items: pageItems.map((r) => this.toDomain(r)),
            total,
            page: params.page,
            pageSize: params.pageSize,
            hasMore: start + params.pageSize < total,
        };
    }
    async create(candidate) {
        const slug = String(candidate.slug);
        if (this.slugIndex.has(slug)) {
            return {
                ok: false,
                error: { code: "duplicate_key", message: `Slug "${slug}" already exists.`, field: "slug", value: slug },
            };
        }
        const row = {
            id: candidate.id,
            slug,
            name: candidate.name,
            description: candidate.description,
            billingEmail: candidate.billingEmail,
            planId: candidate.planId,
            status: candidate.status,
            featureOverrides: candidate.featureOverrides,
            version: 1,
            audit: { createdAt: candidate.audit.createdAt, updatedAt: candidate.audit.updatedAt },
        };
        this.store.set(String(candidate.id), row);
        this.slugIndex.set(slug, String(candidate.id));
        return { ok: true, value: this.toDomain(row) };
    }
    async save(aggregate, expectedVersion) {
        const row = this.store.get(String(aggregate.id));
        if (!row) {
            return {
                ok: false,
                error: { code: "invalid_persistence_state", message: "Organization not found for save." },
            };
        }
        if (row.version !== expectedVersion) {
            return {
                ok: false,
                error: {
                    aggregateId: String(aggregate.id),
                    expectedVersion,
                    actualVersion: row.version,
                },
            };
        }
        const updated = {
            ...row,
            name: aggregate.name,
            description: aggregate.description,
            billingEmail: aggregate.billingEmail,
            planId: aggregate.planId,
            status: aggregate.status,
            featureOverrides: aggregate.featureOverrides,
            version: row.version + 1,
            audit: { ...row.audit, updatedAt: new Date().toISOString() },
        };
        this.store.set(String(aggregate.id), updated);
        return { ok: true, value: this.toDomain(updated) };
    }
    async softDelete(id, expectedVersion) {
        const row = this.store.get(String(id));
        if (!row) {
            return { ok: false, error: { code: "invalid_persistence_state", message: "Organization not found." } };
        }
        if (row.version !== expectedVersion) {
            return {
                ok: false,
                error: { aggregateId: String(id), expectedVersion, actualVersion: row.version },
            };
        }
        row.status = "archived";
        row.version += 1;
        return { ok: true, value: undefined };
    }
    toDomain(row) {
        return {
            id: row.id,
            slug: row.slug,
            name: row.name,
            description: row.description,
            billingEmail: row.billingEmail,
            planId: row.planId,
            status: row.status,
            featureOverrides: row.featureOverrides,
            version: row.version,
            audit: row.audit,
        };
    }
    clear() {
        this.store.clear();
        this.slugIndex.clear();
    }
}
export class InMemoryPlanRepository {
    store = new Map();
    add(plan) {
        this.store.set(String(plan.id), plan);
    }
    async findById(id) {
        return this.store.get(String(id)) ?? null;
    }
    async listActive() {
        return Array.from(this.store.values()).filter((p) => p.isActive);
    }
    async create(candidate) {
        const id = `plan_${crypto.randomUUID()}`;
        const now = new Date().toISOString();
        const plan = {
            ...candidate,
            id,
            version: 1,
            audit: { createdAt: now, updatedAt: now },
        };
        this.store.set(String(id), plan);
        return { ok: true, value: plan };
    }
    async save(aggregate, expectedVersion) {
        const existing = this.store.get(String(aggregate.id));
        if (!existing || existing.version !== expectedVersion) {
            return {
                ok: false,
                error: { aggregateId: String(aggregate.id), expectedVersion, actualVersion: existing?.version ?? 0 },
            };
        }
        const updated = { ...aggregate, version: aggregate.version + 1 };
        this.store.set(String(aggregate.id), updated);
        return { ok: true, value: updated };
    }
}
export class InMemoryFeatureRepository {
    store = new Map();
    add(feature) {
        this.store.set(String(feature.id), feature);
    }
    async findById(id) {
        return this.store.get(String(id)) ?? null;
    }
    async findByKey(key) {
        return Array.from(this.store.values()).find((f) => String(f.key) === key) ?? null;
    }
    async listAll() {
        return Array.from(this.store.values());
    }
    async create(candidate) {
        const id = `feat_${crypto.randomUUID()}`;
        const feature = { ...candidate, id, version: 1 };
        this.store.set(String(id), feature);
        return { ok: true, value: feature };
    }
    async save(aggregate, expectedVersion) {
        const existing = this.store.get(String(aggregate.id));
        if (!existing || existing.version !== expectedVersion) {
            return {
                ok: false,
                error: { aggregateId: String(aggregate.id), expectedVersion, actualVersion: existing?.version ?? 0 },
            };
        }
        const updated = { ...aggregate, version: aggregate.version + 1 };
        this.store.set(String(aggregate.id), updated);
        return { ok: true, value: updated };
    }
}
//# sourceMappingURL=organization.js.map