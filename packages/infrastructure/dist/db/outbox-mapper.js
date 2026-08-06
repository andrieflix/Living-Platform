export function rowToOutboxEventRecord(row) {
    if (!row.id) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox row missing id." } };
    }
    if (!row.event_type) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox row missing event_type." } };
    }
    if (!row.aggregate_type) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox row missing aggregate_type." } };
    }
    if (!row.aggregate_id) {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox row missing aggregate_id." } };
    }
    let payload;
    if (typeof row.payload === "string") {
        try {
            const parsed = JSON.parse(row.payload);
            if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
                return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox payload is not a JSON object." } };
            }
            payload = parsed;
        }
        catch {
            return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox payload has invalid JSON." } };
        }
    }
    else if (typeof row.payload === "object" && row.payload !== null && !Array.isArray(row.payload)) {
        payload = row.payload;
    }
    else {
        return { ok: false, error: { code: "invalid_persistence_state", message: "Outbox payload has unexpected type." } };
    }
    const record = {
        id: row.id,
        eventType: row.event_type,
        aggregateType: row.aggregate_type,
        aggregateId: row.aggregate_id,
        organizationId: row.organization_id,
        websiteId: row.website_id,
        payload,
        occurredAt: row.occurred_at instanceof Date ? row.occurred_at.toISOString() : String(row.occurred_at),
        schemaVersion: row.schema_version,
        attemptCount: row.attempt_count,
    };
    return { ok: true, value: record };
}
export function buildOutboxInsert(params) {
    return {
        id: params.id,
        event_type: params.eventType,
        aggregate_type: params.aggregateType,
        aggregate_id: params.aggregateId,
        organization_id: params.organizationId,
        website_id: params.websiteId,
        payload: params.payload,
        occurred_at: params.occurredAt,
        status: "pending",
        attempt_count: 0,
        available_at: new Date(),
        processed_at: null,
        last_error: null,
        idempotency_key: params.idempotencyKey,
        schema_version: params.schemaVersion,
    };
}
//# sourceMappingURL=outbox-mapper.js.map