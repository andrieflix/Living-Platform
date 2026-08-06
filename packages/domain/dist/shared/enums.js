/**
 * Enumerations shared by more than one bounded context.
 * Context-specific enums live in their own context folders.
 */
export var PlanTier;
(function (PlanTier) {
    PlanTier["Starter"] = "starter";
    PlanTier["Pro"] = "pro";
    PlanTier["Business"] = "business";
    PlanTier["Enterprise"] = "enterprise";
})(PlanTier || (PlanTier = {}));
export var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["Trialing"] = "trialing";
    SubscriptionStatus["Active"] = "active";
    SubscriptionStatus["PastDue"] = "past_due";
    SubscriptionStatus["Canceled"] = "canceled";
    SubscriptionStatus["Incomplete"] = "incomplete";
})(SubscriptionStatus || (SubscriptionStatus = {}));
export var FeatureCategory;
(function (FeatureCategory) {
    FeatureCategory["Limit"] = "limit";
    FeatureCategory["Capability"] = "capability";
    FeatureCategory["Addon"] = "addon";
})(FeatureCategory || (FeatureCategory = {}));
export var ResourceType;
(function (ResourceType) {
    ResourceType["Organization"] = "organization";
    ResourceType["Website"] = "website";
    ResourceType["Page"] = "page";
    ResourceType["Section"] = "section";
    ResourceType["Media"] = "media";
    ResourceType["Folder"] = "folder";
    ResourceType["Form"] = "form";
    ResourceType["Submission"] = "submission";
    ResourceType["Theme"] = "theme";
    ResourceType["User"] = "user";
    ResourceType["Membership"] = "membership";
    ResourceType["ExportJob"] = "export_job";
})(ResourceType || (ResourceType = {}));
//# sourceMappingURL=enums.js.map