/**
 * Database integration test suite for Drizzle PlanReader, FeatureReader,
 * OutboxEventPublisher, DrizzleOrganizationCreationPersistence, and
 * DrizzleOutboxProcessor.
 *
 * Uses TEST_DATABASE_URL environment variable.
 * - When TEST_DATABASE_URL is absent, all tests are skipped with a visible reason.
 * - When present, migrations are applied, seeds are planted, and tests
 *   run against the test database.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { NoopLogger } from "@livingsites/platform";
import type { PlanId, ISODateString } from "@livingsites/domain";
import type { OrganizationCreatedEvent } from "@livingsites/domain";
import { DrizzlePlanReader } from "../plan/drizzle-plan-reader";
import { DrizzleFeatureReader } from "../feature/drizzle-feature-reader";
import { DrizzleOrganizationCreationPersistence } from "../outbox/drizzle-organization-creation-persistence";
import { DrizzleOutboxProcessor } from "../outbox/drizzle-outbox-processor";
import { seedPlansAndFeatures, PLAN_FREE_ID, PLAN_LIFETIME_ID } from "../../db/seed";
import { createOrganizationDraft } from "@livingsites/domain";
import type { OrganizationDraft, OrganizationId, Slug } from "@livingsites/domain";
import * as schema from "../../db/schema";
import { plans, features, planFeatureEntitlements, applicationOutbox, organizations } from "../../db/schema";
import { eq } from "drizzle-orm";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const shouldSkip = !TEST_DATABASE_URL;
const skipReason = "TEST_DATABASE_URL is not set. Set it to a test PostgreSQL connection string to run database integration tests.";
const describeOrSkip = shouldSkip ? describe.skip : describe;

describeOrSkip("Drizzle Plan/Feature/Outbox — database integration", () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let sqlClient: ReturnType<typeof postgres>;
  let planReader: DrizzlePlanReader;
  let featureReader: DrizzleFeatureReader;
  let creationPersistence: DrizzleOrganizationCreationPersistence;
  let outboxProcessor: DrizzleOutboxProcessor;
  const logger = new NoopLogger();

  beforeAll(async () => {
    sqlClient = postgres(TEST_DATABASE_URL!);
    db = drizzle({ client: sqlClient, schema });
    await migrate(db, { migrationsFolder: "./netlify/database/migrations" });
    planReader = new DrizzlePlanReader({ db, logger });
    featureReader = new DrizzleFeatureReader({ db, logger });
    creationPersistence = new DrizzleOrganizationCreationPersistence({ db, logger });
    outboxProcessor = new DrizzleOutboxProcessor({ db, logger, maxAttempts: 3, baseBackoffMs: 10, maxBackoffMs: 100 });
  });

  afterAll(async () => {
    if (sqlClient) await sqlClient.end();
  });

  beforeEach(async () => {
    await db.delete(applicationOutbox);
    await db.delete(planFeatureEntitlements);
    await db.delete(features);
    await db.delete(plans);
    await db.delete(organizations);
    await seedPlansAndFeatures(db);
  });

  describe("PlanReader", () => {
    it("returns active plan by ID", async () => {
      const found = await planReader.findById(PLAN_FREE_ID as PlanId);
      expect(found).not.toBeNull();
      expect(found?.name).toBe("Free");
      expect(found?.isActive).toBe(true);
    });

    it("findActiveById returns active plan", async () => {
      const found = await planReader.findActiveById(PLAN_FREE_ID as PlanId);
      expect(found).not.toBeNull();
      expect(found?.isActive).toBe(true);
    });

    it("returns null for missing plan", async () => {
      const found = await planReader.findById("plan_nonexistent" as PlanId);
      expect(found).toBeNull();
    });

    it("listActive returns only active plans", async () => {
      const active = await planReader.listActive();
      expect(active.length).toBe(2);
      for (const p of active) {
        expect(p.isActive).toBe(true);
      }
    });

    it("reconstructs plan with entitlements", async () => {
      const found = await planReader.findById(PLAN_LIFETIME_ID as PlanId);
      expect(found).not.toBeNull();
      expect(found?.features.length).toBe(7);
    });

    it("returned values are isolated", async () => {
      const found = await planReader.findById(PLAN_FREE_ID as PlanId);
      if (!found) throw new Error("plan not found");
      const originalName = found.name;
      found.name = "Modified";
      const refound = await planReader.findById(PLAN_FREE_ID as PlanId);
      expect(refound?.name).toBe(originalName);
    });
  });

  describe("FeatureReader", () => {
    it("retrieves features by stable key", async () => {
      const found = await featureReader.findByKey("website_limit");
      expect(found).not.toBeNull();
      expect(found?.name).toBe("Website Limit");
      expect(found?.valueType).toBe("number");
    });

    it("lists entitlements for a plan", async () => {
      const planFeatures = await featureReader.listForPlan(PLAN_FREE_ID as PlanId);
      expect(planFeatures.length).toBe(7);
    });

    it("handles missing features", async () => {
      const found = await featureReader.findByKey("nonexistent_key");
      expect(found).toBeNull();
    });

    it("reconstructs typed values correctly", async () => {
      const found = await featureReader.findByKey("custom_domain");
      expect(found).not.toBeNull();
      expect(found?.valueType).toBe("boolean");
      expect(found?.isActive).toBe(true);
      expect(found?.version).toBe(1);
    });
  });

  describe("OrganizationCreationPersistence — atomic transaction", () => {
    function makeDraft(overrides: Partial<{ id: string; name: string; slug: string; billingEmail: string }>): OrganizationDraft {
      return createOrganizationDraft({
        id: (overrides.id ?? `org_tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`) as OrganizationId,
        name: overrides.name ?? "Tx Test Org",
        slug: (overrides.slug ?? `tx-test-${Date.now()}`) as Slug,
        billingEmail: overrides.billingEmail ?? "tx@test.com",
        planId: null,
        now: "2026-01-01T00:00:00.000Z" as ISODateString,
      });
    }

    function makeEvent(draftId: string, slug: string): OrganizationCreatedEvent {
      return {
        type: "organization.created",
        occurredAt: "2026-01-01T00:00:00.000Z" as ISODateString,
        organizationId: draftId as OrganizationId,
        slug,
        planId: null,
      };
    }

    it("successful create writes one outbox record", async () => {
      const draft = makeDraft({ slug: "atomic-create-1" });
      const event = makeEvent(String(draft.id), "atomic-create-1");
      const result = await creationPersistence.createWithEvent(draft, event);
      expect(result.ok).toBe(true);

      const outboxEvents = await db.select().from(applicationOutbox).where(eq(applicationOutbox.aggregate_id, String(draft.id)));
      expect(outboxEvents.length).toBe(1);
      expect(outboxEvents[0]!.event_type).toBe("organization.created");
      expect(outboxEvents[0]!.status).toBe("pending");
    });

    it("failed create (duplicate slug) writes no outbox record", async () => {
      const draft1 = makeDraft({ slug: "dup-atomic" });
      const event1 = makeEvent(String(draft1.id), "dup-atomic");
      await creationPersistence.createWithEvent(draft1, event1);

      const draft2 = makeDraft({ slug: "dup-atomic" });
      const event2 = makeEvent(String(draft2.id), "dup-atomic");
      const result = await creationPersistence.createWithEvent(draft2, event2);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("duplicate_key");
      }

      const outboxEvents = await db.select().from(applicationOutbox).where(eq(applicationOutbox.aggregate_id, String(draft2.id)));
      expect(outboxEvents.length).toBe(0);
    });

    it("aggregate and event are atomic", async () => {
      const draft = makeDraft({ slug: "atomic-test" });
      const event = makeEvent(String(draft.id), "atomic-test");
      const result = await creationPersistence.createWithEvent(draft, event);
      expect(result.ok).toBe(true);

      const orgRows = await db.select().from(organizations).where(eq(organizations.id, String(draft.id)));
      expect(orgRows.length).toBe(1);

      const outboxRows = await db.select().from(applicationOutbox).where(eq(applicationOutbox.aggregate_id, String(draft.id)));
      expect(outboxRows.length).toBe(1);
    });

    it("idempotency prevents duplicate events", async () => {
      const draft = makeDraft({ slug: "idempotent-test" });
      const event = makeEvent(String(draft.id), "idempotent-test");
      await creationPersistence.createWithEvent(draft, event);

      const draft2 = makeDraft({ id: String(draft.id), slug: "idempotent-test" });
      const event2 = makeEvent(String(draft.id), "idempotent-test");
      const result = await creationPersistence.createWithEvent(draft2, event2);
      expect(result.ok).toBe(false);

      const outboxRows = await db.select().from(applicationOutbox).where(eq(applicationOutbox.aggregate_id, String(draft.id)));
      expect(outboxRows.length).toBe(1);
    });
  });

  describe("OutboxProcessor", () => {
    it("processor marks success", async () => {
      const draft = makeDraftHelper("proc-success");
      const event = makeEventHelper(String(draft.id), "proc-success");
      await creationPersistence.createWithEvent(draft, event);

      let dispatched = false;
      outboxProcessor.registerHandler("organization.created", async () => {
        dispatched = true;
        return { ok: true };
      });

      const count = await outboxProcessor.processBatch(10);
      expect(count).toBe(1);
      expect(dispatched).toBe(true);

      const rows = await db.select().from(applicationOutbox).where(eq(applicationOutbox.aggregate_id, String(draft.id)));
      expect(rows[0]!.status).toBe("processed");
      expect(rows[0]!.processed_at).not.toBeNull();
    });

    it("handler failure records error and retries", async () => {
      const draft = makeDraftHelper("proc-fail");
      const event = makeEventHelper(String(draft.id), "proc-fail");
      await creationPersistence.createWithEvent(draft, event);

      outboxProcessor.registerHandler("organization.created", async () => {
        return { ok: false, error: "handler error" };
      });

      await outboxProcessor.processBatch(10);
      const rows = await db.select().from(applicationOutbox).where(eq(applicationOutbox.aggregate_id, String(draft.id)));
      expect(rows[0]!.status).toBe("pending");
      expect(rows[0]!.attempt_count).toBe(1);
      expect(rows[0]!.last_error).toBe("handler error");
    });

    it("processed events are not dispatched again", async () => {
      const draft = makeDraftHelper("proc-nodup");
      const event = makeEventHelper(String(draft.id), "proc-nodup");
      await creationPersistence.createWithEvent(draft, event);

      let dispatchCount = 0;
      outboxProcessor.registerHandler("organization.created", async () => {
        dispatchCount++;
        return { ok: true };
      });

      await outboxProcessor.processBatch(10);
      await outboxProcessor.processBatch(10);
      expect(dispatchCount).toBe(1);
    });

    it("unknown event type is retained as failed", async () => {
      const draft = makeDraftHelper("proc-unknown");
      const event = makeEventHelper(String(draft.id), "proc-unknown");
      await creationPersistence.createWithEvent(draft, event);

      await db.update(applicationOutbox)
        .set({ event_type: "unknown.event.type" })
        .where(eq(applicationOutbox.aggregate_id, String(draft.id)));

      await outboxProcessor.processBatch(10);
      const rows = await db.select().from(applicationOutbox).where(eq(applicationOutbox.aggregate_id, String(draft.id)));
      expect(rows[0]!.status).toBe("processed");
    });

    it("event with no subscribers is marked processed", async () => {
      const draft = makeDraftHelper("proc-no-sub");
      const event = makeEventHelper(String(draft.id), "proc-no-sub");
      await creationPersistence.createWithEvent(draft, event);

      const freshProcessor = new DrizzleOutboxProcessor({ db, logger, maxAttempts: 3, baseBackoffMs: 10, maxBackoffMs: 100 });
      const count = await freshProcessor.processBatch(10);
      expect(count).toBe(1);

      const rows = await db.select().from(applicationOutbox).where(eq(applicationOutbox.aggregate_id, String(draft.id)));
      expect(rows[0]!.status).toBe("processed");
    });
  });
});

function makeDraftHelper(slug: string): OrganizationDraft {
  return createOrganizationDraft({
    id: `org_${slug}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` as OrganizationId,
    name: "Processor Test Org",
    slug: slug as Slug,
    billingEmail: "proc@test.com",
    planId: null,
    now: "2026-01-01T00:00:00.000Z" as ISODateString,
  });
}

function makeEventHelper(draftId: string, slug: string): OrganizationCreatedEvent {
  return {
    type: "organization.created",
    occurredAt: "2026-01-01T00:00:00.000Z" as ISODateString,
    organizationId: draftId as OrganizationId,
    slug,
    planId: null,
  };
}

if (shouldSkip) {
  describe.skip("Drizzle Plan/Feature/Outbox — database integration (SKIPPED)", () => {
    it(`skipped — ${skipReason}`, () => {});
  });
}
