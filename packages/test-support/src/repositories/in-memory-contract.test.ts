import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryOrganizationRepository } from "@livingsites/test-support";
import { runRepositoryContractTests } from "@livingsites/test-support";

runRepositoryContractTests(
  "InMemoryOrganizationRepository",
  () => {
    const repo = new InMemoryOrganizationRepository();
    return {
      reader: repo,
      creator: repo,
      cleanup: async () => { repo.clear(); },
    };
  },
);

describe("InMemoryOrganizationRepository — isolation", () => {
  let repo: InMemoryOrganizationRepository;

  beforeEach(() => {
    repo = new InMemoryOrganizationRepository();
  });

  it("returns isolated values (mutating returned org does not affect store)", async () => {
    const { createOrganizationDraft } = await import("@livingsites/domain");
    const draft = createOrganizationDraft({
      id: "org_iso_001" as any,
      name: "Isolation Test",
      slug: "iso-test" as any,
      billingEmail: "iso@test.com",
      planId: null,
      now: "2026-01-01T00:00:00.000Z" as any,
    });
    const created = await repo.create(draft);
    if (!created.ok) throw new Error("create failed");
    const found = await repo.findById(created.value.id);
    if (!found) throw new Error("findById failed");
    found.name = "Modified";
    const refound = await repo.findById(created.value.id);
    expect(refound?.name).toBe("Isolation Test");
  });
});
