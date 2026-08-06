import { describe, it, expect } from "vitest";
import { createOrganizationDraft } from "./factory";
import { DRAFT_VERSION } from "./draft";
import type { OrganizationDraft } from "./draft";

describe("createOrganizationDraft (pure Domain factory)", () => {
  it("creates a draft with version 0 (DRAFT_VERSION)", () => {
    const draft = createOrganizationDraft({
      id: "org_001" as any,
      name: "Tajon Construction",
      slug: "tajon-construction" as any,
      billingEmail: "billing@tajon.com",
      planId: null,
      now: "2026-01-01T00:00:00.000Z" as any,
    });
    expect(draft.version).toBe(0);
    expect(draft.version).toBe(DRAFT_VERSION);
  });

  it("creates with active status", () => {
    const draft = createOrganizationDraft({
      id: "org_001" as any,
      name: "Tajon",
      slug: "tajon" as any,
      billingEmail: "billing@tajon.com",
      planId: null,
      now: "2026-01-01T00:00:00.000Z" as any,
    });
    expect(draft.status).toBe("active");
  });

  it("creates with empty feature overrides", () => {
    const draft = createOrganizationDraft({
      id: "org_001" as any,
      name: "Tajon",
      slug: "tajon" as any,
      billingEmail: "billing@tajon.com",
      planId: null,
      now: "2026-01-01T00:00:00.000Z" as any,
    });
    expect(draft.featureOverrides).toEqual([]);
  });

  it("creates with audit metadata from provided timestamp", () => {
    const draft = createOrganizationDraft({
      id: "org_001" as any,
      name: "Tajon",
      slug: "tajon" as any,
      billingEmail: "billing@tajon.com",
      planId: null,
      now: "2026-01-01T00:00:00.000Z" as any,
    });
    expect(draft.audit.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(draft.audit.updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("creates with provided planId when supplied", () => {
    const draft = createOrganizationDraft({
      id: "org_001" as any,
      name: "Tajon",
      slug: "tajon" as any,
      billingEmail: "billing@tajon.com",
      planId: "plan_starter" as any,
      now: "2026-01-01T00:00:00.000Z" as any,
    });
    expect(draft.planId).toBe("plan_starter");
  });

  it("creates with null planId when not supplied", () => {
    const draft = createOrganizationDraft({
      id: "org_001" as any,
      name: "Tajon",
      slug: "tajon" as any,
      billingEmail: "billing@tajon.com",
      planId: null,
      now: "2026-01-01T00:00:00.000Z" as any,
    });
    expect(draft.planId).toBeNull();
  });

  it("is a pure function with no I/O dependencies", () => {
    const draft1 = createOrganizationDraft({
      id: "org_001" as any,
      name: "Tajon",
      slug: "tajon" as any,
      billingEmail: "billing@tajon.com",
      planId: null,
      now: "2026-01-01T00:00:00.000Z" as any,
    });
    const draft2 = createOrganizationDraft({
      id: "org_001" as any,
      name: "Tajon",
      slug: "tajon" as any,
      billingEmail: "billing@tajon.com",
      planId: null,
      now: "2026-01-01T00:00:00.000Z" as any,
    });
    expect(draft1).toEqual(draft2);
  });
});

describe("OrganizationDraft type distinctness", () => {
  it("OrganizationDraft has __draft brand on version", () => {
    const draft: OrganizationDraft = createOrganizationDraft({
      id: "org_001" as any,
      name: "Tajon",
      slug: "tajon" as any,
      billingEmail: "billing@tajon.com",
      planId: null,
      now: "2026-01-01T00:00:00.000Z" as any,
    });
    // The DraftVersion brand is present at the type level.
    // At runtime, the version is 0.
    expect(draft.version).toBe(0);
  });
});
