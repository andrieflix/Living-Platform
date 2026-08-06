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

/**
 * Metadata embedded in every read model. Enables cache invalidation based on
 * the source aggregate's version and staleness detection based on computation
 * time.
 */
export interface ReadModelMetadata {
  /** When the read model was computed or last refreshed. */
  readonly computedAt: string;
  /** The version of the source aggregate at the time of computation. */
  readonly sourceVersion: number;
  /** The version of the projection logic that produced this read model. */
  readonly projectionVersion: number;
}

/**
 * Base contract for all read models. Every read model extends this interface
 * and carries `ReadModelMetadata` for cache invalidation and staleness
 * detection.
 */
export interface ReadModel {
  readonly metadata: ReadModelMetadata;
}

/** A single row in a paginated read-model list. */
export interface ReadModelRow extends ReadModel {
  readonly id: string;
}

/** Paginated result wrapper for read-model lists. */
export interface ReadModelPage<T extends ReadModelRow> {
  readonly rows: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly metadata: ReadModelMetadata;
}
