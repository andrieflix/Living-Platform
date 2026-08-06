/**
 * Netlify Scheduled Function — outbox processor.
 *
 * Invokes the existing DrizzleOutboxProcessor through the production
 * composition root. Processes a bounded batch of pending outbox events.
 *
 * Safe to invoke repeatedly. Concurrent invocations do not double-process
 * events (atomic claim via UPDATE...RETURNING).
 *
 * Does not expose a public unauthenticated mutation endpoint — this is
 * a scheduled/internal function.
 *
 * @param event - Netlify scheduled function event (cron trigger)
 * @param context - Netlify function context
 * @returns Structured result with counts and failure summaries
 */
import type { Handler } from "@netlify/functions";
import { composeProduction } from "../../packages/composition/src/production";

const MAX_BATCH_SIZE = 50;
const EXECUTION_TIME_BUDGET_MS = 25000;

export const handler: Handler = async (event, context) => {
  const startTime = Date.now();
  const batchSize = Math.min(
    parseInt(process.env.OUTBOX_BATCH_SIZE ?? String(MAX_BATCH_SIZE), 10),
    MAX_BATCH_SIZE,
  );

  let composition;
  try {
    composition = composeProduction();
  } catch (err) {
    console.error("[outbox-worker] Failed to initialize composition:", err);
    return {
      statusCode: 503,
      body: JSON.stringify({
        ok: false,
        error: "Database initialization failed",
        errorType: err instanceof Error ? err.name : "Unknown",
      }),
    };
  }

  try {
    const processedCount = await composition.outboxProcessor.processBatch(batchSize);
    const elapsedMs = Date.now() - startTime;

    console.log("[outbox-worker] Processed", {
      processedCount,
      batchSize,
      elapsedMs,
      timeBudgetMs: EXECUTION_TIME_BUDGET_MS,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        processedCount,
        batchSize,
        elapsedMs,
      }),
    };
  } catch (err) {
    console.error("[outbox-worker] Processing failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        errorType: err instanceof Error ? err.name : "Unknown",
        elapsedMs: Date.now() - startTime,
      }),
    };
  } finally {
    await composition.close();
  }
};

export default handler;
