/**
 * Netlify Scheduled Function — identity linkage reconciliation.
 *
 * Invokes the LinkageReconciler through the production composition root.
 * Processes a bounded batch of pending identity linkages. After max
 * attempts, revokes the orphan Better Auth identity so it cannot authenticate.
 *
 * Configuration via environment variables:
 * - LINKAGE_BATCH_SIZE: max linkages per run (default 50, capped at 200)
 * - LINKAGE_GRACE_PERIOD_MS: minimum age of pending linkage before retry (default 0)
 *
 * Safe to invoke repeatedly. Concurrent invocations do not double-process
 * linkages (atomic claim via status + next_attempt_at filter).
 *
 * Does not log sensitive data (emails, passwords, tokens).
 */
import type { Handler } from "@netlify/functions";
import { composeProduction } from "../../packages/composition/src/production";
import { LinkageReconciler } from "../../packages/infrastructure/src/repositories/identity/linkage-reconciler";

const MAX_BATCH_SIZE = 200;
const DEFAULT_BATCH_SIZE = 50;

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const handler: Handler = async () => {
  const startTime = Date.now();
  const batchSize = Math.min(
    parseInt(process.env.LINKAGE_BATCH_SIZE ?? String(DEFAULT_BATCH_SIZE), 10) || DEFAULT_BATCH_SIZE,
    MAX_BATCH_SIZE,
  );
  const gracePeriodMs = parseInt(process.env.LINKAGE_GRACE_PERIOD_MS ?? "0", 10) || 0;

  let composition;
  try {
    const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? getEnv("BETTER_AUTH_URL"))
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    composition = composeProduction({
      betterAuthSecret: getEnv("BETTER_AUTH_SECRET"),
      betterAuthUrl: getEnv("BETTER_AUTH_URL"),
      trustedOrigins,
      registrationMode: process.env.AUTH_REGISTRATION_MODE ?? "invite_only",
      emailVerificationEnabled: process.env.EMAIL_VERIFICATION_ENABLED === "true",
      logLevel: "info",
    });
  } catch (err) {
    console.error("[linkage-reconciler] Init failed:", err instanceof Error ? err.name : "Unknown");
    return { statusCode: 503, body: JSON.stringify({ ok: false, error: "Initialization failed" }) };
  }

  try {
    const reconciler = new LinkageReconciler({
      db: composition.db,
      logger: composition.logger,
      userCreator: composition.userCreator,
      idGenerator: composition.idGenerator,
      clock: composition.clock,
      authRevoker: {
        async revokeIdentity(authSubjectId: string): Promise<{ ok: boolean }> {
          try {
            await composition.authenticationPort.revokeSession(authSubjectId);
            return { ok: true };
          } catch {
            return { ok: false };
          }
        },
      },
      batchSize,
      gracePeriodMs,
    });

    const result = await reconciler.reconcile();
    const elapsedMs = Date.now() - startTime;

    console.log("[linkage-reconciler] Complete", {
      processed: result.processed,
      linked: result.linked,
      failed: result.failed,
      revoked: result.revoked,
      skipped: result.skipped,
      elapsedMs,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        processed: result.processed,
        linked: result.linked,
        failed: result.failed,
        revoked: result.revoked,
        skipped: result.skipped,
        elapsedMs,
      }),
    };
  } catch (err) {
    console.error("[linkage-reconciler] Processing failed:", err instanceof Error ? err.name : "Unknown");
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Processing failed" }) };
  } finally {
    await composition.close();
  }
};

export default handler;
