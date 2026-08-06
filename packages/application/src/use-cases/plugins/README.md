# Plugins Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `RegisterPlugin` — Register a plugin manifest with the platform (platform-global).
- `UnregisterPlugin` — Remove a plugin from the platform registry.
- `InstallPlugin` — Install a plugin for an organization.
- `UninstallPlugin` — Uninstall a plugin from an org (renders fallbacks).
- `EnablePlugin` — Enable an installed plugin for an org.
- `DisablePlugin` — Disable an installed plugin (preserves content).
- `UpdatePluginConfig` — Change org-level configuration for an installed plugin.

## Queries

- `ListAvailablePlugins`, `GetPlugin`, `ListInstalledPlugins`,
  `GetPluginConfig`.

## Long-running Operations

- `RunPluginMigration` — Execute a plugin's data migration on install/upgrade.

## Background Jobs

- `RunPluginMigrationJob` — Execute `RunPluginMigration` in the background.
- `CleanupUninstalledPlugin` — Remove plugin data after uninstall and retention.

## Events Produced

`PluginRegistered`, `PluginUnregistered`, `PluginInstalled`,
`PluginUninstalled`, `PluginEnabled`, `PluginDisabled`,
`PluginConfigUpdated`.

## Events Consumed

`OrganizationArchived` → disable all plugins installed in the org.

## External Dependencies

Database provider (plugin registry, installation records, config), plugin
sandbox runtime (future).

## Authorization

Platform admin: register/unregister globally. Org `owner`/`admin`: install,
uninstall, enable, disable, configure. Org members: view installed plugins.

## Future Extension Points

Plugin marketplace, per-website plugin scoping, plugin webhooks,
plugin-contributed use cases.

See `docs/use-cases.md` §10 for the full catalog.
