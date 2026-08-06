/**
 * Database integration test suite for DrizzleOrganizationRepository.
 *
 * Uses TEST_DATABASE_URL environment variable.
 * - When TEST_DATABASE_URL is absent, all tests are skipped with a visible reason.
 * - When present, migrations are applied and tests run against the test database.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import type {
  OrganizationDraft,
  OrganizationId,
  Slug,
  ISODateString,
} from "@livingsites/domain";
import { createOrganizationDraft } from "@livingsites/domain";
import { NoopLogger } from "@livingsites/platform";
import { DrizzleOrganizationRepository } from "./drizzle-organization-repository";
import { organizations } from "../../db/schema";
import * as schema from "../../db/schema";
import { runRepositoryContractTests } from "@livingsites/test-support";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const shouldSkip = !TEST_DATABASE_URL;

const skipReason = "TEST_DATABASE_URL is not set. Set it to a test PostgreSQL connection string to run database integration tests.";

const describeOrSkip = shouldSkip ? describe.skip : describe;

function makeDraft(overrides: Partial<{
  id: string;
  name: string;
  slug: string;
  billingEmail: string;
}>): OrganizationDraft {
  return createOrganizationDraft({
    id: (overrides.id ?? `org_test_${Date.now()}`) as OrganizationId,
    name: overrides.name ?? "Integration Test Org",
    slug: (overrides.slug ?? `integration-test-${Date.now()}`) as Slug,
    billingEmail: overrides.billingEmail ?? "integration@test.com",
    planId: null,
    now: "2026-01-01T00:00:00.000Z" as ISODateString,
  });
}

describeOrSkip("DrizzleOrganizationRepository — database integration", () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let sql: ReturnType<typeof postgres>;
  let repo: DrizzleOrganizationRepository;

  beforeAll(async () => {
    sql = postgres(TEST_DATABASE_URL!);
    db = drizzle({ client: sql, schema });
    await migrate(db, { migrationsFolder: "./netlify/database/migrations" });
    repo = new DrizzleOrganizationRepository({ db, logger: new NoopLogger() });
  });

  afterAll(async () => {
    if (sql) await sql.end();
  });

  beforeEach(async () => {
    await db.delete(organizations);
  });

  runRepositoryContractTests(
    "DrizzleOrganizationRepository",
    () => ({
      reader: repo,
      creator: repo,
      cleanup: async () => {
        await db.delete(organizations);
      },
    }),
  );

  it("migration applies successfully (table exists)", async () => {
    const rows = await db.select().from(organizations);
    expect(Array.isArray(rows)).toBe(true);
  });

  it("raw database exceptions do not escape create", async () => {
    const draft = makeDraft({ slug: "exception-test" });
    await repo.create(draft);
    const result = await repo.create(draft);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(typeof result.error.code).toBe("string");
    }
  });

  it("mapper rejects an invalid persisted version", async () => {
    const id = "org_invalid_version";
    await db.insert(organizations).values({
      id,
      name: "Invalid Version",
      slug: "invalid-version",
      billing_email: "invalid@test.com",
      plan_id: null,
      status: "active",
      feature_overrides: "[]",
      version: 0,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: null,
      updated_by: null,
      deleted_at: null,
    });

    const found = await repo.findById(id as OrganizationId);
    expect(found).toBeNull();
  });

  it("mapper rejects malformed feature_overrides JSON", async () => {
    const id = "org_malformed_json";
    await db.insert(organizations).values({
      id,
      name: "Malformed JSON",
      slug: "malformed-json",
      billing_email: "malformed@test.com",
      plan_id: null,
      status: "active",
      feature_overrides: "not valid json{{{",
      version: 1,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: null,
      updated_by: null,
      deleted_at: null,
    });

    const found = await repo.findById(id as OrganizationId);
    expect(found).toBeNull();
  });
});

if (shouldSkip) {
  describe.skip("DrizzleOrganizationRepository — database integration (SKIPPED)", () => {
    it(`skipped — ${skipReason}`, () => {});
  });
}
