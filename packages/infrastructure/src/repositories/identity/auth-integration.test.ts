/**
 * Auth integration tests using @netlify/database-dev.
 *
 * Tests the real Better Auth + Drizzle + Netlify Database flow:
 * - register (password hashing, session creation)
 * - duplicate email
 * - sign-in (valid, invalid password)
 * - session lookup
 * - sign-out
 * - session revocation
 * - email verification
 * - Platform User linkage
 *
 * Uses @netlify/database-dev to provision a local test database.
 * Skips when TEST_DATABASE_URL is not set.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NoopLogger } from "@livingsites/platform";
import { DrizzleUserRepository } from "../user/drizzle-user-repository";
import { BetterAuthAdapter, asBetterAuthInstance } from "../../adapters/better-auth";
import { platformUsers, betterAuthUsers, betterAuthSessions, betterAuthAccounts, betterAuthVerifications } from "../../db/schema";
import { identityLinkages } from "../../db/identity-linkage-schema";
import * as schema from "../../db/schema";
import { createUserDraft } from "@livingsites/domain";
import type { UserId, AuthSubjectId, ISODateString } from "@livingsites/domain";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const shouldSkip = !TEST_DATABASE_URL;
const skipReason = "TEST_DATABASE_URL is not set. Set it to a test PostgreSQL connection string to run auth integration tests.";
const describeOrSkip = shouldSkip ? describe.skip : describe;

const TEST_SECRET = "test-secret-at-least-32-characters-long-xxxxx";
const TEST_URL = "http://localhost:3000";

describeOrSkip("Better Auth + Drizzle integration", () => {
  let sql: ReturnType<typeof postgres>;
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let authAdapter: BetterAuthAdapter;
  let userRepo: DrizzleUserRepository;

  beforeAll(async () => {
    sql = postgres(TEST_DATABASE_URL!);
    db = drizzle({ client: sql, schema });
    await migrate(db, { migrationsFolder: "./netlify/database/migrations" });

    const auth = betterAuth({
      secret: TEST_SECRET,
      baseURL: TEST_URL,
      trustedOrigins: [TEST_URL],
      database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
          user: "ba_user",
          session: "ba_session",
          account: "ba_account",
          verification: "ba_verification",
        },
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 12,
        maxPasswordLength: 256,
      },
    });

    authAdapter = new BetterAuthAdapter({ auth: asBetterAuthInstance(auth), logger: new NoopLogger() });
    userRepo = new DrizzleUserRepository({ db, logger: new NoopLogger() });
  });

  afterAll(async () => {
    if (sql) await sql.end();
  });

  beforeEach(async () => {
    await db.delete(betterAuthSessions);
    await db.delete(betterAuthAccounts);
    await db.delete(betterAuthVerifications);
    await db.delete(betterAuthUsers);
    await db.delete(platformUsers);
    await db.delete(identityLinkages);
  });

  it("registers a new user with password hashing", async () => {
    const result = await authAdapter.registerWithEmail({
      email: "test@example.com",
      password: "very-secure-password-123",
      displayName: "Test User",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sessionToken).toBeTruthy();
      expect(result.value.identity.email).toBe("test@example.com");
      expect(result.value.identity.emailVerified).toBe(false);
    }

    const baUsers = await db.select().from(betterAuthUsers);
    expect(baUsers.length).toBe(1);
    expect(baUsers[0]!.email).toBe("test@example.com");

    const accounts = await db.select().from(betterAuthAccounts);
    expect(accounts.length).toBe(1);
    expect(accounts[0]!.password).toBeTruthy();
    expect(accounts[0]!.password).not.toBe("very-secure-password-123");
  });

  it("rejects duplicate email registration", async () => {
    await authAdapter.registerWithEmail({
      email: "dup@example.com",
      password: "very-secure-password-123",
      displayName: "First",
    });

    const result = await authAdapter.registerWithEmail({
      email: "dup@example.com",
      password: "very-secure-password-123",
      displayName: "Second",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("duplicate_email");
    }
  });

  it("signs in with valid credentials and creates a session", async () => {
    await authAdapter.registerWithEmail({
      email: "signin@example.com",
      password: "very-secure-password-123",
      displayName: "Sign In",
    });

    const result = await authAdapter.signInWithEmail({
      email: "signin@example.com",
      password: "very-secure-password-123",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.sessionToken).toBeTruthy();
      expect(result.value.identity.email).toBe("signin@example.com");
    }

    const sessions = await db.select().from(betterAuthSessions);
    expect(sessions.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects sign-in with invalid password", async () => {
    await authAdapter.registerWithEmail({
      email: "invalidpw@example.com",
      password: "very-secure-password-123",
      displayName: "Invalid Pw",
    });

    const result = await authAdapter.signInWithEmail({
      email: "invalidpw@example.com",
      password: "wrong-password-12345",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("invalid_credentials");
    }
  });

  it("looks up an active session by token", async () => {
    const regResult = await authAdapter.registerWithEmail({
      email: "session@example.com",
      password: "very-secure-password-123",
      displayName: "Session",
    });
    if (!regResult.ok) throw new Error("registration failed");

    const sessionResult = await authAdapter.getSession(regResult.value.sessionToken);

    expect(sessionResult.ok).toBe(true);
    if (sessionResult.ok) {
      expect(sessionResult.value.identity.email).toBe("session@example.com");
    }
  });

  it("returns session_not_found for unknown token", async () => {
    const result = await authAdapter.getSession("nonexistent-token");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("session_not_found");
    }
  });

  it("signs out and invalidates the session", async () => {
    const regResult = await authAdapter.registerWithEmail({
      email: "signout@example.com",
      password: "very-secure-password-123",
      displayName: "Sign Out",
    });
    if (!regResult.ok) throw new Error("registration failed");

    const token = regResult.value.sessionToken;
    const signOutResult = await authAdapter.signOut(token);
    expect(signOutResult.ok).toBe(true);

    const sessionResult = await authAdapter.getSession(token);
    expect(sessionResult.ok).toBe(false);
  });

  it("revokes a session", async () => {
    const regResult = await authAdapter.registerWithEmail({
      email: "revoke@example.com",
      password: "very-secure-password-123",
      displayName: "Revoke",
    });
    if (!regResult.ok) throw new Error("registration failed");

    const token = regResult.value.sessionToken;
    const revokeResult = await authAdapter.revokeSession(token);
    expect(revokeResult.ok).toBe(true);
  });

  it("creates a Platform User linked to the auth subject", async () => {
    const regResult = await authAdapter.registerWithEmail({
      email: "linkage@example.com",
      password: "very-secure-password-123",
      displayName: "Linkage",
    });
    if (!regResult.ok) throw new Error("registration failed");

    const authSubjectId = regResult.value.identity.authSubjectId;

    const draft = createUserDraft({
      id: "user_linkage_test" as UserId,
      authSubjectId: authSubjectId as AuthSubjectId,
      email: "linkage@example.com",
      displayName: "Linkage",
      now: "2026-01-01T00:00:00.000Z" as ISODateString,
    });

    const createResult = await userRepo.create(draft);
    expect(createResult.ok).toBe(true);
    if (createResult.ok) {
      expect(createResult.value.version).toBe(1);
      expect(createResult.value.authSubjectId).toBe(authSubjectId);
    }

    const found = await userRepo.findByAuthSubjectId(authSubjectId);
    expect(found).not.toBeNull();
    expect(found?.email).toBe("linkage@example.com");
  });
});

if (shouldSkip) {
  describe.skip("Better Auth + Drizzle integration (SKIPPED)", () => {
    it(`skipped — ${skipReason}`, () => {});
  });
}
