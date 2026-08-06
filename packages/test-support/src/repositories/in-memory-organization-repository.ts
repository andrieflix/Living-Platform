/**
 * In-memory OrganizationRepository for tests.
 *
 * Implements OrganizationReader, OrganizationCreator, and the full
 * OrganizationRepository port using an in-memory Map.
 *
 * Create behavior matches production:
 * - accepts OrganizationDraft (version 0)
 * - returns Organization at version 1
 * - enforces unique slug
 * - typed errors (DuplicateKeyError)
 */
import type {
  Organization,
  OrganizationDraft,
  OrganizationId,
  Plan,
  PlanId,
  Feature,
  FeatureId,
  PaginatedResult,
  AggregateVersion,
} from "@livingsites/domain";
import type {
  CreateResult,
  SaveResult,
  MutationResult,
} from "@livingsites/application";
import type {
  OrganizationRepository,
  OrganizationReader,
  OrganizationCreator,
  PlanRepository,
  PlanReader,
  FeatureRepository,
  FeatureReader,
  OrganizationListParams,
} from "@livingsites/application";

interface StoredOrganization {
  id: OrganizationId;
  slug: string;
  name: string;
  description?: string;
  billingEmail: string;
  planId: PlanId | null;
  status: string;
  featureOverrides: readonly { featureId: FeatureId; value: number; enabled: boolean; reason?: string; appliedAt: string }[];
  version: AggregateVersion;
  audit: { createdAt: string; updatedAt: string; createdBy?: string; updatedBy?: string };
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  private store: Map<string, StoredOrganization> = new Map();
  private slugIndex: Map<string, string> = new Map();

  async findById(id: OrganizationId): Promise<Organization | null> {
    const row = this.store.get(String(id));
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const id = this.slugIndex.get(slug);
    if (!id) return null;
    const row = this.store.get(id);
    return row ? this.toDomain(row) : null;
  }

  async list(params: OrganizationListParams): Promise<PaginatedResult<Organization>> {
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
      items: pageItems.map((r) => this.toDomain(r)!),
      total,
      page: params.page,
      pageSize: params.pageSize,
      hasMore: start + params.pageSize < total,
    };
  }

  async create(candidate: OrganizationDraft): Promise<CreateResult<Organization>> {
    const slug = String(candidate.slug);
    if (this.slugIndex.has(slug)) {
      return {
        ok: false,
        error: { code: "duplicate_key", message: `Slug "${slug}" already exists.`, field: "slug", value: slug },
      };
    }

    const row: StoredOrganization = {
      id: candidate.id,
      slug,
      name: candidate.name,
      billingEmail: candidate.billingEmail,
      planId: candidate.planId,
      status: candidate.status,
      featureOverrides: candidate.featureOverrides,
      version: 1,
      audit: { createdAt: candidate.audit.createdAt, updatedAt: candidate.audit.updatedAt },
    };

    this.store.set(String(candidate.id), row);
    this.slugIndex.set(slug, String(candidate.id));

    return { ok: true, value: this.toDomain(row)! };
  }

  async save(aggregate: Organization, expectedVersion: AggregateVersion): Promise<SaveResult<Organization>> {
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
        error: { aggregateId: String(aggregate.id), expectedVersion, actualVersion: row.version },
      };
    }

    const updated: StoredOrganization = {
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
    return { ok: true, value: this.toDomain(updated)! };
  }

  async softDelete(id: OrganizationId, expectedVersion: AggregateVersion): Promise<MutationResult> {
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

  private toDomain(row: StoredOrganization): Organization {
    return {
      id: row.id,
      slug: row.slug as import("@livingsites/domain").Slug,
      name: row.name,
      description: row.description,
      billingEmail: row.billingEmail,
      planId: row.planId,
      status: row.status as "active" | "archived" | "deleted",
      featureOverrides: row.featureOverrides as readonly import("@livingsites/domain").FeatureOverride[],
      version: row.version,
      audit: row.audit as import("@livingsites/domain").AuditTrail,
    };
  }

  clear(): void {
    this.store.clear();
    this.slugIndex.clear();
  }
}

export class InMemoryPlanRepository implements PlanRepository {
  private store: Map<string, Plan> = new Map();

  add(plan: Plan): void {
    this.store.set(String(plan.id), plan);
  }

  async findById(id: PlanId): Promise<Plan | null> {
    return this.store.get(String(id)) ?? null;
  }

  async findActiveById(id: PlanId): Promise<Plan | null> {
    const plan = this.store.get(String(id));
    if (!plan || !plan.isActive) return null;
    return plan;
  }

  async listActive(): Promise<Plan[]> {
    return Array.from(this.store.values()).filter((p) => p.isActive);
  }

  async create(candidate: Omit<Plan, "id" | "audit" | "version">): Promise<CreateResult<Plan>> {
    const id = `plan_${crypto.randomUUID()}` as PlanId;
    const now = new Date().toISOString();
    const plan: Plan = {
      ...candidate,
      id,
      version: 1,
      audit: { createdAt: now as import("@livingsites/domain").ISODateString, updatedAt: now as import("@livingsites/domain").ISODateString },
    } as Plan;
    this.store.set(String(id), plan);
    return { ok: true, value: plan };
  }

  async save(aggregate: Plan, expectedVersion: AggregateVersion): Promise<SaveResult<Plan>> {
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

export class InMemoryFeatureRepository implements FeatureRepository {
  private store: Map<string, Feature> = new Map();
  private entitlements: Map<string, { featureId: string; value: number }> = new Map();

  add(feature: Feature): void {
    this.store.set(String(feature.id), feature);
  }

  addEntitlement(planId: string, featureId: string, value: number): void {
    this.entitlements.set(`${planId}:${featureId}`, { featureId, value });
  }

  async findById(id: FeatureId): Promise<Feature | null> {
    return this.store.get(String(id)) ?? null;
  }

  async findByKey(key: string): Promise<Feature | null> {
    return Array.from(this.store.values()).find((f) => String(f.key) === key) ?? null;
  }

  async listForPlan(planId: PlanId): Promise<Feature[]> {
    const planKey = String(planId);
    const featureIds = Array.from(this.entitlements.values())
      .filter((e) => this.entitlements.has(`${planKey}:${e.featureId}`))
      .map((e) => e.featureId);
    return featureIds
      .map((fid) => this.store.get(fid))
      .filter((f): f is Feature => f !== undefined);
  }

  async listAll(): Promise<Feature[]> {
    return Array.from(this.store.values());
  }

  async create(candidate: Omit<Feature, "id" | "version">): Promise<CreateResult<Feature>> {
    const id = `feat_${crypto.randomUUID()}` as FeatureId;
    const feature: Feature = { ...candidate, id, version: 1 } as Feature;
    this.store.set(String(id), feature);
    return { ok: true, value: feature };
  }

  async save(aggregate: Feature, expectedVersion: AggregateVersion): Promise<SaveResult<Feature>> {
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

export type { OrganizationReader, OrganizationCreator, PlanReader, FeatureReader };
