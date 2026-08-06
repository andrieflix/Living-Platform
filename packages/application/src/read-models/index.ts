/**
 * Read-model contracts barrel.
 *
 * Read models are provider-agnostic projections of aggregate state, shaped
 * for query and UI consumption. They are immutable — a use case never
 * mutates a read model directly. Read models are refreshed by projection
 * handlers or recomputed on demand.
 *
 * No implementations in this milestone — contracts only.
 */
export * from "./types";
