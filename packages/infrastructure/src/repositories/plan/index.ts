/**
 * Plan repository adapter — Drizzle implementation (read-only).
 *
 * Exports only the concrete adapter class and its config type.
 * Drizzle row types are not exported.
 */
export { DrizzlePlanReader } from "./drizzle-plan-reader";
export type { DrizzlePlanReaderConfig } from "./drizzle-plan-reader";
