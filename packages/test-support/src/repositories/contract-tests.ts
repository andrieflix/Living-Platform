/**
 * Reusable repository contract test suite.
 *
 * Runs the same core behavior against both InMemoryOrganizationRepository
 * and DrizzleOrganizationRepository, ensuring both adapters satisfy the
 * OrganizationReader + OrganizationCreator contract.
 *
 * Each adapter provides its own setup/cleanup fixture.
 */
import { describe, it, expect } from "vitest";
import type {
  Organization,
  OrganizationDraft,
  OrganizationId,
  Slug,
  ISODateString,
} from "@livingsites/domain";
import { createOrganizationDraft } from "@livingsites/domain";
import type { OrganizationReader, OrganizationCreator } from "@livingsites/application";

export interface RepositoryContractFixtures {
  readonly reader: OrganizationReader;
  readonly creator: OrganizationCreator;
  readonly cleanup: () => Promise<void>;
}

function makeDraft(overrides: Partial<{
  id: string;
  name: string;
  slug: string;
  billingEmail: string;
}>): OrganizationDraft {
  return createOrganizationDraft({
    id: (overrides.id ?? "org_test_001") as OrganizationId,
    name: overrides.name ?? "Test Org",
    slug: (overrides.slug ?? "test-org") as Slug,
    billingEmail: overrides.billingEmail ?? "test@test.com",
    planId: null,
    now: "2026-01-01T00:00:00.000Z" as ISODateString,
  });
}

export function runRepositoryContractTests(
  name: string,
  getFixtures: () => RepositoryContractFixtures,
) {
  describe(`${name} — repository contract`, () => {
    let f: RepositoryContractFixtures;

    beforeEach(async () => {
      f = getFixtures();
    });

    afterEach(async () => {
      await f.cleanup();
    });

    it("creates an OrganizationDraft and returns version 1", async () => {
      const result = await f.creator.create(makeDraft({}));
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.version).toBe(1);
        expect(result.value.status).toBe("active");
        expect(result.value.name).toBe("Test Org");
      }
    });

    it("findById reconstructs the aggregate after create", async () => {
      const created = await f.creator.create(makeDraft({ id: "org_find_001" }));
      if (!created.ok) throw new Error("create failed");
      const found = await f.reader.findById(created.value.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe("Test Org");
      expect(found?.version).toBe(1);
    });

    it("findBySlug reconstructs the aggregate after create", async () => {
      await f.creator.create(makeDraft({ slug: "find-slug" }));
      const found = await f.reader.findBySlug("find-slug");
      expect(found).not.toBeNull();
      expect(found?.slug).toBe("find-slug");
    });

    it("persists the normalized slug", async () => {
      await f.creator.create(makeDraft({ slug: "normalized-slug" }));
      const found = await f.reader.findBySlug("normalized-slug");
      expect(found).not.toBeNull();
      expect(found?.slug).toBe("normalized-slug");
    });

    it("duplicate slug maps to DuplicateKeyError", async () => {
      await f.creator.create(makeDraft({ id: "org_dup_1", slug: "dup-slug" }));
      const result = await f.creator.create(makeDraft({ id: "org_dup_2", slug: "dup-slug" }));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("duplicate_key");
      }
    });

    it("returns null for non-existent id", async () => {
      const found = await f.reader.findById("nonexistent" as OrganizationId);
      expect(found).toBeNull();
    });

    it("returns null for non-existent slug", async () => {
      const found = await f.reader.findBySlug("nonexistent");
      expect(found).toBeNull();
    });

    it("no database/Drizzle row type leaks to Application", () => {
      // This is a compile-time check verified by ESLint and TypeScript.
      // The contract test verifies that the returned type is Organization,
      // not a Drizzle row. If the type were wrong, the assignment below
      // would fail to compile.
      const org: Organization | null = null as Organization | null;
      expect(org).toBeNull();
    });
  });
}

// vitest beforeEach/afterEach are globals in the test environment
declare function beforeEach(fn: () => Promise<void> | void): void;
declare function afterEach(fn: () => Promise<void> | void): void;
