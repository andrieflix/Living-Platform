-- 0004_create_auth_and_users.sql
-- Better Auth tables (user, session, account, verification) and Platform Users table.
-- Additive and forward-only. Compatible with existing migration history.

-- ========== Better Auth: user table ==========
CREATE TABLE IF NOT EXISTS "ba_user" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "email" text NOT NULL UNIQUE,
  "email_verified" boolean NOT NULL DEFAULT false,
  "name" text NOT NULL,
  "image" text
);

-- ========== Better Auth: session table ==========
CREATE TABLE IF NOT EXISTS "ba_session" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "user_id" text NOT NULL REFERENCES "ba_user"("id") ON DELETE CASCADE,
  "expires_at" timestamptz NOT NULL,
  "token" text NOT NULL UNIQUE,
  "ip_address" text,
  "user_agent" text
);
CREATE INDEX IF NOT EXISTS "ba_session_user_id_idx" ON "ba_session"("user_id");

-- ========== Better Auth: account table ==========
CREATE TABLE IF NOT EXISTS "ba_account" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "provider_id" text NOT NULL,
  "account_id" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "ba_user"("id") ON DELETE CASCADE,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamptz,
  "refresh_token_expires_at" timestamptz,
  "scope" text,
  "password" text
);
CREATE INDEX IF NOT EXISTS "ba_account_user_id_idx" ON "ba_account"("user_id");
CREATE INDEX IF NOT EXISTS "ba_account_provider_account_idx" ON "ba_account"("provider_id", "account_id");

-- ========== Better Auth: verification table ==========
CREATE TABLE IF NOT EXISTS "ba_verification" (
  "id" text PRIMARY KEY NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "value" text NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "identifier" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "ba_verification_identifier_idx" ON "ba_verification"("identifier");

-- ========== Platform Users table ==========
DO $$ BEGIN
  CREATE TYPE "user_status" AS ENUM ('active', 'archived', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "platform_users" (
  "id" text PRIMARY KEY NOT NULL,
  "auth_subject_id" text NOT NULL UNIQUE,
  "email" text NOT NULL UNIQUE,
  "display_name" text NOT NULL,
  "status" "user_status" NOT NULL DEFAULT 'active',
  "version" integer NOT NULL DEFAULT 1,
  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  "created_by" text,
  "updated_by" text,
  "deleted_at" timestamptz
);
CREATE INDEX IF NOT EXISTS "platform_users_email_idx" ON "platform_users"("email");
