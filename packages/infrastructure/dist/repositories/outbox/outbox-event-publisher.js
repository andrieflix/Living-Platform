/**
 * OutboxEventPublisher — durable EventPublisher backed by the
 * application_outbox table.
 *
 * Serializes approved domain-event data into the outbox. Assigns a
 * stable event ID and idempotency key. Never serializes secrets.
 * Returns typed failures. Never silently discards events.
 *
 * When a transaction is active (provided via the transaction context),
 * the outbox insert participates in that transaction, guaranteeing
 * atomicity with the aggregate mutation.
 */
import { randomUUID } from "node:crypto";
import { applicationOutbox } from "../../db/schema";
import { buildOutboxInsert } from "../../db/outbox-mapper";
function isDuplicateKeyError(err) {
    if (err && typeof err === "object" && "code" in err) {
        return err.code === "23505";
    }
    return false;
}
function isConnectionError(err) {
    if (err && typeof err === "object") {
        const e = err;
        if (e.code === "ECONNREFUSED" || e.code === "ETIMEDOUT" || e.code === "ENOTFOUND") {
            return true;
        }
        if (typeof e.message === "string" && /connection|timeout|unreachable/i.test(e.message)) {
            return true;
        }
    }
    return false;
}
export class OutboxEventPublisher {
    db;
    logger;
    schemaVersion;
    constructor(config) {
        this.db = config.db;
        this.logger = config.logger;
        this.schemaVersion = config.schemaVersion ?? "1.0.0";
    }
    async publish(event) {
        const insert = this.buildInsert(event);
        try {
            await this.db.insert(applicationOutbox).values(insert);
        }
        catch (err) {
            if (isDuplicateKeyError(err)) {
                this.logger.warn("Outbox event already exists (idempotent)", { idempotencyKey: insert.idempotency_key });
                return;
            }
            if (isConnectionError(err)) {
                this.logger.error("Outbox publish: connection error", { error: String(err) });
                throw new Error("Event persistence unavailable.");
            }
            this.logger.error("Outbox publish: unexpected error", { error: String(err) });
            throw new Error("Event persistence failed.");
        }
    }
    async publishAll(events) {
        if (events.length === 0)
            return;
        const inserts = events.map((e) => this.buildInsert(e));
        try {
            await this.db.insert(applicationOutbox).values(inserts);
        }
        catch (err) {
            if (isDuplicateKeyError(err)) {
                this.logger.warn("Outbox batch: some events already exist (idempotent)", { count: events.length });
                return;
            }
            if (isConnectionError(err)) {
                this.logger.error("Outbox batch publish: connection error", { error: String(err) });
                throw new Error("Event persistence unavailable.");
            }
            this.logger.error("Outbox batch publish: unexpected error", { error: String(err) });
            throw new Error("Event persistence failed.");
        }
    }
    buildInsert(event) {
        const eventId = randomUUID();
        const idempotencyKey = this.buildIdempotencyKey(event, eventId);
        const payload = this.serializePayload(event);
        return buildOutboxInsert({
            id: eventId,
            eventType: event.type,
            aggregateType: this.inferAggregateType(event.type),
            aggregateId: String(event.organizationId),
            organizationId: event.organizationId ? String(event.organizationId) : null,
            websiteId: event.websiteId ? String(event.websiteId) : null,
            payload,
            occurredAt: new Date(event.occurredAt),
            idempotencyKey,
            schemaVersion: this.schemaVersion,
        });
    }
    buildIdempotencyKey(event, eventId) {
        if (event.type === "organization.created") {
            const e = event;
            return `organization.created:${String(e.organizationId)}`;
        }
        return `${event.type}:${eventId}`;
    }
    inferAggregateType(eventType) {
        const dotIdx = eventType.indexOf(".");
        if (dotIdx > 0)
            return eventType.substring(0, dotIdx);
        return "unknown";
    }
    /**
     * Serializes only approved domain-event data. Strips any fields that
     * are not part of the known event contract to prevent accidental
     * leakage of sensitive data (e.g. billing email is NOT included).
     */
    serializePayload(event) {
        if (event.type === "organization.created") {
            const e = event;
            return {
                type: e.type,
                occurredAt: e.occurredAt,
                organizationId: String(e.organizationId),
                slug: e.slug,
                planId: e.planId,
            };
        }
        return {
            type: event.type,
            occurredAt: event.occurredAt,
            organizationId: event.organizationId ? String(event.organizationId) : null,
            ...(event.websiteId ? { websiteId: String(event.websiteId) } : {}),
        };
    }
}
//# sourceMappingURL=outbox-event-publisher.js.map