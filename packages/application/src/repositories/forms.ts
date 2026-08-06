import type {
  Form,
  Submission,
  SubmissionStatus,
  FormId,
  SubmissionId,
  WebsiteId,
  PaginatedResult,
  PaginationParams,
  AggregateVersion,
} from "@livingsites/domain";
import type {
  CreateResult,
  SaveResult,
  MutationResult,
} from "../contracts";

export interface FormListParams extends PaginationParams {
  websiteId?: WebsiteId;
  search?: string;
}

/**
 * Owns the Form aggregate root, including its FormField child entities.
 * FormFields are loaded, mutated, and persisted atomically through the
 * Form root. There is no standalone FormFieldRepository — form fields
 * have no public repository port.
 *
 * `create` persists a new Form. `save` mutates an existing Form and
 * requires expectedVersion. A successful save increments Form.version
 * exactly once — even if multiple fields changed.
 */
export interface FormRepository {
  findById(id: FormId): Promise<Form | null>;
  findByKey(websiteId: WebsiteId, key: string): Promise<Form | null>;
  list(params: FormListParams): Promise<PaginatedResult<Form>>;
  create(candidate: Omit<Form, "id" | "audit" | "version">): Promise<CreateResult<Form>>;
  save(aggregate: Form, expectedVersion: AggregateVersion): Promise<SaveResult<Form>>;
  softDelete(id: FormId, expectedVersion: AggregateVersion): Promise<MutationResult>;
}

export interface SubmissionListParams extends PaginationParams {
  formId?: FormId;
  websiteId?: WebsiteId;
  status?: SubmissionStatus;
  from?: string;
  to?: string;
}

/**
 * Submission is an aggregate root with append-only payload but mutable status.
 * The `values` and `meta` fields are immutable after creation.
 *
 * `create` (formerly `append`) creates a new submission. It does NOT require
 * expectedVersion — it is a creation operation. The candidate is logically
 * version 0; the returned aggregate has version 1.
 *
 * `updateStatus` is a mutation that requires expectedVersion because status
 * transitions can conflict when two staff members act on the same submission
 * concurrently.
 */
export interface SubmissionRepository {
  findById(id: SubmissionId): Promise<Submission | null>;
  list(params: SubmissionListParams): Promise<PaginatedResult<Submission>>;
  create(candidate: Omit<Submission, "id" | "audit" | "version"> & { status?: SubmissionStatus }): Promise<CreateResult<Submission>>;
  updateStatus(id: SubmissionId, status: SubmissionStatus, expectedVersion: AggregateVersion): Promise<SaveResult<Submission>>;
  delete(id: SubmissionId): Promise<MutationResult>;
}
