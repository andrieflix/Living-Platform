# Organization Use Cases

> **Status:** Architecture only. No implementation.

## Commands

- `CreateOrganization` — Provision a new org with default plan and owner membership.
- `UpdateOrganization` — Change org name, branding, or settings.
- `InviteMember` — Send an invitation to join the org with a specified role.
- `AcceptInvitation` — Accept a pending invitation, creating a membership.
- `RevokeInvitation` — Cancel a pending invitation.
- `RemoveMember` — Remove a member from the org.
- `ChangeMemberRole` — Change a member's role within the org.
- `UpdatePlan` — Upgrade or downgrade the org's plan.
- `ArchiveOrganization` — Soft-delete an org and all its websites.

## Queries

- `GetOrganization` — Fetch org details by id.
- `ListOrganizations` — List orgs the current user belongs to.
- `ListMembers` — List members of an org with roles.
- `ListPendingInvitations` — List outstanding invitations for an org.
- `GetPlanUsage` — Fetch current plan limits vs. usage.

## Long-running Operations

None.

## Background Jobs

- `PurgeArchivedOrganization` — Hard-delete after retention window.

## Events Produced

`OrganizationCreated`, `OrganizationUpdated`, `OrganizationArchived`,
`MemberInvited`, `MemberAdded`, `MemberRemoved`, `MemberRoleChanged`,
`PlanChanged`.

## Events Consumed

None.

## External Dependencies

Database provider, email provider (invitation emails).

## Authorization

- `owner`: all permissions.
- `admin`: manage members and settings; cannot change plan or delete org.
- `member`: view org info and list members.

## Future Extension Points

SSO providers, org-level feature flags, custom roles.

See `docs/use-cases.md` §1 for the full catalog.
