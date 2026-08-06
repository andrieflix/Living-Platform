# Queue Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `QueueAdapter` represents the capability to enqueue and dequeue
background jobs. Export jobs, media processing, scheduled publishes, and
sitemap regeneration all use queues to run work asynchronously. A future
implementation may back this with Supabase Queues, Redis queues, or BullMQ.

## Planned contracts

- **`QueueAdapter`** — enqueue, dequeue, acknowledge, retry, dead-letter.
- **`QueueJob`** — a queued job with type, payload, attempts, and metadata.
- **`QueueMessage`** — a dequeued message awaiting acknowledgment.

## Principles

1. **The adapter is provider-agnostic.** It uses generic job shapes, not
   provider-specific queue APIs.
2. **Jobs are typed.** Each job has a `type` string that maps to a handler
   registered by the composition root.
3. **Acknowledgment is explicit.** A dequeued job must be acknowledged on
   success or retried on failure. Unacknowledged jobs are redelivered after
   a visibility timeout.
4. **Dead-letter queues are supported.** Jobs that exceed the max retry count
   are moved to a dead-letter queue for inspection.
