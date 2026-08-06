/**
 * Users bounded context — identity and organization membership.
 *
 * A User is a platform-level identity. A Membership binds a User to a single
 * Organization with a Role. A User may hold memberships in many Organizations.
 */
import type { UserId, MembershipId, OrganizationId, ISODateString, AuditTrail, LifecycleStatus, AggregateVersion } from "../shared";
/** Platform-level user identity. Not scoped to any single organization. */
export interface User {
    readonly id: UserId;
    /** Unique login email, lowercased. */
    email: string;
    /** Display name shown in UI. */
    displayName: string;
    /** Avatar media reference (optional, points to Media in some org's library). */
    avatarMediaId?: string;
    status: LifecycleStatus;
    /** Timestamp of last successful authentication. */
    lastSeenAt?: ISODateString;
    /** Optimistic concurrency version. Monotonically incremented on each save. */
    version: AggregateVersion;
    readonly audit: AuditTrail;
}
/**
 * Bindng of a User to an Organization with a granted Role.
 * A User's effective permissions within an Organization come from their
 * Memberships — never from a global role field on User.
 */
export interface Membership {
    readonly id: MembershipId;
    readonly organizationId: OrganizationId;
    readonly userId: UserId;
    role: RoleValue;
    /** Optional scope to a single website within the org; null = org-wide. */
    websiteScopeId?: string | null;
    status: LifecycleStatus;
    /** Optimistic concurrency version. Monotonically incremented on each save. */
    version: AggregateVersion;
    readonly audit: AuditTrail;
}
/**
 * A named bundle of permissions. Roles are platform-defined (Owner, Admin,
 * Editor, Author, Viewer) or organization-defined custom roles in the future.
 */
export interface Role {
    readonly key: MachineKeyRole;
    name: string;
    description?: string;
    /** Ordered permission keys granted by this role. */
    permissions: readonly string[];
    isSystem: boolean;
    /** Optimistic concurrency version. Monotonically incremented on each save. */
    version: AggregateVersion;
}
import type { MachineKey } from "../shared";
type MachineKeyRole = MachineKey;
type RoleValue = `${SystemRole}`;
export declare enum SystemRole {
    Owner = "owner",
    Admin = "admin",
    Editor = "editor",
    Author = "author",
    Viewer = "viewer"
}
export {};
//# sourceMappingURL=types.d.ts.map