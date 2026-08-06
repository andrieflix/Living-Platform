import type { Membership, SystemRole, MembershipId, OrganizationId, Result, DomainError } from "@livingsites/domain";
export interface MembershipService {
    inviteUser(organizationId: OrganizationId, email: string, role: SystemRole, websiteScopeId?: string | null): Promise<Result<Membership, DomainError>>;
    assignRole(membershipId: MembershipId, role: SystemRole): Promise<Result<Membership, DomainError>>;
    revokeMembership(membershipId: MembershipId): Promise<Result<void, DomainError>>;
    resolvePermissions(organizationId: OrganizationId, userId: string): Promise<Result<readonly string[], DomainError>>;
    can(organizationId: OrganizationId, userId: string, permission: string): Promise<boolean>;
}
//# sourceMappingURL=membership.d.ts.map