/**
 * In-memory event publisher for tests.
 *
 * Captures published events for assertion. Does not deliver to any
 * external system. Not for production use.
 */
import type { DomainEvent } from "@livingsites/domain";
import type { EventPublisher } from "@livingsites/application";

export class InMemoryEventPublisher implements EventPublisher {
  readonly published: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.published.push(event);
  }

  async publishAll(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      this.published.push(event);
    }
  }

  clear(): void {
    this.published.length = 0;
  }

  get count(): number {
    return this.published.length;
  }
}
