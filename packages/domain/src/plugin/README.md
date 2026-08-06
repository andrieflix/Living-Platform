# Plugin Bounded Context

> **Status:** Reserved. Contracts only — no implementation.

## Future Responsibilities

The Plugin context models the **plugin system**: how third-party capabilities
are registered, scoped, lifecycle-managed, and surfaced into the platform.
Plugins extend the platform primarily by registering **SectionTypes** and
**FormFieldTypes**, but may also contribute themes, analytics adapters, and
domain widgets.

This is the primary extensibility vector for Living Sites. The architecture
must support plugins such as:

- **Blog** — content collections, article pages, RSS, author profiles.
- **Careers** — job postings, application forms, job categories.
- **FAQ** — question/answer sections, accordion rendering, structured data.
- **Testimonials** — testimonial sections, moderation, rotation widgets.
- **Gallery** — album/folder sections, lightbox rendering, masonry layouts.
- **Pricing Tables** — tiered pricing sections, feature comparison, CTAs.
- **Custom Widgets** — arbitrary registered SectionTypes with custom schemas.

## Planned Entities

- **Plugin** — a registered plugin package with a manifest, version, and
  declared contributions (section types, form field types, themes, adapters).
- **PluginManifest** — declarative description of what the plugin contributes
  and requires (platform version, feature keys, permissions).
- **PluginContribution** — a single thing a plugin provides (e.g. one
  SectionType registration).
- **PluginInstallation** — a plugin installed on a specific Organization,
  with enabled/disabled state and configuration.
- **PluginLifecycleState** — `registered → installed → enabled → disabled →
  uninstalled`.

## Plugin Lifecycle

1. **Register** — a plugin package is registered with the platform (platform-
   level, not org-level). Its manifest is validated.
2. **Install** — an Organization installs the plugin. Contributions become
   available to that org's websites.
3. **Enable / Disable** — per-organization toggle. Disabled plugins' section
   types are hidden from the builder but existing instances are preserved.
4. **Uninstall** — removes the plugin from the org. Existing content using the
   plugin's section types is retained but rendered with a fallback.
5. **Upgrade** — plugin version change. The platform validates compatibility
   via the manifest's `requiresPlatformVersion` and contribution versioning.

## Boundaries

- Plugins **extend**, they do not **modify core**. A plugin cannot alter
  existing SectionType schemas or core entities.
- Plugin-contributed SectionTypes go through the same `SectionTypeRegistry`
  as platform ones — no parallel registration path.
- Plugins are **sandboxed at the contract level**: they declare what they
  contribute and require; the platform enforces the manifest.
- Plugin configuration is per-Organization (`PluginInstallation`), not
  per-website, but a plugin may choose to scope its features per-website.
