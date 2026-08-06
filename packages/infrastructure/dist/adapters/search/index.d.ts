/**
 * Search adapter contracts — provider-agnostic full-text search capability.
 *
 * Contracts only. No implementation in this milestone.
 */
import type { Logger } from "@livingsites/platform";
/** A full-text search adapter: index, query, delete. */
export interface SearchAdapter {
    index(indexName: string, document: SearchDocument): Promise<void>;
    indexBatch(indexName: string, documents: readonly SearchDocument[]): Promise<void>;
    query(indexName: string, query: SearchQuery): Promise<SearchResult>;
    delete(indexName: string, documentId: string): Promise<void>;
    readonly logger: Logger;
}
export interface SearchDocument {
    readonly id: string;
    readonly fields: Readonly<Record<string, string | number | boolean>>;
    readonly metadata?: Readonly<Record<string, string>>;
}
export interface SearchQuery {
    readonly text: string;
    readonly filters?: Readonly<Record<string, string>>;
    readonly limit?: number;
    readonly offset?: number;
}
export interface SearchResult {
    readonly documents: readonly SearchDocument[];
    readonly total: number;
    readonly scores: readonly number[];
}
//# sourceMappingURL=index.d.ts.map