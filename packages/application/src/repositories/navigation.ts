import type {
  Navigation,
  WebsiteId,
  AggregateVersion,
} from "@livingsites/domain";
import type {
  CreateResult,
  SaveResult,
  MutationResult,
} from "../contracts";

/**
 * Owns the Navigation aggregate root, including its MenuItem child entities.
 * MenuItems are loaded, mutated, and persisted atomically through the
 * Navigation root. There is no standalone MenuItemRepository — menu items
 * have no public repository port.
 *
 * `create` persists a new Navigation. `save` mutates an existing Navigation
 * and requires expectedVersion. A successful save increments Navigation.version
 * exactly once — even if multiple menu items changed.
 */
export interface NavigationRepository {
  findByWebsite(websiteId: WebsiteId): Promise<Navigation[]>;
  findByKey(websiteId: WebsiteId, key: string): Promise<Navigation | null>;
  create(candidate: Omit<Navigation, "id" | "audit" | "version">): Promise<CreateResult<Navigation>>;
  save(aggregate: Navigation, expectedVersion: AggregateVersion): Promise<SaveResult<Navigation>>;
  delete(id: string, expectedVersion: AggregateVersion): Promise<MutationResult>;
}
