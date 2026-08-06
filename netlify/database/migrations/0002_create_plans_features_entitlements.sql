CREATE TYPE "plan_tier" AS ENUM('starter', 'pro', 'business', 'enterprise');

CREATE TYPE "feature_category" AS ENUM('limit', 'capability', 'addon');

CREATE TABLE IF NOT EXISTS "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"tier" "plan_tier" NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_monthly" integer DEFAULT 0 NOT NULL,
	"price_annual" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"max_websites" integer,
	"max_members" integer,
	"custom_domains_allowed" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_by" text,
	"deactivated_at" timestamp with time zone,
	CONSTRAINT "plans_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "features" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"category" "feature_category" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"value_type" text DEFAULT 'boolean' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_by" text,
	CONSTRAINT "features_key_unique" UNIQUE("key")
);

CREATE TABLE IF NOT EXISTS "plan_feature_entitlements" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL REFERENCES "plans"("id") ON DELETE CASCADE,
	"feature_id" text NOT NULL REFERENCES "features"("id") ON DELETE CASCADE,
	"value" numeric DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_feature_entitlements_plan_feature_unique" UNIQUE("plan_id", "feature_id")
);

CREATE INDEX IF NOT EXISTS "plan_feature_entitlements_plan_id_idx" ON "plan_feature_entitlements" ("plan_id");
CREATE INDEX IF NOT EXISTS "plan_feature_entitlements_feature_id_idx" ON "plan_feature_entitlements" ("feature_id");
