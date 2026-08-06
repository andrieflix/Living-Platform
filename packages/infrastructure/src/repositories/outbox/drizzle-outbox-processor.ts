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
import type { Logger } from "@livingsites/platform";
import type {
  OutboxProcessor,
  OutboxEventRecord,
  DispatchOutcome,
} from "@livingsites/application";
import type { DrizzleDB } from "../../db/drizzle-instance";
import { applicationOutbox, type OutboxRow } from "../../db/schema";
import { rowToOutboxEventRecord } from "../../db/outbox-mapper";

export interface OutboxProcessorConfig {
  readonly db: DrizzleDB;
  readonly logger: Logger;
  readonly maxAttempts?: number;
  readonly baseBackoffMs?: number;
  readonly maxBackoffMs?: number;
}

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_BASE_BACKOFF_MS = 1000;
const DEFAULT_MAX_BACKOFF_MS = 60000;

type Handler = (event: OutboxEventRecord) => Promise<DispatchOutcome>;

export class DrizzleOutboxProcessor implements OutboxProcessor {
  private readonly db: DrizzleDB;
  private readonly logger: Logger;
  private readonly maxAttempts: number;
  private readonly baseBackoffMs: number;
  private readonly maxBackoffMs: number;
  private readonly handlers: Map<string, Handler[]> = new Map();

  constructor(config: OutboxProcessorConfig) {
    this.db = config.db;
    this.logger = config.logger;
    this.maxAttempts = config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    this.baseBackoffMs = config.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS;
    this.maxBackoffMs = config.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS;
  }

  registerHandler(eventType: string, handler: Handler): void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(eventType, [...existing, handler]);
  }

  async processBatch(batchSize: number = 10): Promise<number> {
    const claimed = await this.claimPending(batchSize);
    if (claimed.length === 0) return 0;

    let processed = 0;
    for (const row of claimed) {
      await this.processSingle(row);
      processed++;
    }
    return processed;
  }

  private async claimPending(batchSize: number): Promise<OutboxRow[]> {
    try {
      const claimed = await this.db
        .update(applicationOutbox)
        .set({ status: "processing" })
        .where(eq(applicationOutbox.status, "pending"))
        .returning();

      return claimed.slice(0, batchSize);
    } catch (err) {
      this.logger.error("OutboxProcessor: claim failed", { error: String(err) });
      return [];
    }
  }

  private async processSingle(row: OutboxRow): Promise<void> {
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
        const outcome: DispatchOutcome = await handler(event);
        if (!outcome.ok) {
          allOk = false;
          lastError = outcome.error;
        }
      } catch (err) {
        allOk = false;
        lastError = String(err);
      }
    }

    if (allOk) {
      await this.markProcessed(row);
    } else {
      await this.markFailed(row, lastError);
    }
  }

  private async markProcessed(row: OutboxRow): Promise<void> {
    try {
      await this.db
        .update(applicationOutbox)
        .set({
          status: "processed",
          processed_at: new Date(),
          last_error: null,
        })
        .where(eq(applicationOutbox.id, row.id));
    } catch (err) {
      this.logger.error("OutboxProcessor: markProcessed failed", { id: row.id, error: String(err) });
    }
  }

  private async markFailed(row: OutboxRow, errorMessage: string): Promise<void> {
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
      } else {
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
    } catch (err) {
      this.logger.error("OutboxProcessor: markFailed failed", { id: row.id, error: String(err) });
    }
  }

  private calculateBackoff(attemptCount: number): number {
    const exponential = this.baseBackoffMs * Math.pow(2, attemptCount - 1);
    return Math.min(exponential, this.maxBackoffMs);
  }
}
