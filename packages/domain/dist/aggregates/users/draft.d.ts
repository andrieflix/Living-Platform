import type { UserId, AuthSubjectId, AuditTrail, LifecycleStatus, AggregateVersion } from "../../shared";
export type DraftVersion = AggregateVersion & {
    readonly __draft: true;
};
export interface UserDraft {
    readonly id: UserId;
    readonly authSubjectId: AuthSubjectId;
    email: string;
    displayName: string;
    status: LifecycleStatus;
    readonly version: DraftVersion;
    readonly audit: AuditTrail;
}
export declare const DRAFT_VERSION: DraftVersion;
//# sourceMappingURL=draft.d.ts.map