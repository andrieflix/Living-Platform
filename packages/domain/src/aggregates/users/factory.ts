import type {
  UserId,
  AuthSubjectId,
  ISODateString,
  AuditTrail,
  LifecycleStatus,
} from "../../shared";
import type { UserDraft, DraftVersion } from "./draft";
import { DRAFT_VERSION } from "./draft";

export interface CreateUserDraftInput {
  readonly id: UserId;
  readonly authSubjectId: AuthSubjectId;
  readonly email: string;
  readonly displayName: string;
  readonly now: ISODateString;
}

export function createUserDraft(input: CreateUserDraftInput): UserDraft {
  const audit: AuditTrail = {
    createdAt: input.now,
    updatedAt: input.now,
  };

  return {
    id: input.id,
    authSubjectId: input.authSubjectId,
    email: input.email,
    displayName: input.displayName,
    status: "active" as LifecycleStatus,
    version: DRAFT_VERSION,
    audit,
  };
}

export type { DraftVersion };
