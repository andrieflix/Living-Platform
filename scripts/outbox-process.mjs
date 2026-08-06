#!/usr/bin/env node
/**
 * Outbox processor worker — claims pending outbox events, dispatches
 * to registered in-process handlers, and marks them processed or failed.
 *
 * Usage: DATABASE_URL=postgresql://... npm run outbox:process
 *
 * This is a one-shot batch processor. For continuous processing, run it
 * on a schedule or wrap it in a loop with a delay.
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../packages/infrastructure/src/db/schema.ts";
import { DrizzleOutboxProcessor } from "../packages/infrastructure/src/repositories/outbox/drizzle-outbox-processor.ts";
import { ConsoleLogger } from "../packages/platform/src/logging/console-logger.ts";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL is not set. Set it to a PostgreSQL connection string.");
  process.exit(1);
}

const BATCH_SIZE = parseInt(process.env.OUTBOX_BATCH_SIZE ?? "10", 10);

const sqlClient = postgres(DATABASE_URL);
const db = drizzle(sqlClient, { schema });
const logger = new ConsoleLogger("outbox-worker", "info");
const processor = new DrizzleOutboxProcessor({ db, logger });

try {
  console.log(`Processing up to ${BATCH_SIZE} pending outbox events...`);
  const count = await processor.processBatch(BATCH_SIZE);
  console.log(`Processed ${count} event(s).`);
} catch (err) {
  console.error("Outbox processing failed:", err);
  process.exit(1);
} finally {
  await sqlClient.end();
}
