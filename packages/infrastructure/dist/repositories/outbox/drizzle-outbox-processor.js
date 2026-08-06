/**
 * OutboxProcessor — database-backed processor for pending outbox events.
 *
 * 1. Claims pending events safely (atomic UPDATE ... RETURNING).
 * 2. Marks them processing.
 * 3. Dispatches to registered in-process handlers.
 * 4. Marks successful events processed.
 * 5. Records failures and schedules retry with bounded backoff.
 * 6. Moves events to a failed/dead state after max attempts.
 *
 * Concurrent processors do not process the same event simultaneously
 * (atomic claim). Handler failure does not lose the event. Unknown event
 * types are retained and marked failed. A successfully dispatched event
 * with zero registered subscribers is marked processed and logged.
 */
import { eq } from "drizzle-orm";
import { applicationOutbox } from "../../db/schema";
import { rowToOutboxEventRecord } from "../../db/outbox-mapper";
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_BASE_BACKOFF_MS = 1000;
const DEFAULT_MAX_BACKOFF_MS = 60000;
export class DrizzleOutboxProcessor {
    db;
    logger;
    maxAttempts;
    baseBackoffMs;
    maxBackoffMs;
    handlers = new Map();
    constructor(config) {
        this.db = config.db;
        this.logger = config.logger;
        this.maxAttempts = config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
        this.baseBackoffMs = config.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
        this.maxBackoffMs = config.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS;
    }
    registerHandler(eventType, handler) {
        const existing = this.handlers.get(eventType) ?? [];
        this.handlers.set(eventType, [...existing, handler]);
    }
    async processBatch(batchSize = 10) {
        const claimed = await this.claimPending(batchSize);
        if (claimed.length === 0)
            return 0;
        let processed = 0;
        for (const row of claimed) {
            await this.processSingle(row);
            processed++;
        }
        return processed;
    }
    async claimPending(batchSize) {
        try {
            const claimed = await this.db
                .update(applicationOutbox)
                .set({ status: "processing" })
                .where(eq(applicationOutbox.status, "pending"))
                .returning();
            return claimed.slice(0, batchSize);
        }
        catch (err) {
            this.logger.error("OutboxProcessor: claim failed", { error: String(err) });
            return [];
        }
    }
    async processSingle(row) {
        const mapped = rowToOutboxEventRecord(row);
        if (!mapped.ok) {
            await this.markFailed(row, mapped.error.message);
            return;
        }
        const event = mapped.value;
        const handlers = this.handlers.get(event.eventType) ?? [];
        if (handlers.length === 0) {
            this.logger.info("Outbox event dispatched with no registered subscribers — marking processed", {
                eventId: event.id,
                eventType: event.eventType,
            });
            await this.markProcessed(row);
            return;
        }
        let allOk = true;
        let lastError = "";
        for (const handler of handlers) {
            try {
                const outcome = await handler(event);
                if (!outcome.ok) {
                    allOk = false;
                    lastError = outcome.error;
                }
            }
            catch (err) {
                allOk = false;
                lastError = String(err);
            }
        }
        if (allOk) {
            await this.markProcessed(row);
        }
        else {
            await this.markFailed(row, lastError);
        }
    }
    async markProcessed(row) {
        try {
            await this.db
                .update(applicationOutbox)
                .set({
                status: "processed",
                processed_at: new Date(),
                last_error: null,
            })
                .where(eq(applicationOutbox.id, row.id));
        }
        catch (err) {
            this.logger.error("OutboxProcessor: markProcessed failed", { id: row.id, error: String(err) });
        }
    }
    async markFailed(row, errorMessage) {
        try {
            const newAttemptCount = row.attempt_count + 1;
            if (newAttemptCount >= this.maxAttempts) {
                await this.db
                    .update(applicationOutbox)
                    .set({
                    status: "failed",
                    attempt_count: newAttemptCount,
                    last_error: errorMessage,
                    available_at: new Date(),
                })
                    .where(eq(applicationOutbox.id, row.id));
                this.logger.error("Outbox event moved to failed (max attempts reached)", {
                    id: row.id,
                    eventType: row.event_type,
                    attempts: newAttemptCount,
                    error: errorMessage,
                });
            }
            else {
                const backoff = this.calculateBackoff(newAttemptCount);
                const availableAt = new Date(Date.now() + backoff);
                await this.db
                    .update(applicationOutbox)
                    .set({
                    status: "pending",
                    attempt_count: newAttemptCount,
                    last_error: errorMessage,
                    available_at: availableAt,
                })
                    .where(eq(applicationOutbox.id, row.id));
                this.logger.warn("Outbox event failed — scheduled retry", {
                    id: row.id,
                    eventType: row.event_type,
                    attempts: newAttemptCount,
                    backoffMs: backoff,
                    error: errorMessage,
                });
            }
        }
        catch (err) {
            this.logger.error("OutboxProcessor: markFailed failed", { id: row.id, error: String(err) });
        }
    }
    calculateBackoff(attemptCount) {
        const exponential = this.baseBackoffMs * Math.pow(2, attemptCount - 1);
        return Math.min(exponential, this.maxBackoffMs);
    }
}
//# sourceMappingURL=drizzle-outbox-processor.js.map