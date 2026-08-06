import { describe, it, expect } from "vitest";
import { validateCreateOrganizationInput } from "./validator";
function makeInput(overrides = {}) {
    return {
        name: "Tajon Construction",
        slug: "tajon-construction",
        billingEmail: "billing@tajon.com",
        ...overrides,
    };
}
describe("validateCreateOrganizationInput", () => {
    it("succeeds for valid input", () => {
        const result = validateCreateOrganizationInput(makeInput());
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.normalized.name).toBe("Tajon Construction");
            expect(result.normalized.slug).toBe("tajon-construction");
            expect(result.normalized.billingEmail).toBe("billing@tajon.com");
        }
    });
    it("normalizes slug to lowercase", () => {
        const result = validateCreateOrganizationInput(makeInput({ slug: "Tajon-Construction" }));
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.normalized.slug).toBe("tajon-construction");
        }
    });
    it("normalizes email to lowercase", () => {
        const result = validateCreateOrganizationInput(makeInput({ billingEmail: "Billing@Tajon.com" }));
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.normalized.billingEmail).toBe("billing@tajon.com");
        }
    });
    it("trims whitespace from name", () => {
        const result = validateCreateOrganizationInput(makeInput({ name: "  Tajon  " }));
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.normalized.name).toBe("Tajon");
        }
    });
    it("fails for empty name", () => {
        const result = validateCreateOrganizationInput(makeInput({ name: "" }));
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.field).toBe("name");
        }
    });
    it("fails for name exceeding 200 characters", () => {
        const result = validateCreateOrganizationInput(makeInput({ name: "a".repeat(201) }));
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.field).toBe("name");
        }
    });
    it("fails for slug too short", () => {
        const result = validateCreateOrganizationInput(makeInput({ slug: "a" }));
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.field).toBe("slug");
        }
    });
    it("fails for slug with special characters", () => {
        const result = validateCreateOrganizationInput(makeInput({ slug: "tajon_construction" }));
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.field).toBe("slug");
        }
    });
    it("fails for slug with double dashes", () => {
        const result = validateCreateOrganizationInput(makeInput({ slug: "tajon--construction" }));
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.field).toBe("slug");
        }
    });
    it("fails for slug with trailing dash", () => {
        const result = validateCreateOrganizationInput(makeInput({ slug: "tajon-" }));
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.field).toBe("slug");
        }
    });
    it("fails for slug with leading dash", () => {
        const result = validateCreateOrganizationInput(makeInput({ slug: "-tajon" }));
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.field).toBe("slug");
        }
    });
    it("fails for invalid email", () => {
        const result = validateCreateOrganizationInput(makeInput({ billingEmail: "not-an-email" }));
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.field).toBe("billingEmail");
        }
    });
    it("fails for email without domain", () => {
        const result = validateCreateOrganizationInput(makeInput({ billingEmail: "billing@" }));
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.field).toBe("billingEmail");
        }
    });
});
//# sourceMappingURL=validator.test.js.map