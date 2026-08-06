# Website Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `CreateWebsite` — Provision a new website under an org with default theme and navigation.
- `UpdateWebsite` — Change website name, description, or settings.
- `UpdateWebsiteSettings` — Change locale, timezone, custom domain, or favicon.
- `AssignCustomDomain` — Map a custom domain to a website.
- `RemoveCustomDomain` — Unmap a custom domain.
- `UpdateNavigation` — Reorder or edit nav items.
- `UpdateTheme` — Change the active theme or theme variables.
- `ArchiveWebsite` — Soft-delete a website.
- `RestoreWebsite` — Restore an archived website within the retention window.

## Queries

- `GetWebsite`, `ListWebsites`, `GetWebsiteSettings`, `GetNavigation`, `GetTheme`.

## Long-running Operations

None.

## Background Jobs

- `PurgeArchivedWebsite` — Hard-delete after retention.
- `VerifyCustomDomain` — Check DNS records for a custom domain.

## Events Produced

`WebsiteCreated`, `WebsiteUpdated`, `WebsiteArchived`, `WebsiteRestored`,
`CustomDomainAssigned`, `CustomDomainRemoved`, `NavigationUpdated`,
`ThemeUpdated`.

## Events Consumed

`OrganizationArchived` → cascade-archive all websites in the org.

## External Dependencies

Database provider, DNS verification service.

## Authorization

Org `owner`/`admin`: create, archive, restore, domains. Website `admin`:
settings. Website `editor`: navigation, theme. Website `viewer`: read.

## Future Extension Points

Multi-domain, theme marketplace, staging environment.

See `docs/use-cases.md` §2 for the full catalog.
