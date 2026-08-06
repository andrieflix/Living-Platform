/**
 * Application-facing event publishing contract.
 *
 * The use case emits domain events through this port after successful
 * persistence. Infrastructure or test-support provides the implementation.
 *
 * This contract lives in Application because it is an application-layer port.
 * The Domain defines event types; Application defines the publishing port.
 * No concrete implementations live here — they belong in Infrastructure
 * (production) or test-support (tests).
 */
import type { DomainEvent } from "@livingsites/domain";
/** Publishes domain events after successful use case execution. */
export interface EventPublisher {
    publish(event: DomainEvent): Promise<void>;
    publishAll(events: readonly DomainEvent[]): Promise<void>;
}
//# sourceMappingURL=event-publisher.d.ts.map