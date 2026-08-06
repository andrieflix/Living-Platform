import type { User, Membership, Role, SystemRole, UserId, MembershipId, OrganizationId, PaginatedResult, PaginationParams, AggregateVersion } from "@livingsites/domain";
import type { CreateResult, SaveResult, MutationResult } from "../contracts";
export interface UserListParams extends PaginationParams {
    search?: string;
    status?: "active" | "archived" | "deleted";
}
export interface UserRepository {
    findById(id: UserId): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    list(params: UserListParams): Promise<PaginatedResult<User>>;
    create(candidate: Omit<User, "id" | "audit" | "version">): Promise<CreateResult<User>>;
    save(aggregate: User, expectedVersion: AggregateVersion): Promise<SaveResult<User>>;
    softDelete(id: UserId, expectedVersion: AggregateVersion): Promise<MutationResult>;
}
export interface MembershipListParams extends PaginationParams {
    organizationId?: OrganizationId;
    userId?: UserId;
    role?: SystemRole;
}
export interface MembershipRepository {
    findById(id: MembershipId): Promise<Membership | null>;
    list(params: MembershipListParams): Promise<PaginatedResult<Membership>>;
    findMembership(organizationId: OrganizationId, userId: UserId): Promise<Membership | null>;
    listForUser(userId: UserId): Promise<Membership[]>;
    create(candidate: Omit<Membership, "id" | "audit" | "version">): Promise<CreateResult<Membership>>;
    save(aggregate: Membership, expectedVersion: AggregateVersion): Promise<SaveResult<Membership>>;
    softDelete(id: MembershipId, expectedVersion: AggregateVersion): Promise<MutationResult>;
}
export interface RoleRepository {
    findByKey(key: string): Promise<Role | null>;
    listSystemRoles(): Promise<Role[]>;
    listForOrganization(organizationId: OrganizationId): Promise<Role[]>;
    create(candidate: Omit<Role, "key" | "version">): Promise<CreateResult<Role>>;
    save(aggregate: Role, expectedVersion: AggregateVersion): Promise<SaveResult<Role>>;
}
//# sourceMappingURL=users.d.ts.map