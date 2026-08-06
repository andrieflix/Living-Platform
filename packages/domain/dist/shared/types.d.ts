/**
 * Cross-cutting primitive types shared across bounded contexts.
 * These are framework-agnostic contracts — no implementation is ever provided here.
 *
 * Domain contains NO repository, database, provider, transport, or
 * infrastructure error concepts. RepositoryError, SaveResult, CreateResult,
 * and all repository-operation-specific result/error contracts live in
 * @livingsites/application.
 */
/** Brand for opaque identifier types. Prevents accidental cross-assignment of ids. */
export type Brand<T, B extends string> = T & {
    readonly __brand: B;
};
/** Canonical identifier for an Organization. */
export type OrganizationId = Brand<string, "OrganizationId">;
/** Canonical identifier for a Website. */
export type WebsiteId = Brand<string, "WebsiteId">;
/** Canonical identifier for a Page. */
export type PageId = Brand<string, "PageId">;
/** Canonical identifier for a Section instance. */
export type SectionId = Brand<string, "SectionId">;
/** Canonical identifier for a SectionType registration. */
export type SectionTypeId = Brand<string, "SectionTypeId">;
/** Canonical identifier for a Theme. */
export type ThemeId = Brand<string, "ThemeId">;
/** Canonical identifier for a User. */
export type UserId = Brand<string, "UserId">;
/** Canonical identifier for a Membership. */
export type MembershipId = Brand<string, "MembershipId">;
/** Canonical identifier for a Media asset. */
export type MediaId = Brand<string, "MediaId">;
/** Canonical identifier for a Folder. */
export type FolderId = Brand<string, "FolderId">;
/** Canonical identifier for a Form. */
export type FormId = Brand<string, "FormId">;
/** Canonical identifier for a FormField. */
export type FieldId = Brand<string, "FieldId">;
/** Canonical identifier for a Form submission. */
export type SubmissionId = Brand<string, "SubmissionId">;
/** Canonical identifier for an ExportJob. */
export type ExportJobId = Brand<string, "ExportJobId">;
/** Canonical identifier for a Plan (subscription tier). */
export type PlanId = Brand<string, "PlanId">;
/** Canonical identifier for a Feature flag/capability. */
export type FeatureId = Brand<string, "FeatureId">;
/** ISO-8601 timestamp string in UTC. */
export type ISODateString = Brand<string, "ISODateString">;
/** Semver-style version string, e.g. "1.0.0". */
export type VersionString = Brand<string, "VersionString">;
/** Non-empty slug used for URL segments and machine-readable keys. */
export type Slug = Brand<string, "Slug">;
/** Arbitrary locale code, e.g. "en-US", "fr-FR". */
export type LocaleCode = Brand<string, "LocaleCode">;
/** A lowercased, normalized unique key (letters, digits, dashes only). */
export type MachineKey = Brand<string, "MachineKey">;
/**
 * Pagination contract used by every list/query method across repositories and services.
 */
export interface PaginationParams {
    /** 1-indexed page number. Must be >= 1. */
    page: number;
    /** Page size. Must be >= 1 and <= a context-specific maximum. */
    pageSize: number;
}
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
/** Sort direction for ordered queries. */
export type SortDirection = "asc" | "desc";
/** Generic filter clause. Contexts specialize via specific filter interfaces. */
export interface FilterClause<TField extends string = string> {
    field: TField;
    operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "like" | "null" | "notnull";
    value?: string | number | boolean | readonly (string | number)[];
}
/** Generic result wrapper for operations that may fail without throwing. */
export type Result<T, E = DomainError> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
/** Base shape for all domain errors. Contexts extend this. */
export interface DomainError {
    readonly code: string;
    readonly message: string;
    readonly context?: Readonly<Record<string, unknown>>;
}
/** Common lifecycle status for soft-deletable entities. */
export type LifecycleStatus = "active" | "archived" | "deleted";
/**
 * Optimistic concurrency version for mutable aggregate roots.
 *
 * Every mutable aggregate root carries this version. A repository save
 * checks the expected version against the stored version and fails with a
 * `ConcurrencyConflict` if they differ. The version is monotonically
 * incremented on each successful save.
 *
 * Immutable aggregates (e.g. PageSnapshot) do not carry this version —
 * they are never updated after creation.
 *
 * This type is reserved exclusively for optimistic concurrency on mutable
 * aggregate roots. It is never used for publication history, release
 * labels, or any other purpose.
 */
export type AggregateVersion = number;
/**
 * Typed concurrency conflict returned when a repository save detects that
 * the stored aggregate version does not match the expected version passed
 * by the use case. The use case returns this to the UI, which can reload
 * the aggregate and retry.
 *
 * ConcurrencyConflict is a domain concept — it expresses that two
 * operations conflicted over the same aggregate state. It lives in Domain.
 */
export interface ConcurrencyConflict {
    readonly aggregateId: string;
    readonly expectedVersion: AggregateVersion;
    readonly actualVersion: AggregateVersion;
}
/**
 * Initial version assigned to every mutable aggregate root at creation.
 *
 * Convention: a new aggregate starts at `AggregateVersion` 0 before first
 * persistence. The first successful repository create returns version 1.
 * Every subsequent save passes the version that was loaded.
 */
export declare const INITIAL_AGGREGATE_VERSION: AggregateVersion;
/** Audit metadata embedded in every persisted entity. */
export interface AuditTrail {
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy?: UserId;
    updatedBy?: UserId;
}
//# sourceMappingURL=types.d.ts.map