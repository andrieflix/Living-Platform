/**
 * Shared policy engine contracts.
 *
 * These types define the shape of every policy in the platform. Policies are
 * provider-independent, deterministic, and depend only on their inputs —
 * never on repositories, infrastructure, or runtime services.
 *
 * No implementations in this milestone — architecture only.
 */
import type { DomainError } from "@livingsites/domain";

/** The outcome of a policy evaluation. */
export type PolicyOutcome = "allow" | "deny" | "warn" | "decision";

/** The severity of a policy decision. */
export type PolicySeverity = "hard" | "soft";

/** A single policy decision returned by a policy evaluation. */
export interface PolicyDecision {
  readonly outcome: PolicyOutcome;
  readonly policyName: string;
  readonly severity: PolicySeverity;
  readonly message: string;
  readonly code: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly data?: Readonly<Record<string, unknown>>;
}

/** The result of evaluating a policy or policy chain. */
export interface PolicyResult {
  readonly decisions: readonly PolicyDecision[];
  readonly allowed: boolean;
  readonly warnings: readonly PolicyDecision[];
  readonly denials: readonly PolicyDecision[];
}

/** A reusable, deterministic business policy. */
export interface Policy<TInput extends PolicyInput = PolicyInput> {
  readonly name: string;
  readonly category: string;
  readonly severity: PolicySeverity;
  evaluate(input: TInput): Promise<PolicyDecision>;
}

/** Base input shape for all policies. */
export interface PolicyInput {
  readonly context: PolicyContext;
}

/** Context shared by all policy evaluations. */
export interface PolicyContext {
  readonly orgId?: string;
  readonly websiteId?: string;
  readonly userId?: string;
  readonly plan?: PlanSummary;
  readonly featureFlags?: Readonly<Record<string, boolean>>;
  readonly now: string;
}

/** A minimal plan summary sufficient for policy evaluation. */
export interface PlanSummary {
  readonly planId: string;
  readonly name: string;
  readonly maxWebsites: number;
  readonly maxPagesPerWebsite: number;
  readonly maxStorageBytes: number;
  readonly maxMediaItems: number;
  readonly maxForms: number;
  readonly maxSubmissionsPerForm: number;
  readonly maxConcurrentExports: number;
  readonly maxMembers: number;
  readonly maxPlugins: number;
  readonly maxCustomDomains: number;
  readonly maxFileSize: number;
  readonly maxFieldsPerForm: number;
  readonly maxSubmissionSizeBytes: number;
  readonly spamScoreThreshold: number;
  readonly features: readonly string[];
}

/** A chain of policies evaluated in order. Short-circuits on first hard denial. */
export interface PolicyChain {
  readonly name: string;
  readonly policies: readonly Policy[];
  evaluate(input: PolicyInput): Promise<PolicyResult>;
}

/** A composite policy that combines multiple policies with a merge strategy. */
export interface CompositePolicy extends Policy {
  readonly children: readonly Policy[];
  readonly mergeStrategy: CompositeMergeStrategy;
}

/** How a composite policy merges child decisions. */
export type CompositeMergeStrategy = "all-must-pass" | "any-must-pass" | "first-match";

/** A group of related policies keyed by bounded context. */
export interface PolicyGroup {
  readonly context: string;
  readonly policies: readonly Policy[];
}

/** Common policy error codes re-exported for convenience. */
export type { DomainError };
