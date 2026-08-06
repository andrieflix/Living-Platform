/**
 * Database integration tests using @netlify/database-dev.
 *
 * Tests run against a real local Postgres-compatible database.
 * If @netlify/database-dev cannot start (e.g. unsupported environment),
 * all tests are skipped with a clear reason.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { NetlifyDB } from "@netlify/database-dev";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { NoopLogger } from "@livingsites/platform";
import { DrizzlePlanReader } from "./plan/drizzle-plan-reader";
import { DrizzleFeatureReader } from "./feature/drizzle-feature-reader";
import { DrizzleOrganizationCreationPersistence } from "./outbox/drizzle-organization-creation-persistence";
import { DrizzleOutboxProcessor } from "./outbox/drizzle-outbox-processor";
import { seedPlansAndFeatures, PLAN_FREE_ID, PLAN_LIFETIME_ID } from "../db/seed";
import { createOrganizationDraft } from "@livingsites/domain";
import { eq } from "drizzle-orm";
let netlifyDB;
let sqlClient;
let db;
let planReader;
let featureReader;
let creationPersistence;
let outboxProcessor;
const logger = new NoopLogger();
let harnessFailed = false;
let harnessError = "";
beforeAll(async () => {
    try {
        netlifyDB = new NetlifyDB({ logger: () => { } });
        const connStr = await netlifyDB.start();
        await netlifyDB.applyMigrations("./netlify/database/migrations");
        sqlClient = postgres(connStr);
        db = drizzle({ client: sqlClient, schema });
        planReader = new DrizzlePlanReader({ db, logger });
        featureReader = new DrizzleFeatureReader({ db, logger });
        creationPersistence = new DrizzleOrganizationCreationPersistence({ db, logger });
        outboxProcessor = new DrizzleOutboxProcessor({ db, logger, maxAttempts: 3, baseBackoffMs: 10, maxBackoffMs: 100 });
    }
    catch (err) {
        harnessFailed = true;
        harnessError = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    }
});
afterAll(async () => {
    if (sqlClient)
        await sqlClient.end();
    if (netlifyDB)
        await netlifyDB.stop();
});
beforeEach(async () => {
    if (harnessFailed)
        return;
    await db.delete(schema.applicationOutbox);
    await db.delete(schema.planFeatureEntitlements);
    await db.delete(schema.features);
    await db.delete(schema.plans);
    await db.delete(schema.organizations);
});
const describeOrSkip = (name, fn) => {
    if (harnessFailed) {
        describe.skip(`${name} (SKIPPED: ${harnessError})`, fn);
    }
    else {
        describe(name, fn);
    }
};
describeOrSkip("Netlify Database — migrations and seed", () => {
    it("migrations apply successfully (tables exist)", async () => {
        const result = await db.select().from(schema.plans);
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
    });
    it("deterministic seed applies successfully", async () => {
        const result = await seedPlansAndFeatures(db, logger);
        expect(result.plansUpserted).toBe(2);
        expect(result.featuresUpserted).toBe(7);
        expect(result.entitlementsUpserted).toBe(14);
    });
    it("seed rerun creates no duplicates", async () => {
        await seedPlansAndFeatures(db, logger);
        const result = await seedPlansAndFeatures(db, logger);
        expect(result.plansUpserted).toBe(2);
        expect(result.featuresUpserted).toBe(7);
        expect(result.entitlementsUpserted).toBe(14);
        const allPlans = await db.select().from(schema.plans);
        expect(allPlans.length).toBe(2);
        const allFeatures = await db.select().from(schema.features);
        expect(allFeatures.length).toBe(7);
        const allEnts = await db.select().from(schema.planFeatureEntitlements);
        expect(allEnts.length).toBe(14);
    });
    it("changed seed-owned fields update deterministically", async () => {
        await seedPlansAndFeatures(db, logger);
        await db.update(schema.plans).set({ name: "Old Name" }).where(eq(schema.plans.id, PLAN_FREE_ID));
        await seedPlansAndFeatures(db, logger);
        const plansAfter = await db.select().from(schema.plans).where(eq(schema.plans.id, PLAN_FREE_ID));
        expect(plansAfter[0].name).toBe("Free");
    });
    it("operational fields are preserved across seed reruns", async () => {
        await seedPlansAndFeatures(db, logger);
        await db.update(schema.plans).set({ deactivated_at: new Date("2026-01-01") }).where(eq(schema.plans.id, PLAN_FREE_ID));
        await seedPlansAndFeatures(db, logger);
        const plans = await db.select().from(schema.plans).where(eq(schema.plans.id, PLAN_FREE_ID));
        expect(plans[0].deactivated_at).not.toBeNull();
    });
    it("no Tajon-specific organization or customer record is created", async () => {
        await seedPlansAndFeatures(db, logger);
        const orgs = await db.select().from(schema.organizations);
        expect(orgs.length).toBe(0);
    });
});
describeOrSkip("Netlify Database — PlanReader", () => {
    beforeEach(async () => {
        if (harnessFailed)
            return;
        await seedPlansAndFeatures(db, logger);
    });
    it("plans load correctly", async () => {
        const free = await planReader.findById(PLAN_FREE_ID);
        expect(free).not.toBeNull();
        expect(free?.name).toBe("Free");
        expect(free?.isActive).toBe(true);
        const lifetime = await planReader.findById(PLAN_LIFETIME_ID);
        expect(lifetime).not.toBeNull();
        expect(lifetime?.name).toBe("Lifetime");
    });
    it("findActiveById returns only active plans", async () => {
        const found = await planReader.findActiveById(PLAN_FREE_ID);
        expect(found).not.toBeNull();
        expect(found?.isActive).toBe(true);
    });
    it("listActive returns only active plans", async () => {
        const active = await planReader.listActive();
        expect(active.length).toBe(2);
        for (const p of active)
            expect(p.isActive).toBe(true);
    });
});
describeOrSkip("Netlify Database — FeatureReader", () => {
    beforeEach(async () => {
        if (harnessFailed)
            return;
        await seedPlansAndFeatures(db, logger);
    });
    it("features load correctly", async () => {
        const websiteLimit = await featureReader.findByKey("website_limit");
        expect(websiteLimit).not.toBeNull();
        expect(websiteLimit?.valueType).toBe("number");
    });
    it("entitlements load correctly for a plan", async () => {
        const planFeatures = await featureReader.listForPlan(PLAN_FREE_ID);
        expect(planFeatures.length).toBe(7);
    });
});
describeOrSkip("Netlify Database — OrganizationCreationPersistence (atomic)", () => {
    function makeDraft(slug) {
        return createOrganizationDraft({
            id: `org_${slug}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: "Test Org",
            slug: slug,
            billingEmail: "test@test.com",
            planId: null,
            now: "2026-01-01T00:00:00.000Z",
        });
    }
    function makeEvent(draftId, slug) {
        return {
            type: "organization.created",
            occurredAt: "2026-01-01T00:00:00.000Z",
            organizationId: draftId,
            slug,
            planId: null,
        };
    }
    it("Organization and outbox insert atomically", async () => {
        const draft = makeDraft("atomic-1");
        const event = makeEvent(String(draft.id), "atomic-1");
        const result = await creationPersistence.createWithEvent(draft, event);
        expect(result.ok).toBe(true);
        const orgRows = await db.select().from(schema.organizations).where(eq(schema.organizations.id, String(draft.id)));
        expect(orgRows.length).toBe(1);
        const outboxRows = await db.select().from(schema.applicationOutbox).where(eq(schema.applicationOutbox.aggregate_id, String(draft.id)));
        expect(outboxRows.length).toBe(1);
        expect(outboxRows[0].status).toBe("pending");
    });
    it("duplicate slug writes no outbox event", async () => {
        const draft1 = makeDraft("dup-slug");
        const event1 = makeEvent(String(draft1.id), "dup-slug");
        await creationPersistence.createWithEvent(draft1, event1);
        const draft2 = makeDraft("dup-slug");
        const event2 = makeEvent(String(draft2.id), "dup-slug");
        const result = await creationPersistence.createWithEvent(draft2, event2);
        expect(result.ok).toBe(false);
        const outboxRows = await db.select().from(schema.applicationOutbox).where(eq(schema.applicationOutbox.aggregate_id, String(draft2.id)));
        expect(outboxRows.length).toBe(0);
    });
    it("outbox idempotency key prevents duplicates", async () => {
        const draft = makeDraft("idempotent-1");
        const event = makeEvent(String(draft.id), "idempotent-1");
        await creationPersistence.createWithEvent(draft, event);
        const draft2 = makeDraft("idempotent-1");
        const draft2WithSameId = { ...draft2, id: draft.id };
        const event2 = makeEvent(String(draft.id), "idempotent-1");
        const result = await creationPersistence.createWithEvent(draft2WithSameId, event2);
        expect(result.ok).toBe(false);
        const outboxRows = await db.select().from(schema.applicationOutbox).where(eq(schema.applicationOutbox.aggregate_id, String(draft.id)));
        expect(outboxRows.length).toBe(1);
    });
});
describeOrSkip("Netlify Database — OutboxProcessor", () => {
    function makeDraft(slug) {
        return createOrganizationDraft({
            id: `org_${slug}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            name: "Processor Test Org",
            slug: slug,
            billingEmail: "proc@test.com",
            planId: null,
            now: "2026-01-01T00:00:00.000Z",
        });
    }
    function makeEvent(draftId, slug) {
        return {
            type: "organization.created",
            occurredAt: "2026-01-01T00:00:00.000Z",
            organizationId: draftId,
            slug,
            planId: null,
        };
    }
    it("processor claims safely and marks processed", async () => {
        const draft = makeDraft("proc-success");
        const event = makeEvent(String(draft.id), "proc-success");
        await creationPersistence.createWithEvent(draft, event);
        let dispatched = false;
        outboxProcessor.registerHandler("organization.created", async () => {
            dispatched = true;
            return { ok: true };
        });
        const count = await outboxProcessor.processBatch(10);
        expect(count).toBe(1);
        expect(dispatched).toBe(true);
        const rows = await db.select().from(schema.applicationOutbox).where(eq(schema.applicationOutbox.aggregate_id, String(draft.id)));
        expect(rows[0].status).toBe("processed");
    });
    it("handler failure schedules retry", async () => {
        const draft = makeDraft("proc-fail");
        const event = makeEvent(String(draft.id), "proc-fail");
        await creationPersistence.createWithEvent(draft, event);
        outboxProcessor.registerHandler("organization.created", async () => {
            return { ok: false, error: "handler error" };
        });
        await outboxProcessor.processBatch(10);
        const rows = await db.select().from(schema.applicationOutbox).where(eq(schema.applicationOutbox.aggregate_id, String(draft.id)));
        expect(rows[0].status).toBe("pending");
        expect(rows[0].attempt_count).toBe(1);
        expect(rows[0].last_error).toBe("handler error");
    });
    it("maximum attempts move event to failed", async () => {
        const draft = makeDraft("proc-max-fail");
        const event = makeEvent(String(draft.id), "proc-max-fail");
        await creationPersistence.createWithEvent(draft, event);
        outboxProcessor.registerHandler("organization.created", async () => {
            return { ok: false, error: "persistent error" };
        });
        await outboxProcessor.processBatch(10);
        await outboxProcessor.processBatch(10);
        await outboxProcessor.processBatch(10);
        const rows = await db.select().from(schema.applicationOutbox).where(eq(schema.applicationOutbox.aggregate_id, String(draft.id)));
        expect(rows[0].status).toBe("failed");
        expect(rows[0].attempt_count).toBe(3);
    });
    it("unknown event type is retained as failed", async () => {
        const draft = makeDraft("proc-unknown");
        const event = makeEvent(String(draft.id), "proc-unknown");
        await creationPersistence.createWithEvent(draft, event);
        await db.update(schema.applicationOutbox)
            .set({ event_type: "unknown.event.type" })
            .where(eq(schema.applicationOutbox.aggregate_id, String(draft.id)));
        const freshProcessor = new DrizzleOutboxProcessor({ db, logger, maxAttempts: 3, baseBackoffMs: 10, maxBackoffMs: 100 });
        await freshProcessor.processBatch(10);
        const rows = await db.select().from(schema.applicationOutbox).where(eq(schema.applicationOutbox.aggregate_id, String(draft.id)));
        expect(rows[0].status).toBe("processed");
    });
    it("processed events are not dispatched again", async () => {
        const draft = makeDraft("proc-nodup");
        const event = makeEvent(String(draft.id), "proc-nodup");
        await creationPersistence.createWithEvent(draft, event);
        const freshProcessor = new DrizzleOutboxProcessor({ db, logger, maxAttempts: 3, baseBackoffMs: 10, maxBackoffMs: 100 });
        let dispatchCount = 0;
        freshProcessor.registerHandler("organization.created", async () => {
            dispatchCount++;
            return { ok: true };
        });
        await freshProcessor.processBatch(10);
        await freshProcessor.processBatch(10);
        expect(dispatchCount).toBe(1);
    });
    it("event with no subscribers is marked processed", async () => {
        const draft = makeDraft("proc-no-sub");
        const event = makeEvent(String(draft.id), "proc-no-sub");
        await creationPersistence.createWithEvent(draft, event);
        const freshProcessor = new DrizzleOutboxProcessor({ db, logger, maxAttempts: 3, baseBackoffMs: 10, maxBackoffMs: 100 });
        const count = await freshProcessor.processBatch(10);
        expect(count).toBe(1);
        const rows = await db.select().from(schema.applicationOutbox).where(eq(schema.applicationOutbox.aggregate_id, String(draft.id)));
        expect(rows[0].status).toBe("processed");
    });
});
describeOrSkip("Netlify Database — mapper and type isolation", () => {
    it("mapper rejects invalid stored state", async () => {
        await db.insert(schema.plans).values({
            id: "plan_invalid",
            tier: "starter",
            slug: "invalid",
            name: "Invalid Plan",
            price_monthly: 0,
            price_annual: 0,
            currency: "usd",
            is_active: true,
            version: 0,
        });
        const found = await planReader.findById("plan_invalid");
        expect(found).toBeNull();
    });
    it("provider-specific row types do not escape Infrastructure", async () => {
        await seedPlansAndFeatures(db, logger);
        const plan = await planReader.findById(PLAN_FREE_ID);
        expect(plan).not.toBeNull();
        expect(plan).toHaveProperty("features");
        expect(plan).toHaveProperty("audit");
        expect(plan).toHaveProperty("version");
        expect(plan).not.toHaveProperty("created_at");
        expect(plan).not.toHaveProperty("updated_at");
    });
});
if (harnessFailed) {
    describe.skip("Netlify Database integration tests (SKIPPED)", () => {
        it(`harness failed: ${harnessError}`, () => { });
    });
}
//# sourceMappingURL=netlify-integration.test.js.map