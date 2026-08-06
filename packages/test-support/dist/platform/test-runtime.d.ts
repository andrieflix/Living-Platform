/**
 * Test runtime — deterministic platform implementations for tests.
 *
 * Re-exports the FakeClock and DeterministicIdGenerator from Platform
 * for convenience, and provides a NoopEventPublisher for development
 * composition that explicitly selects no-op event behavior.
 */
import type { DomainEvent } from "@livingsites/domain";
import type { EventPublisher } from "@livingsites/application";
/**
 * Explicit no-op event publisher for development composition.
 * This is NOT for production — it must be explicitly selected by
 * composeDevelopment and documented.
 */
export declare class NoopEventPublisher implements EventPublisher {
    publish(): Promise<void>;
    publishAll(): Promise<void>;
}
export { FakeClock, DeterministicIdGenerator } from "@livingsites/platform";
export type { DomainEvent };
//# sourceMappingURL=test-runtime.d.ts.map