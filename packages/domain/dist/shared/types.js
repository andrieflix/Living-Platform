/**
 * Cross-cutting primitive types shared across bounded contexts.
 * These are framework-agnostic contracts — no implementation is ever provided here.
 *
 * Domain contains NO repository, database, provider, transport, or
 * infrastructure error concepts. RepositoryError, SaveResult, CreateResult,
 * and all repository-operation-specific result/error contracts live in
 * @livingsites/application.
 */
/**
 * Initial version assigned to every mutable aggregate root at creation.
 *
 * Convention: a new aggregate starts at `AggregateVersion` 0 before first
 * persistence. The first successful repository create returns version 1.
 * Every subsequent save passes the version that was loaded.
 */
export const INITIAL_AGGREGATE_VERSION = 0;
//# sourceMappingURL=types.js.map