import type { Logger } from "@livingsites/platform";
import type { DrizzleDB } from "./drizzle-instance";
export interface SeedResult {
    readonly plansUpserted: number;
    readonly featuresUpserted: number;
    readonly entitlementsUpserted: number;
}
declare const PLAN_FREE_ID = "plan_free";
declare const PLAN_LIFETIME_ID = "plan_lifetime";
declare const FEATURE_IDS: {
    readonly websiteLimit: "feat_website_limit";
    readonly customDomain: "feat_custom_domain";
    readonly exportAccess: "feat_export_access";
    readonly pageBuilder: "feat_page_builder";
    readonly formsAccess: "feat_forms_access";
    readonly seoAccess: "feat_seo_access";
    readonly analyticsAccess: "feat_analytics_access";
};
export declare function seedPlansAndFeatures(db: DrizzleDB, logger?: Logger): Promise<SeedResult>;
export { PLAN_FREE_ID, PLAN_LIFETIME_ID, FEATURE_IDS };
//# sourceMappingURL=seed.d.ts.map