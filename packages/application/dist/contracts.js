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
export {};
//# sourceMappingURL=contracts.js.map