/**
 * Enumerations shared by more than one bounded context.
 * Context-specific enums live in their own context folders.
 */

export enum PlanTier {
  Starter = "starter",
  Pro = "pro",
  Business = "business",
  Enterprise = "enterprise",
}

export enum SubscriptionStatus {
  Trialing = "trialing",
  Active = "active",
  PastDue = "past_due",
  Canceled = "canceled",
  Incomplete = "incomplete",
}

export enum FeatureCategory {
  Limit = "limit",
  Capability = "capability",
  Addon = "addon",
}

export enum ResourceType {
  Organization = "organization",
  Website = "website",
  Page = "page",
  Section = "section",
  Media = "media",
  Folder = "folder",
  Form = "form",
  Submission = "submission",
  Theme = "theme",
  User = "user",
  Membership = "membership",
  ExportJob = "export_job",
}
