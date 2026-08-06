CREATE TABLE IF NOT EXISTS "application_outbox" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" text NOT NULL,
	"organization_id" text,
	"website_id" text,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"available_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"last_error" text,
	"idempotency_key" text NOT NULL,
	"schema_version" text DEFAULT '1.0.0' NOT NULL,
	CONSTRAINT "application_outbox_idempotency_key_unique" UNIQUE("idempotency_key")
);

CREATE INDEX IF NOT EXISTS "application_outbox_pending_idx"
	ON "application_outbox" ("available_at")
	WHERE "status" = 'pending';

CREATE INDEX IF NOT EXISTS "application_outbox_aggregate_idx"
	ON "application_outbox" ("aggregate_type", "aggregate_id");

CREATE INDEX IF NOT EXISTS "application_outbox_organization_idx"
	ON "application_outbox" ("organization_id")
	WHERE "organization_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "application_outbox_website_idx"
	ON "application_outbox" ("website_id")
	WHERE "website_id" IS NOT NULL;
