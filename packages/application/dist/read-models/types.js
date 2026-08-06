/**
 * Provider-agnostic read-model contracts.
 *
 * A read model is a projection of aggregate state at a point in time. It is
 * not an aggregate — it is derived data. Read models are immutable: they are
 * never mutated by use cases. A projection handler creates a new version of
 * a read model rather than editing the old one.
 *
 * These contracts define the metadata that every read model carries, enabling
 * cache invalidation, staleness detection, and projection versioning without
 * coupling to any specific provider or persistence mechanism.
 */
export {};
//# sourceMappingURL=types.js.map