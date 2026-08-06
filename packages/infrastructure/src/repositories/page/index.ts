/**
 * Page repository adapter contract.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { PageRepository, PageSnapshotRepository } from "@livingsites/application";
import type { DatabaseBackedAdapter } from "../shared";

/**
 * Adapts page-related repositories to a database provider.
 * Composes PageRepository and PageSnapshotRepository as named sub-adapters
 * to avoid signature conflicts from extending multiple interfaces with
 * overlapping method names (e.g. findById).
 */
export interface PageRepositoryAdapter extends DatabaseBackedAdapter {
  readonly pages: PageRepository;
  readonly snapshots: PageSnapshotRepository;
}
