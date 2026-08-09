/**
 * Orphan identity recovery test.
 *
 * Tests the scenario where a Better Auth identity is created but Platform User
 * creation is interrupted. The linkage reconciler should detect the pending
 * linkage and create the Platform User on retry.
 *
 * Also tests idempotency: running the reconciler multiple times on the same
 * pending linkage produces the same result.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { NoopLogger } from "@livingsites/platform";
import { DrizzleUserRepository } from "../user/drizzle-user-repository";
import { LinkageReconciler } from "./linkage-reconciler";
import { identityLinkages } from "../../db/identity-linkage-schema";
import { platformUsers } from "../../db/schema";
import * as schema from "../../db/schema";
import { SystemClock, CryptoIdGenerator } from "@livingsites/platform";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const shouldSkip = !TEST_DATABASE_URL;
const describeOrSkip = shouldSkip ? describe.skip : describe;

describeOrSkip("LinkageReconciler — orphan identity recovery", () => {
  let sql: ReturnType<typeof postgres>;
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let userRepo: DrizzleUserRepository;
  let reconciler: LinkageReconciler;

  beforeAll(async () => {
    sql = postgres(TEST_DATABASE_URL!);
    db = drizzle({ client: sql, schema });
    await migrate(db, { migrationsFolder: "./netlify/database/migrations" });
    userRepo = new DrizzleUserRepository({ db, logger: new NoopLogger() });
    reconciler = new LinkageReconciler({
      db,
      logger: new NoopLogger(),
      userCreator: userRepo,
      idGenerator: new CryptoIdGenerator(),
      clock: new SystemClock(),
    });
  });

  afterAll(async () => {
    if (sql) await sql.end();
  });

  beforeEach(async () => {
    await db.delete(platformUsers);
    await db.delete(identityLinkages);
  });

  it("creates a pending linkage, then reconciles it to linked", async () => {
    await db.insert(identityLinkages).values({
      id: "linkage_001",
      auth_subject_id: "auth_orphan_001",
      email: "orphan1@example.com",
      display_name: "Orphan One",
      status: "pending",
      attempts: 0,
      max_attempts: 5,
      next_attempt_at: new Date(0),
    });

    const result = await reconciler.reconcile();

    expect(result.processed).toBe(1);
    expect(result.linked).toBe(1);

    const linkages = await db.select().from(identityLinkages);
    expect(linkages[0]!.status).toBe("linked");
    expect(linkages[0]!.platform_user_id).toBeTruthy();

    const users = await db.select().from(platformUsers);
    expect(users.length).toBe(1);
    expect(users[0]!.email).toBe("orphan1@example.com");
  });

  it("is idempotent: reconciling twice does not create duplicate users", async () => {
    await db.insert(identityLinkages).values({
      id: "linkage_002",
      auth_subject_id: "auth_orphan_002",
      email: "orphan2@example.com",
      display_name: "Orphan Two",
      status: "pending",
      attempts: 0,
      max_attempts: 5,
      next_attempt_at: new Date(0),
    });

    await reconciler.reconcile();
    const result = await reconciler.reconcile();

    expect(result.processed).toBe(0);

    const users = await db.select().from(platformUsers);
    expect(users.length).toBe(1);
  });

  it("marks linkage as failed after max attempts", async () => {
    await db.insert(identityLinkages).values({
      id: "linkage_003",
      auth_subject_id: "auth_orphan_003",
      email: "orphan3@example.com",
      display_name: "Orphan Three",
      status: "pending",
      attempts: 5,
      max_attempts: 5,
      next_attempt_at: new Date(0),
    });

    const result = await reconciler.reconcile();

    expect(result.processed).toBe(1);
    expect(result.failed).toBe(1);

    const linkages = await db.select().from(identityLinkages);
    expect(linkages[0]!.status).toBe("failed");
  });

  it("skips linkages not yet due for retry", async () => {
    await db.insert(identityLinkages).values({
      id: "linkage_004",
      auth_subject_id: "auth_orphan_004",
      email: "orphan4@example.com",
      display_name: "Orphan Four",
      status: "pending",
      attempts: 0,
      max_attempts: 5,
      next_attempt_at: new Date(Date.now() + 60000),
    });

    const result = await reconciler.reconcile();

    expect(result.processed).toBe(0);
  });
});

if (shouldSkip) {
  describe.skip("LinkageReconciler — orphan identity recovery (SKIPPED)", () => {
    it("skipped — TEST_DATABASE_URL not set", () => {});
  });
}
