# Outbox Operations

## Transactional Outbox Pattern

The Create Organization use case atomically persists the Organization
aggregate and the `OrganizationCreated` outbox record in a single
database transaction. See [ADR 008](../adr/008-transactional-outbox.md).

## Netlify Scheduled Function

The outbox processor is exposed as a Netlify Scheduled Function:

```
netlify/functions/process-outbox.ts
```

Configured in `netlify.toml` to run every 5 minutes.

### Behavior

- Processes a bounded batch (default: 50, configurable via
  `OUTBOX_BATCH_SIZE`)
- Respects a strict 25-second execution-time budget
- Safe to invoke repeatedly
- Concurrent invocations do not double-process events (atomic claim)
- Logs counts and failure summaries (no sensitive payloads)
- Returns a structured JSON result
- Closes database/runtime resources after processing
- Does not expose a public unauthenticated mutation endpoint

### Response

```json
{
  "ok": true,
  "processedCount": 5,
  "batchSize": 50,
  "elapsedMs": 1200
}
```

## CLI Worker

A one-shot CLI worker is also available for local operations:

```bash
npm run outbox:process
```

## Retry and Failure

- Failed events scheduled for retry with exponential backoff
- Base backoff: 1 second, doubling per attempt, capped at 60 seconds
- After max attempts (default: 5), events move to `failed` status
- Unknown event types marked processed (no handlers registered)
- Failed events retained for investigation

## Composition

Production composition (`composeProduction`) uses the Netlify Database
provider. The outbox processor is wired through the composition root.
The scheduled function imports Composition, not raw repository adapters.
