-- 0005_create_identity_linkages.sql
-- Durable linkage state for orphan identity recovery.
-- Tracks the state of the link between a Better Auth identity and a Platform User.

DO $$ BEGIN
  CREATE TYPE "linkage_status" AS ENUM ('pending', 'linked', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "identity_linkages" (
  "id" text PRIMARY KEY NOT NULL,
  "auth_subject_id" text NOT NULL,
  "email" text NOT NULL,
  "display_name" text NOT NULL,
  "status" "linkage_status" NOT NULL DEFAULT 'pending',
  "platform_user_id" text,
  "failure_reason" text,
  "attempts" integer NOT NULL DEFAULT 0,
  "max_attempts" integer NOT NULL DEFAULT 5,
  "next_attempt_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "completed_at" timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS "identity_linkages_auth_subject_idx" ON "identity_linkages"("auth_subject_id");
CREATE INDEX IF NOT EXISTS "identity_linkages_status_idx" ON "identity_linkages"("status", "next_attempt_at");
