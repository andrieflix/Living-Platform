/**
 * Feature flags module — dynamic runtime feature-flag contract.
 *
 * Contracts only. No implementation in this milestone.
 */

export type FlagKey = string;

export interface FlagContext {
  readonly organizationId?: string;
  readonly websiteId?: string;
  readonly userId?: string;
  readonly locale?: string;
}

export interface FlagResolution {
  readonly enabled: boolean;
  readonly variant?: string;
  readonly reason: FlagReason;
}

export type FlagReason =
  | "default"
  | "override"
  | "rule_match"
  | "targeted"
  | "error";

export interface FeatureFlagProvider {
  evaluate(key: FlagKey, context: FlagContext): Promise<FlagResolution>;
  evaluateSync(key: FlagKey, context: FlagContext): FlagResolution;
  isEnabled(key: FlagKey, context: FlagContext): Promise<boolean>;
}
