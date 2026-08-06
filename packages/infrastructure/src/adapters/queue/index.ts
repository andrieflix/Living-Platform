/**
 * Queue adapter contracts — provider-agnostic background job queue capability.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { Logger } from "@livingsites/platform";

/** A background job queue adapter: enqueue, dequeue, ack, retry. */
export interface QueueAdapter {
  enqueue(job: QueueJob): Promise<string>;
  dequeue(queueName: string, maxCount?: number): Promise<readonly QueueMessage[]>;
  ack(queueName: string, messageId: string): Promise<void>;
  retry(queueName: string, messageId: string, delayMs?: number): Promise<void>;
  moveToDeadLetter(queueName: string, messageId: string): Promise<void>;
  readonly logger: Logger;
}

export interface QueueJob {
  readonly type: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly maxAttempts?: number;
  readonly delayMs?: number;
}

export interface QueueMessage {
  readonly id: string;
  readonly job: QueueJob;
  readonly attempts: number;
  readonly enqueuedAt: string;
}
