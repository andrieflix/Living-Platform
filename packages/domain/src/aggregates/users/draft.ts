import type {
  UserId,
  AuthSubjectId,
  AuditTrail,
  LifecycleStatus,
  AggregateVersion,
} from "../../shared";
import { INITIAL_AGGREGATE_VERSION } from "../../shared";

export type DraftVersion = AggregateVersion & { readonly __draft: true };

export interface UserDraft {
  readonly id: UserId;
  readonly authSubjectId: AuthSubjectId;
  email: string;
  displayName: string;
  status: LifecycleStatus;
  readonly version: DraftVersion;
  readonly audit: AuditTrail;
}

export const DRAFT_VERSION: DraftVersion = INITIAL_AGGREGATE_VERSION as DraftVersion;
