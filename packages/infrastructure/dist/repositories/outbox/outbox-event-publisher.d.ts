import type { Logger } from "@livingsites/platform";
import type { DomainEvent } from "@livingsites/domain";
import type { EventPublisher } from "@livingsites/application";
import type { DrizzleDB } from "../../db/drizzle-instance";
export interface OutboxEventPublisherConfig {
    readonly db: DrizzleDB;
    readonly logger: Logger;
    readonly schemaVersion?: string;
}
export type OutboxPublishError = {
    code: "persistence_unavailable";
    message: string;
} | {
    code: "duplicate_key";
    message: string;
} | {
    code: "invalid_persistence_state";
    message: string;
};
export declare class OutboxEventPublisher implements EventPublisher {
    private readonly db;
    private readonly logger;
    private readonly schemaVersion;
    constructor(config: OutboxEventPublisherConfig);
    publish(event: DomainEvent): Promise<void>;
    publishAll(events: readonly DomainEvent[]): Promise<void>;
    private buildInsert;
    private buildIdempotencyKey;
    private inferAggregateType;
    /**
     * Serializes only approved domain-event data. Strips any fields that
     * are not part of the known event contract to prevent accidental
     * leakage of sensitive data (e.g. billing email is NOT included).
     */
    private serializePayload;
}
//# sourceMappingURL=outbox-event-publisher.d.ts.map