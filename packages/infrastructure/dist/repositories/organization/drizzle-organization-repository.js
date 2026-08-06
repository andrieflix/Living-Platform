/**
 * Drizzle-backed Organization repository implementation.
 *
 * Implements OrganizationReader and OrganizationCreator only.
 * Mutation methods (save, softDelete) are not included in this slice —
 * they will be added with their own use cases and tests.
 *
 * Create behavior:
 * - accepts OrganizationDraft (version 0)
 * - inserts atomically
 * - stores the normalized slug
 * - initializes persisted aggregate version to 1
 * - maps duplicate slug violations to DuplicateKeyError
 * - maps unavailable connections to PersistenceUnavailableError
 * - maps invalid stored state to InvalidPersistenceStateError
 * - returns no raw database exception
 */
import { eq } from "drizzle-orm";
import { organizations } from "../../db/schema";
import { rowToOrganization, draftToInsertData } from "../../db/organization-mapper";
function isDuplicateKeyError(err) {
    if (err && typeof err === "object" && "code" in err) {
        return err.code === "23505";
    }
    return false;
}
function isConnectionError(err) {
    if (err && typeof err === "object") {
        const e = err;
        if (e.code === "ECONNREFUSED" || e.code === "ETIMEDOUT" || e.code === "ENOTFOUND") {
            return true;
        }
        if (typeof e.message === "string" && /connection|timeout|unreachable/i.test(e.message)) {
            return true;
        }
    }
    return false;
}
export class DrizzleOrganizationRepository {
    db;
    logger;
    constructor(config) {
        this.db = config.db;
        this.logger = config.logger;
    }
    async findById(id) {
        try {
            const rows = await this.db.select().from(organizations).where(eq(organizations.id, String(id)));
            if (rows.length === 0)
                return null;
            const mapped = rowToOrganization(rows[0]);
            if (!mapped.ok) {
                this.logger.error("Failed to map organization row", { id: String(id), error: mapped.error.message });
                return null;
            }
            return mapped.value;
        }
        catch (err) {
            this.logger.error("findById failed", { id: String(id), error: String(err) });
            return null;
        }
    }
    async findBySlug(slug) {
        try {
            const rows = await this.db.select().from(organizations).where(eq(organizations.slug, slug));
            if (rows.length === 0)
                return null;
            const mapped = rowToOrganization(rows[0]);
            if (!mapped.ok) {
                this.logger.error("Failed to map organization row", { slug, error: mapped.error.message });
                return null;
            }
            return mapped.value;
        }
        catch (err) {
            this.logger.error("findBySlug failed", { slug, error: String(err) });
            return null;
        }
    }
    async list(params) {
        try {
            const allRows = await this.db.select().from(organizations);
            let filtered = allRows;
            if (params.status) {
                filtered = filtered.filter((r) => r.status === params.status);
            }
            const total = filtered.length;
            const start = (params.page - 1) * params.pageSize;
            const pageRows = filtered.slice(start, start + params.pageSize);
            const items = [];
            for (const row of pageRows) {
                const mapped = rowToOrganization(row);
                if (mapped.ok)
                    items.push(mapped.value);
            }
            return {
                items,
                total,
                page: params.page,
                pageSize: params.pageSize,
                hasMore: start + params.pageSize < total,
            };
        }
        catch (err) {
            this.logger.error("list failed", { error: String(err) });
            return { items: [], total: 0, page: params.page, pageSize: params.pageSize, hasMore: false };
        }
    }
    async create(candidate) {
        try {
            const insertData = draftToInsertData(candidate, 1);
            const [inserted] = await this.db.insert(organizations).values({
                id: insertData.id,
                name: insertData.name,
                slug: insertData.slug,
                billing_email: insertData.billing_email,
                plan_id: insertData.plan_id,
                status: insertData.status,
                feature_overrides: insertData.feature_overrides,
                version: insertData.version,
                created_at: insertData.created_at,
                updated_at: insertData.updated_at,
                created_by: insertData.created_by,
                updated_by: insertData.updated_by,
                deleted_at: insertData.deleted_at,
            }).returning();
            if (!inserted) {
                return {
                    ok: false,
                    error: { code: "invalid_persistence_state", message: "Insert returned no row." },
                };
            }
            const mapped = rowToOrganization(inserted);
            if (!mapped.ok) {
                return { ok: false, error: mapped.error };
            }
            return { ok: true, value: mapped.value };
        }
        catch (err) {
            return this.mapCreateError(err, String(candidate.slug));
        }
    }
    mapCreateError(err, slug) {
        if (isDuplicateKeyError(err)) {
            return {
                ok: false,
                error: {
                    code: "duplicate_key",
                    message: `An organization with slug "${slug}" already exists.`,
                    field: "slug",
                    value: slug,
                },
            };
        }
        if (isConnectionError(err)) {
            return {
                ok: false,
                error: { code: "persistence_unavailable", message: "Database connection error during create." },
            };
        }
        this.logger.error("Unexpected create error", { error: String(err) });
        return {
            ok: false,
            error: { code: "invalid_persistence_state", message: `Create failed: ${String(err)}` },
        };
    }
}
//# sourceMappingURL=drizzle-organization-repository.js.map