# Website Policies

> **Status:** Architecture only. No implementation.

## Purpose

Govern website lifecycle and configuration constraints.

## Policies

| Policy | Severity | Summary |
|---|---|---|
| `WebsiteActivePolicy` | hard | Deny if the website is archived. |
| `WebsiteOwnershipPolicy` | hard | Deny if the website does not belong to the specified org. |
| `SingleHomepagePolicy` | hard | Deny if setting a homepage would result in two homepages. |
| `CustomDomainAvailabilityPolicy` | hard | Deny if domain is mapped elsewhere or plan doesn't allow custom domains. |
| `DomainFormatPolicy` | hard | Deny if the domain string is malformed or uses a reserved TLD. |
| `WebsiteDeletePolicy` | soft | Warn if the website has published pages (data loss risk). |
| `ArchiveRetentionPolicy` | hard | Deny restore if the retention window has expired. |

## Inputs

`websiteId`, `orgId`, `plan`, `Website` entity, `domain` string.

## Evaluation

Synchronous. Reads from the `Website` entity and plan passed as input. No
repository access.

See `docs/policies.md` §2 for the full catalog.
