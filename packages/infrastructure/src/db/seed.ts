/**
 * Deterministic seed for platform-global Plans and Features.
 *
 * Uses controlled upsert: seed-owned fields are updated on rerun.
 * Operational fields (version, audit metadata, deactivated_at) are
 * preserved and never overwritten by the seed.
 *
 * No customer-specific data.
 */
import { eq } from "drizzle-orm";
import type { Logger } from "@livingsites/platform";
import { plans, features, planFeatureEntitlements } from "./schema";
import type { DrizzleDB } from "./drizzle-instance";

export interface SeedResult {
  readonly plansUpserted: number;
  readonly featuresUpserted: number;
  readonly entitlementsUpserted: number;
}

const PLAN_FREE_ID = "plan_free";
const PLAN_LIFETIME_ID = "plan_lifetime";

const FEATURE_IDS = {
  websiteLimit: "feat_website_limit",
  customDomain: "feat_custom_domain",
  exportAccess: "feat_export_access",
  pageBuilder: "feat_page_builder",
  formsAccess: "feat_forms_access",
  seoAccess: "feat_seo_access",
  analyticsAccess: "feat_analytics_access",
} as const;

interface PlanSeed {
  id: string;
  tier: "starter" | "pro" | "business" | "enterprise";
  slug: string;
  name: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  currency: string;
  max_websites: number | null;
  max_members: number | null;
  custom_domains_allowed: boolean;
  is_active: boolean;
}

interface FeatureSeed {
  id: string;
  key: string;
  category: "limit" | "capability" | "addon";
  name: string;
  description: string;
  value_type: "boolean" | "number";
  is_active: boolean;
}

interface EntitlementSeed {
  id: string;
  plan_id: string;
  feature_id: string;
  value: string;
}

const PLAN_SEEDS: readonly PlanSeed[] = [
  { id: PLAN_FREE_ID, tier: "starter", slug: "free", name: "Free", description: "Free tier with limited features", price_monthly: 0, price_annual: 0, currency: "usd", max_websites: 1, max_members: 3, custom_domains_allowed: false, is_active: true },
  { id: PLAN_LIFETIME_ID, tier: "business", slug: "lifetime", name: "Lifetime", description: "Lifetime access with all features included", price_monthly: 0, price_annual: 0, currency: "usd", max_websites: null, max_members: null, custom_domains_allowed: true, is_active: true },
];

const FEATURE_SEEDS: readonly FeatureSeed[] = [
  { id: FEATURE_IDS.websiteLimit, key: "website_limit", category: "limit", name: "Website Limit", description: "Maximum number of websites", value_type: "number", is_active: true },
  { id: FEATURE_IDS.customDomain, key: "custom_domain", category: "capability", name: "Custom Domain", description: "Allow custom domain publishing", value_type: "boolean", is_active: true },
  { id: FEATURE_IDS.exportAccess, key: "export_access", category: "capability", name: "Export Access", description: "Access to data export", value_type: "boolean", is_active: true },
  { id: FEATURE_IDS.pageBuilder, key: "page_builder", category: "capability", name: "Page Builder", description: "Access to the page builder", value_type: "boolean", is_active: true },
  { id: FEATURE_IDS.formsAccess, key: "forms_access", category: "capability", name: "Forms", description: "Access to forms", value_type: "boolean", is_active: true },
  { id: FEATURE_IDS.seoAccess, key: "seo_access", category: "capability", name: "SEO", description: "Access to SEO tools", value_type: "boolean", is_active: true },
  { id: FEATURE_IDS.analyticsAccess, key: "analytics_access", category: "capability", name: "Analytics", description: "Access to analytics", value_type: "boolean", is_active: true },
];

const ENTITLEMENT_SEEDS: readonly EntitlementSeed[] = [
  { id: "ent_free_website_limit", plan_id: PLAN_FREE_ID, feature_id: FEATURE_IDS.websiteLimit, value: "1" },
  { id: "ent_free_custom_domain", plan_id: PLAN_FREE_ID, feature_id: FEATURE_IDS.customDomain, value: "0" },
  { id: "ent_free_export", plan_id: PLAN_FREE_ID, feature_id: FEATURE_IDS.exportAccess, value: "0" },
  { id: "ent_free_page_builder", plan_id: PLAN_FREE_ID, feature_id: FEATURE_IDS.pageBuilder, value: "1" },
  { id: "ent_free_forms", plan_id: PLAN_FREE_ID, feature_id: FEATURE_IDS.formsAccess, value: "1" },
  { id: "ent_free_seo", plan_id: PLAN_FREE_ID, feature_id: FEATURE_IDS.seoAccess, value: "0" },
  { id: "ent_free_analytics", plan_id: PLAN_FREE_ID, feature_id: FEATURE_IDS.analyticsAccess, value: "0" },
  { id: "ent_lifetime_website_limit", plan_id: PLAN_LIFETIME_ID, feature_id: FEATURE_IDS.websiteLimit, value: "999999" },
  { id: "ent_lifetime_custom_domain", plan_id: PLAN_LIFETIME_ID, feature_id: FEATURE_IDS.customDomain, value: "1" },
  { id: "ent_lifetime_export", plan_id: PLAN_LIFETIME_ID, feature_id: FEATURE_IDS.exportAccess, value: "1" },
  { id: "ent_lifetime_page_builder", plan_id: PLAN_LIFETIME_ID, feature_id: FEATURE_IDS.pageBuilder, value: "1" },
  { id: "ent_lifetime_forms", plan_id: PLAN_LIFETIME_ID, feature_id: FEATURE_IDS.formsAccess, value: "1" },
  { id: "ent_lifetime_seo", plan_id: PLAN_LIFETIME_ID, feature_id: FEATURE_IDS.seoAccess, value: "1" },
  { id: "ent_lifetime_analytics", plan_id: PLAN_LIFETIME_ID, feature_id: FEATURE_IDS.analyticsAccess, value: "1" },
];

export async function seedPlansAndFeatures(db: DrizzleDB, logger?: Logger): Promise<SeedResult> {
  let plansUpserted = 0;
  let featuresUpserted = 0;
  let entitlementsUpserted = 0;

  for (const plan of PLAN_SEEDS) {
    const allPlans = await db.select().from(plans);
    const found = allPlans.find((p: typeof allPlans[number]) => p.id === plan.id);

    if (found) {
      await db.update(plans).set({
        tier: plan.tier, slug: plan.slug, name: plan.name, description: plan.description,
        price_monthly: plan.price_monthly, price_annual: plan.price_annual, currency: plan.currency,
        max_websites: plan.max_websites, max_members: plan.max_members,
        custom_domains_allowed: plan.custom_domains_allowed, is_active: plan.is_active,
        updated_at: new Date(),
      }).where(eq(plans.id, plan.id));
      plansUpserted++;
    } else {
      await db.insert(plans).values({
        id: plan.id, tier: plan.tier, slug: plan.slug, name: plan.name, description: plan.description,
        price_monthly: plan.price_monthly, price_annual: plan.price_annual, currency: plan.currency,
        max_websites: plan.max_websites, max_members: plan.max_members,
        custom_domains_allowed: plan.custom_domains_allowed, is_active: plan.is_active, version: 1,
      });
      plansUpserted++;
    }
  }

  for (const feature of FEATURE_SEEDS) {
    const allFeatures = await db.select().from(features);
    const found = allFeatures.find((f: typeof allFeatures[number]) => f.id === feature.id);

    if (found) {
      await db.update(features).set({
        key: feature.key, category: feature.category, name: feature.name, description: feature.description,
        value_type: feature.value_type, is_active: feature.is_active, updated_at: new Date(),
      }).where(eq(features.id, feature.id));
      featuresUpserted++;
    } else {
      await db.insert(features).values({
        id: feature.id, key: feature.key, category: feature.category, name: feature.name, description: feature.description,
        value_type: feature.value_type, is_active: feature.is_active, version: 1,
      });
      featuresUpserted++;
    }
  }

  for (const ent of ENTITLEMENT_SEEDS) {
    const allEnts = await db.select().from(planFeatureEntitlements);
    const found = allEnts.find((e: typeof allEnts[number]) => e.id === ent.id);

    if (found) {
      await db.update(planFeatureEntitlements).set({
        value: ent.value, updated_at: new Date(),
      }).where(eq(planFeatureEntitlements.id, ent.id));
      entitlementsUpserted++;
    } else {
      await db.insert(planFeatureEntitlements).values({
        id: ent.id, plan_id: ent.plan_id, feature_id: ent.feature_id, value: ent.value,
      });
      entitlementsUpserted++;
    }
  }

  logger?.info?.("Seed complete", { plansUpserted, featuresUpserted, entitlementsUpserted });
  return { plansUpserted, featuresUpserted, entitlementsUpserted };
}

export { PLAN_FREE_ID, PLAN_LIFETIME_ID, FEATURE_IDS };
