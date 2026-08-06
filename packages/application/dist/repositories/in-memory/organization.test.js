import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryOrganizationRepository } from "../in-memory/organization";
import { createOrganizationCandidate } from "@livingsites/domain";
function makeCandidate(overrides = {}) {
    const base = createOrganizationCandidate({ name: "Test Org", slug: "test-org", billingEmail: "test@test.com" }, { nowIso: () => "2026-01-01T00:00:00.000Z", nowMs: () => 0 }, { generate: () => "uuid-1", generatePrefixed: (p) => `${p}_uuid-1` });
    return { ...base, ...overrides };
}
describe("InMemoryOrganizationRepository", () => {
    let repo;
    beforeEach(() => {
        repo = new InMemoryOrganizationRepository();
    });
    it("creates an organization and returns version 1", async () => {
        const result = await repo.create(makeCandidate());
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value.version).toBe(1);
            expect(result.value.status).toBe("active");
        }
    });
    it("enforces globally unique slug", async () => {
        await repo.create(makeCandidate({ slug: "dup-slug" }));
        const result = await repo.create(makeCandidate({ slug: "dup-slug" }));
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("duplicate_key");
            if (result.error.code === "duplicate_key") {
                expect(result.error.field).toBe("slug");
            }
        }
    });
    it("finds by id after create", async () => {
        const created = await repo.create(makeCandidate());
        if (!created.ok)
            throw new Error("create failed");
        const found = await repo.findById(created.value.id);
        expect(found).not.toBeNull();
        expect(found?.name).toBe("Test Org");
    });
    it("finds by slug after create", async () => {
        await repo.create(makeCandidate({ slug: "find-slug" }));
        const found = await repo.findBySlug("find-slug");
        expect(found).not.toBeNull();
        expect(found?.slug).toBe("find-slug");
    });
    it("returns null for non-existent id", async () => {
        const found = await repo.findById("nonexistent");
        expect(found).toBeNull();
    });
    it("returns null for non-existent slug", async () => {
        const found = await repo.findBySlug("nonexistent");
        expect(found).toBeNull();
    });
    it("returns isolated values (mutating returned org does not affect store)", async () => {
        const created = await repo.create(makeCandidate());
        if (!created.ok)
            throw new Error("create failed");
        const found = await repo.findById(created.value.id);
        if (!found)
            throw new Error("findById failed");
        found.name = "Modified";
        const refound = await repo.findById(created.value.id);
        expect(refound?.name).toBe("Test Org");
    });
});
//# sourceMappingURL=organization.test.js.map