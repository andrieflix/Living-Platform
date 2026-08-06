/**
 * In-memory event publisher for tests.
 *
 * Captures published events for assertion. Does not deliver to any
 * external system. Not for production use.
 */
import type { DomainEvent } from "@livingsites/domain";
import type { EventPublisher } from "@livingsites/application";
export declare class InMemoryEventPublisher implements EventPublisher {
    readonly published: DomainEvent[];
    publish(event: DomainEvent): Promise<void>;
    publishAll(events: readonly DomainEvent[]): Promise<void>;
    clear(): void;
    get count(): number;
}
//# sourceMappingURL=in-memory-event-publisher.d.ts.map