/**
 * Media repository adapter contract.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { MediaRepository, FolderRepository } from "@livingsites/application";
import type { DatabaseBackedAdapter } from "../shared";
/**
 * Adapts media-related repositories to database + storage providers.
 * Composes MediaRepository and FolderRepository as named sub-adapters to
 * avoid signature conflicts from extending multiple interfaces with
 * overlapping method names (e.g. findById, save).
 */
export interface MediaRepositoryAdapter extends DatabaseBackedAdapter {
    readonly media: MediaRepository;
    readonly folders: FolderRepository;
}
//# sourceMappingURL=index.d.ts.map