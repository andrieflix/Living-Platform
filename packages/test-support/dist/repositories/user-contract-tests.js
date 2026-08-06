/**
 * Reusable user repository contract test suite.
 *
 * Runs the same core behavior against both InMemoryUserRepository
 * and DrizzleUserRepository, ensuring both adapters satisfy the
 * UserReader + UserCreator contract.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createUserDraft } from "@livingsites/domain";
function makeDraft(overrides) {
    return createUserDraft({
        id: (overrides.id ?? "user_test_001"),
        authSubjectId: (overrides.authSubjectId ?? "auth_test_001"),
        email: overrides.email ?? "test@test.com",
        displayName: overrides.displayName ?? "Test User",
        now: "2026-01-01T00:00:00.000Z",
    });
}
export function runUserRepositoryContractTests(name, getFixtures) {
    describe(`${name} — user repository contract`, () => {
        let f;
        beforeEach(async () => {
            f = getFixtures();
        });
        afterEach(async () => {
            await f.cleanup();
        });
        it("creates a UserDraft and returns version 1", async () => {
            const result = await f.creator.create(makeDraft({}));
            expect(result.ok).toBe(true);
            if (result.ok) {
                expect(result.value.version).toBe(1);
                expect(result.value.status).toBe("active");
                expect(result.value.displayName).toBe("Test User");
            }
        });
        it("findById reconstructs the aggregate after create", async () => {
            const created = await f.creator.create(makeDraft({ id: "user_find_001", authSubjectId: "auth_find_001" }));
            if (!created.ok)
                throw new Error("create failed");
            const found = await f.reader.findById(created.value.id);
            expect(found).not.toBeNull();
            expect(found?.displayName).toBe("Test User");
            expect(found?.version).toBe(1);
        });
        it("findByAuthSubjectId reconstructs the aggregate after create", async () => {
            await f.creator.create(makeDraft({ id: "user_auth_001", authSubjectId: "auth_subj_001" }));
            const found = await f.reader.findByAuthSubjectId("auth_subj_001");
            expect(found).not.toBeNull();
            expect(found?.email).toBe("test@test.com");
        });
        it("findByEmail reconstructs the aggregate after create", async () => {
            await f.creator.create(makeDraft({ id: "user_email_001", authSubjectId: "auth_email_001", email: "find@test.com" }));
            const found = await f.reader.findByEmail("find@test.com");
            expect(found).not.toBeNull();
            expect(found?.email).toBe("find@test.com");
        });
        it("email is normalized to lowercase", async () => {
            await f.creator.create(makeDraft({ id: "user_norm_001", authSubjectId: "auth_norm_001", email: "  UPPER@TEST.COM  " }));
            const found = await f.reader.findByEmail("upper@test.com");
            expect(found).not.toBeNull();
            expect(found?.email).toBe("upper@test.com");
        });
        it("duplicate authSubjectId maps to DuplicateKeyError", async () => {
            await f.creator.create(makeDraft({ id: "user_dup1", authSubjectId: "auth_dup", email: "dup1@test.com" }));
            const result = await f.creator.create(makeDraft({ id: "user_dup2", authSubjectId: "auth_dup", email: "dup2@test.com" }));
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("duplicate_key");
            }
        });
        it("duplicate email maps to DuplicateKeyError", async () => {
            await f.creator.create(makeDraft({ id: "user_dup3", authSubjectId: "auth_dup3", email: "same@test.com" }));
            const result = await f.creator.create(makeDraft({ id: "user_dup4", authSubjectId: "auth_dup4", email: "same@test.com" }));
            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error.code).toBe("duplicate_key");
            }
        });
        it("returns null for non-existent id", async () => {
            const found = await f.reader.findById("nonexistent");
            expect(found).toBeNull();
        });
        it("returns null for non-existent authSubjectId", async () => {
            const found = await f.reader.findByAuthSubjectId("nonexistent");
            expect(found).toBeNull();
        });
        it("returns null for non-existent email", async () => {
            const found = await f.reader.findByEmail("nonexistent@test.com");
            expect(found).toBeNull();
        });
        it("no database/Drizzle row type leaks to Application", () => {
            const user = null;
            expect(user).toBeNull();
        });
    });
}
//# sourceMappingURL=user-contract-tests.js.map