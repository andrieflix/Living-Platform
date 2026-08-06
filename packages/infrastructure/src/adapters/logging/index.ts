/**
 * Logging adapter contracts — provider-agnostic structured log sink capability.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { LoggerFactory, LogEntry } from "@livingsites/platform";

/** Routes structured log entries to an external log destination. */
export interface LoggingAdapter extends LoggerFactory {
  flush(): Promise<LogFlushResult>;
  shutdown(): Promise<void>;
}

export interface LogFlushResult {
  readonly flushed: number;
  readonly failed: number;
  readonly error?: string;
}

/** Redacts known secret fields from a log entry before forwarding. */
export function redactSecrets(entry: LogEntry, secretFields: readonly string[]): LogEntry {
  if (!entry.fields) return entry;
  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entry.fields)) {
    redacted[key] = secretFields.includes(key) ? "[REDACTED]" : value;
  }
  return { ...entry, fields: redacted };
}
