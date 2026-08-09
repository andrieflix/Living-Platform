/**
 * @livingsites/composition — the composition root of Living Sites.
 *
 * The SINGLE place where concrete implementations of repository and service
 * contracts are instantiated and wired together.
 *
 * Three composition modes:
 * - composeProduction: uses Netlify Database + Better Auth. Fails fast if unavailable.
 * - composeDevelopment: in-memory + fake adapters for local development. Not for production.
 * - composeTest: deterministic test-support adapters with event capture.
 */
export { composeProduction } from "./production";
export type { ProductionComposition, ProductionCompositionConfig } from "./production";
export { MissingNetlifyDatabaseError } from "@livingsites/infrastructure";
export { composeDevelopment } from "./development";
export type { DevelopmentComposition, DevelopmentCompositionConfig } from "./development";
export { composeTest } from "./test";
export type { TestComposition, TestCompositionConfig } from "./test";
//# sourceMappingURL=index.d.ts.map