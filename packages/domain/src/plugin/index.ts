/**
 * Plugin bounded context — plugin system domain concepts.
 *
 * Reserved for future development. Defines the contracts for how third-party
 * capabilities are registered, installed, and lifecycle-managed. Plugins
 * extend the platform by registering SectionTypes, FormFieldTypes, themes,
 * and adapters — they never modify core entities.
 */
import type {
  OrganizationId,
  MachineKey,
  VersionString,
  AuditTrail,
  LifecycleStatus,
  AggregateVersion,
} from "../shared";

/** A registered plugin package. Platform-level, not org-owned. */
export interface Plugin {
  readonly id: string;
  readonly key: MachineKey;
  name: string;
  description?: string;
  /** Semver of the plugin package. */
  releaseVersion: VersionString;
  /** Minimum platform version required by this plugin. */
  requiresPlatformVersion: VersionString;
  /** What this plugin contributes to the platform. */
  contributions: readonly PluginContribution[];
  /** Feature keys the plugin requires to function (plan-gated). */
  requiresFeatures: readonly string[];
  isActive: boolean;
  /** Optimistic concurrency version. Monotonically incremented on each save. */
  version: AggregateVersion;
  readonly audit: AuditTrail;
}

/** Declarative manifest validated at registration time. */
export interface PluginManifest {
  readonly key: string;
  readonly name: string;
  readonly version: VersionString;
  readonly requiresPlatformVersion: VersionString;
  readonly contributions: readonly PluginContribution[];
  readonly requiresFeatures: readonly string[];
}

/** A single thing a plugin provides. */
export type PluginContribution =
  | { kind: "section_type"; sectionTypeKey: string }
  | { kind: "form_field_type"; fieldTypeKey: string }
  | { kind: "theme"; themeKey: string }
  | { kind: "analytics_adapter"; providerKey: string };

/** A plugin installed on a specific Organization. */
export interface PluginInstallation {
  readonly id: string;
  readonly organizationId: OrganizationId;
  readonly pluginId: string;
  status: PluginLifecycleState;
  /** Per-org configuration opaque to the core; validated by the plugin. */
  config: Readonly<Record<string, unknown>>;
  /** Optimistic concurrency version. Monotonically incremented on each save. */
  version: AggregateVersion;
  readonly audit: AuditTrail;
}

export enum PluginLifecycleState {
  Installed = "installed",
  Enabled = "enabled",
  Disabled = "disabled",
  Uninstalled = "uninstalled",
}

/** Re-export LifecycleStatus so consumers can import it from this context. */
export type { LifecycleStatus };
