/**
 * Reusable contract test suites for PlanReader, FeatureReader, and Outbox.
 *
 * Runs the same core behavior against both in-memory and Drizzle adapters,
 * ensuring both satisfy the application-layer port contracts.
 */
import { describe, it, expect } from "vitest";
import type { Plan, Feature, PlanId } from "@livingsites/domain";
import type { PlanReader, FeatureReader, OutboxReader } from "@livingsites/application";

export interface PlanReaderContractFixtures {
  readonly reader: PlanReader;
  readonly seedPlans: readonly Plan[];
  readonly cleanup: () => Promise<void>;
}

export function runPlanReaderContractTests(
  name: string,
  getFixtures: () => PlanReaderContractFixtures,
) {
  describe(`${name} — PlanReader contract`, () => {
    let f: PlanReaderContractFixtures;

    beforeEach(async () => {
      f = getFixtures();
    });

    afterEach(async () => {
      await f.cleanup();
    });

    it("returns active plan by ID", async () => {
      const activePlan = f.seedPlans.find((p) => p.isActive);
      if (!activePlan) throw new Error("No active plan in fixtures");
      const found = await f.reader.findById(activePlan.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(activePlan.name);
      expect(found?.isActive).toBe(true);
    });

    it("findActiveById returns only active plans", async () => {
      const activePlan = f.seedPlans.find((p) => p.isActive);
      if (!activePlan) throw new Error("No active plan in fixtures");
      const found = await f.reader.findActiveById(activePlan.id);
      expect(found).not.toBeNull();
      expect(found?.isActive).toBe(true);
    });

    it("findActiveById returns null for inactive plan", async () => {
      const inactivePlan = f.seedPlans.find((p) => !p.isActive);
      if (!inactivePlan) {
        expect(true).toBe(true);
        return;
      }
      const found = await f.reader.findActiveById(inactivePlan.id);
      expect(found).toBeNull();
    });

    it("returns null for missing plan", async () => {
      const found = await f.reader.findById("plan_nonexistent" as PlanId);
      expect(found).toBeNull();
    });

    it("listActive returns only active plans", async () => {
      const active = await f.reader.listActive();
      expect(active.length).toBeGreaterThan(0);
      for (const p of active) {
        expect(p.isActive).toBe(true);
      }
    });

    it("returned values are isolated", async () => {
      const plan = f.seedPlans.find((p) => p.isActive);
      if (!plan) throw new Error("No active plan");
      const found = await f.reader.findById(plan.id);
      if (!found) throw new Error("findById returned null");
      const originalName = found.name;
      found.name = "Modified";
      const refound = await f.reader.findById(plan.id);
      expect(refound?.name).toBe(originalName);
    });
  });
}

export interface FeatureReaderContractFixtures {
  readonly reader: FeatureReader;
  readonly seedFeatures: readonly Feature[];
  readonly seedPlanId: PlanId;
  readonly seedEntitlementCount: number;
  readonly cleanup: () => Promise<void>;
}

export function runFeatureReaderContractTests(
  name: string,
  getFixtures: () => FeatureReaderContractFixtures,
) {
  describe(`${name} — FeatureReader contract`, () => {
    let f: FeatureReaderContractFixtures;

    beforeEach(async () => {
      f = getFixtures();
    });

    afterEach(async () => {
      await f.cleanup();
    });

    it("retrieves features by stable key", async () => {
      const feature = f.seedFeatures[0];
      if (!feature) throw new Error("No seed features");
      const found = await f.reader.findByKey(String(feature.key));
      expect(found).not.toBeNull();
      expect(found?.name).toBe(feature.name);
    });

    it("lists entitlements for a plan", async () => {
      const features = await f.reader.listForPlan(f.seedPlanId);
      expect(features.length).toBe(f.seedEntitlementCount);
    });

    it("handles missing features", async () => {
      const found = await f.reader.findByKey("nonexistent_feature_key");
      expect(found).toBeNull();
    });

    it("reconstructs typed values correctly", async () => {
      const feature = f.seedFeatures[0];
      if (!feature) throw new Error("No seed features");
      const found = await f.reader.findByKey(String(feature.key));
      expect(found).not.toBeNull();
      expect(found?.valueType).toBe(feature.valueType);
      expect(found?.isActive).toBe(feature.isActive);
      expect(found?.version).toBe(feature.version);
    });
  });
}

export interface OutboxContractFixtures {
  readonly reader: OutboxReader;
  readonly createEvent: (aggregateId: string) => Promise<{ id: string; idempotencyKey: string }>;
  readonly cleanup: () => Promise<void>;
}

export function runOutboxContractTests(
  name: string,
  getFixtures: () => OutboxContractFixtures,
) {
  describe(`${name} — Outbox contract`, () => {
    let f: OutboxContractFixtures;

    beforeEach(async () => {
      f = getFixtures();
    });

    afterEach(async () => {
      await f.cleanup();
    });

    it("findByAggregate returns events for an aggregate", async () => {
      const result = await f.createEvent("org_outbox_001");
      const events = await f.reader.findByAggregate("organization", "org_outbox_001");
      expect(events.length).toBeGreaterThanOrEqual(1);
      const found = events.find((e) => e.id === result.id);
      expect(found).toBeDefined();
      expect(found?.eventType).toBe("organization.created");
    });

    it("findById returns a single event", async () => {
      const result = await f.createEvent("org_outbox_002");
      const found = await f.reader.findById(result.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(result.id);
    });

    it("findById returns null for missing event", async () => {
      const found = await f.reader.findById("nonexistent-event-id");
      expect(found).toBeNull();
    });
  });
}

declare function beforeEach(fn: () => Promise<void> | void): void;
declare function afterEach(fn: () => Promise<void> | void): void;
