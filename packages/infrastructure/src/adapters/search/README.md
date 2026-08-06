# Search Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `SearchAdapter` represents the capability to index, query, and delete
search documents. It enables full-text search across media, pages, and form
submissions. A future implementation may back this with Postgres full-text
search, Meilisearch, or Typesense.

## Planned contracts

- **`SearchAdapter`** — index, query, delete documents.
- **`SearchDocument`** — a document to index (id, fields, metadata).
- **`SearchQuery`** — a query with text, filters, and pagination.
- **`SearchResult`** — matched documents with relevance scores.

## Principles

1. **The adapter is provider-agnostic.** It uses generic document shapes, not
   provider-specific query languages.
2. **Index names are scoped.** Each index is scoped to a context (media,
   pages, submissions) to avoid cross-contamination.
3. **Search is optional.** If no search adapter is configured, search
   features degrade gracefully (fall back to database LIKE queries).
