/**
 * Aggregate catalog barrel — domain layer.
 *
 * Aggregate roots, child entities, invariants, value objects, and
 * consistency boundaries are domain concepts. Each bounded context has a
 * subfolder with a README.md describing its aggregates. No implementations —
 * documentation placeholders only.
 *
 * No generic AggregateRoot base class or framework is introduced here.
 * Aggregates are plain domain entities with documented boundaries.
 */
export * from "./organization";
export { createUserDraft, type UserDraft, type DraftVersion as UserDraftVersion, type CreateUserDraftInput, DRAFT_VERSION as USER_DRAFT_VERSION, } from "./users";
export * from "./website";
export * from "./navigation";
export * from "./theme";
export * from "./page";
export * from "./section";
export * from "./media";
export * from "./seo";
export * from "./analytics";
export * from "./forms";
export * from "./export";
//# sourceMappingURL=index.d.ts.map