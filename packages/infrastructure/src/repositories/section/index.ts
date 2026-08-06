/**
 * Section repository adapter contract.
 *
 * SectionType is the only aggregate root in this context. Section is a child
 * entity of Page and has no independent repository port — it is persisted
 * through the PageRepositoryAdapter.
 *
 * Contracts only. No implementation in this milestone.
 */
import type {
  SectionTypeRepository,
  SectionTypeRegistry,
} from "@livingsites/application";
import type { DatabaseBackedAdapter } from "../shared";

/**
 * Adapts SectionTypeRepository and SectionTypeRegistry to a database
 * provider. Composes them as named sub-adapters to avoid signature conflicts
 * from extending multiple interfaces with overlapping method names.
 */
export interface SectionRepositoryAdapter extends DatabaseBackedAdapter {
  readonly sectionTypes: SectionTypeRepository;
  readonly registry: SectionTypeRegistry;
}
