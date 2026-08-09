import type { UserId, AuthSubjectId, ISODateString } from "../../shared";
import type { UserDraft, DraftVersion } from "./draft";
export interface CreateUserDraftInput {
    readonly id: UserId;
    readonly authSubjectId: AuthSubjectId;
    readonly email: string;
    readonly displayName: string;
    readonly now: ISODateString;
}
export declare function createUserDraft(input: CreateUserDraftInput): UserDraft;
export type { DraftVersion };
//# sourceMappingURL=factory.d.ts.map