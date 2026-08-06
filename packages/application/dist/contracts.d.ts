/**
 * Application-layer result and error contracts for repository operations.
 *
 * These contracts live in @livingsites/application — not @livingsites/domain —
 * because they describe repository-operation outcomes (persistence failures,
 * duplicate keys, transport errors), not business consistency conflicts.
 *
 * Domain expresses business consistency conflicts (ConcurrencyConflict,
 * AggregateVersion, DomainError). Repository and persistence failures belong
 * to Application contracts.
 */
import type { Result, ConcurrencyConflict } from "@livingsites/domain";
/**
 * Repository-level error for infrastructure failures (connection lost,
 * constraint violation, timeout, etc.). Distinct from `DomainError` which
 * represents business-rule violations.
 */
export interface RepositoryError {
    readonly code: string;
    readonly message: string;
    readonly context?: Readonly<Record<string, unknown>>;
}
/**
 * Error returned when a `create` operation fails due to a duplicate unique
 * value (e.g. slug already exists, email already registered).
 */
export interface DuplicateKeyError {
    readonly code: "duplicate_key";
    readonly message: string;
    readonly field: string;
    readonly value: string;
}
/**
 * Error returned when a `create` or `save` operation fails because the
 * persistence layer is unavailable (connection lost, timeout, etc.).
 */
export interface PersistenceUnavailableError {
    readonly code: "persistence_unavailable";
    readonly message: string;
}
/**
 * Error returned when a `create` or `save` operation fails because the
 * persistence layer is in an invalid state (schema mismatch, constraint
 * violation not covered by DuplicateKeyError, etc.).
 */
export interface InvalidPersistenceStateError {
    readonly code: "invalid_persistence_state";
    readonly message: string;
    readonly context?: Readonly<Record<string, unknown>>;
}
/**
 * Union of all creation-specific errors. Creation conflicts must NOT return
 * ConcurrencyConflict — ConcurrencyConflict is reserved for save (mutation)
 * version mismatches on existing aggregates.
 */
export type CreateError = DuplicateKeyError | PersistenceUnavailableError | InvalidPersistenceStateError;
/**
 * Union of all save (mutation) errors. Save returns ConcurrencyConflict when
 * the stored version does not match expectedVersion. Save may also return
 * repository-level errors.
 */
export type SaveError = ConcurrencyConflict | PersistenceUnavailableError | InvalidPersistenceStateError;
/**
 * Result of a `create` operation. Returns the created aggregate (with
 * generated id, version 1, and audit trail) or a creation error.
 */
export type CreateResult<T> = Result<T, CreateError>;
/**
 * Result of a `save` (mutation) operation. Returns the saved aggregate (with
 * incremented version) or a save error (which may be a ConcurrencyConflict).
 */
export type SaveResult<T> = Result<T, SaveError>;
/**
 * Result of a `softDelete`, `delete`, `archive`, `restore`, or other mutation
 * that returns void on success. Returns a save error on failure.
 */
export type MutationResult = Result<void, SaveError>;
//# sourceMappingURL=contracts.d.ts.map