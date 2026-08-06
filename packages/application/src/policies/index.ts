/**
 * Policy catalog barrel.
 *
 * Aggregates policy documentation placeholders for every bounded context.
 * Each subfolder contains a README.md describing the policies for that
 * context and an index.ts with export placeholders.
 *
 * Policies are business rules, not permissions (authorization), not feature
 * flags (rollout), not repositories (data access). Policies are evaluated by
 * use cases before performing an operation. They are deterministic, reusable,
 * and depend only on their inputs.
 *
 * No implementations in this milestone — architecture only.
 */
export * from "./shared";
export * from "./subscription";
export * from "./website";
export * from "./publishing";
export * from "./seo";
export * from "./media";
export * from "./storage";
export * from "./export";
export * from "./builder";
export * from "./organization";
export * from "./platform";
export * from "./forms";
export * from "./ai";
