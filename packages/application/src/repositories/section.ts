import type {
  SectionType,
  SectionTypeId,
  PaginatedResult,
  PaginationParams,
  AggregateVersion,
} from "@livingsites/domain";
import type {
  CreateResult,
  SaveResult,
} from "../contracts";

export interface SectionTypeListParams extends PaginationParams {
  category?: string;
  isActive?: boolean;
}

export interface SectionTypeRepository {
  findById(id: SectionTypeId): Promise<SectionType | null>;
  findByKey(key: string): Promise<SectionType | null>;
  listAll(): Promise<SectionType[]>;
  listActive(): Promise<SectionType[]>;
  list(params: SectionTypeListParams): Promise<PaginatedResult<SectionType>>;
  create(candidate: Omit<SectionType, "id" | "audit" | "version">): Promise<CreateResult<SectionType>>;
  save(aggregate: SectionType, expectedVersion: AggregateVersion): Promise<SaveResult<SectionType>>;
}

export interface SectionTypeRegistry {
  register(candidate: Omit<SectionType, "id" | "audit" | "version">): Promise<CreateResult<SectionType>>;
  unregister(key: string): Promise<SaveResult<void>>;
  resolve(key: string): Promise<SectionType | null>;
  listAvailable(): Promise<SectionType[]>;
}
