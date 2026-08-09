import { describe, it, expect, beforeEach } from "vitest";
import { composeTest } from "./test";
import { composeDevelopment } from "./development";
import { composeProduction } from "./production";
function makePlan(overrides = {}) {
    return {
        id: "plan_starter",
        tier: "starter",
        name: "Starter",
        priceMonthly: 0,
        priceAnnual: 0,
        currency: "usd",
        features: [],
        maxWebsites: 1,
        maxMembers: 3,
        customDomainsAllowed: false,
        isActive: true,
        version: 1,
        audit: { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
        ...overrides,
    };
}
describe("createOrganization use case (via composeTest)", () => {
    let comp;
    beforeEach(() => {
        comp = composeTest({ initialClockMs: 1700000000000 });
    });
    it("creates an organization with valid input", async () => {
        const result = await comp.createOrganization({ name: "Tajon Construction", slug: "tajon-construction", billingEmail: "billing@tajon.com" }, comp.createOrganizationDeps);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value.organization.name).toBe("Tajon Construction");
            expect(result.value.organization.slug).toBe("tajon-construction");
            expect(result.value.organization.status).toBe("active");
            expect(result.value.organization.version).toBe(1);
        }
    });
    it("returns version 1 after creation", async () => {
        const result = await comp.createOrganization({ name: "Acme Corp", slug: "acme-corp", billingEmail: "billing@acme.com" }, comp.createOrganizationDeps);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value.organization.version).toBe(1);
        }
    });
    it("fails for empty name", async () => {
        const result = await comp.createOrganization({ name: "", slug: "acme-corp", billingEmail: "billing@acme.com" }, comp.createOrganizationDeps);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("input_validation");
        }
    });
    it("fails for invalid slug", async () => {
        const result = await comp.createOrganization({ name: "Acme", slug: "INVALID SLUG!", billingEmail: "billing@acme.com" }, comp.createOrganizationDeps);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("input_validation");
        }
    });
    it("fails for invalid email", async () => {
        const result = await comp.createOrganization({ name: "Acme", slug: "acme-corp", billingEmail: "not-email" }, comp.createOrganizationDeps);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("input_validation");
        }
    });
    it("fails for duplicate slug", async () => {
        await comp.createOrganization({ name: "First Org", slug: "dup-slug", billingEmail: "a@a.com" }, comp.createOrganizationDeps);
        const result = await comp.createOrganization({ name: "Second Org", slug: "dup-slug", billingEmail: "b@b.com" }, comp.createOrganizationDeps);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("duplicate_slug");
        }
    });
    it("fails for inactive plan", async () => {
        const plan = makePlan({ isActive: false });
        comp.planRepository.add(plan);
        const result = await comp.createOrganization({ name: "Acme", slug: "acme-corp", billingEmail: "billing@acme.com", planId: plan.id }, comp.createOrganizationDeps);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("policy_denial");
        }
    });
    it("fails for non-existent plan", async () => {
        const result = await comp.createOrganization({ name: "Acme", slug: "acme-corp", billingEmail: "billing@acme.com", planId: "plan_nonexistent" }, comp.createOrganizationDeps);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("plan_not_available");
        }
    });
    it("denies reserved slug", async () => {
        const result = await comp.createOrganization({ name: "Admin Org", slug: "admin", billingEmail: "admin@test.com" }, comp.createOrganizationDeps);
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("policy_denial");
        }
    });
    it("emits OrganizationCreated event on success", async () => {
        const result = await comp.createOrganization({ name: "Event Org", slug: "event-org", billingEmail: "event@test.com" }, comp.createOrganizationDeps);
        expect(result.ok).toBe(true);
        expect(comp.eventPublisher.count).toBe(1);
        if (comp.eventPublisher.published.length > 0) {
            const event = comp.eventPublisher.published[0];
            expect(event.type).toBe("organization.created");
        }
    });
    it("emits no event on validation failure", async () => {
        await comp.createOrganization({ name: "", slug: "event-org", billingEmail: "event@test.com" }, comp.createOrganizationDeps);
        expect(comp.eventPublisher.count).toBe(0);
    });
    it("emits no event on policy denial", async () => {
        await comp.createOrganization({ name: "Admin", slug: "admin", billingEmail: "a@a.com" }, comp.createOrganizationDeps);
        expect(comp.eventPublisher.count).toBe(0);
    });
    it("emits no event on duplicate slug", async () => {
        await comp.createOrganization({ name: "First", slug: "dup", billingEmail: "a@a.com" }, comp.createOrganizationDeps);
        comp.eventPublisher.clear();
        await comp.createOrganization({ name: "Second", slug: "dup", billingEmail: "b@b.com" }, comp.createOrganizationDeps);
        expect(comp.eventPublisher.count).toBe(0);
    });
    it("uses injected Clock for timestamps", async () => {
        comp.clock.set(1700000000000);
        const result = await comp.createOrganization({ name: "Clock Test", slug: "clock-test", billingEmail: "c@c.com" }, comp.createOrganizationDeps);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value.organization.audit.createdAt).toBe("2023-11-14T22:13:20.000Z");
        }
    });
    it("uses injected IdGenerator for ID generation", async () => {
        const result = await comp.createOrganization({ name: "ID Test", slug: "id-test", billingEmail: "i@i.com" }, comp.createOrganizationDeps);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(String(result.value.organization.id)).toMatch(/^org_\d+$/);
        }
    });
});
describe("composeDevelopment", () => {
    it("is clearly distinct from production composition", () => {
        const dev = composeDevelopment();
        expect(dev.organizationRepository.constructor.name).toBe("InMemoryOrganizationRepository");
        expect(dev.eventPublisher.constructor.name).toBe("NoopEventPublisher");
    });
    it("uses deterministic clock", () => {
        const dev = composeDevelopment({ initialClockMs: 1000 });
        expect(dev.clock.nowMs()).toBe(1000);
    });
});
describe("composeProduction — missing database failure", () => {
    it("fails fast when Netlify Database is unavailable", () => {
        expect(() => composeProduction({
            connectionString: "postgresql://invalid:invalid@invalid:99999/invalid",
            betterAuthSecret: "test-secret-at-least-32-characters-long-xxxxx",
            betterAuthUrl: "https://example.com",
            trustedOrigins: ["https://example.com"],
        })).toThrow();
    });
});
//# sourceMappingURL=create-organization.test.js.map