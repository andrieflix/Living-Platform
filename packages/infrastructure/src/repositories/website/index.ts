/**
 * Website repository adapter contract.
 *
 * Website is the aggregate root; WebsiteSettings is a child entity with no
 * independent repository port. WebsiteSettings is persisted through the
 * WebsiteRepository as part of the Website aggregate.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { WebsiteRepository } from "@livingsites/application";
import type { DatabaseBackedAdapter } from "../shared";

/**
 * Adapts WebsiteRepository to a database provider. WebsiteSettings is
 * persisted atomically with the Website root — no separate adapter needed.
 */
export interface WebsiteRepositoryAdapter extends DatabaseBackedAdapter {
  readonly websites: WebsiteRepository;
}
