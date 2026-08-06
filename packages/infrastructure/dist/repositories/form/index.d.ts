/**
 * Form repository adapter contract.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { FormRepository, SubmissionRepository } from "@livingsites/application";
import type { DatabaseBackedAdapter } from "../shared";
/**
 * Adapts form-related repositories to a database provider.
 * Composes FormRepository and SubmissionRepository as named sub-adapters to
 * avoid signature conflicts from extending multiple interfaces with
 * overlapping method names (e.g. findById).
 */
export interface FormRepositoryAdapter extends DatabaseBackedAdapter {
    readonly forms: FormRepository;
    readonly submissions: SubmissionRepository;
}
//# sourceMappingURL=index.d.ts.map