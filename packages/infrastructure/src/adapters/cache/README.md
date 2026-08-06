# Cache Adapter

> **Status:** Contracts only. No implementation in this milestone.

## Purpose

The `CacheAdapter` represents the capability to store and retrieve cached
values with TTLs. Query use cases use it to cache read models and avoid
redundant database queries. A future implementation may back this with Redis,
in-memory LRU, or Supabase edge cache.

## Planned contracts

- **`CacheAdapter`** — get, set, delete, expire, exists.
- **`CacheEntry`** — a cached value with its TTL and metadata.

## Principles

1. **The adapter is provider-agnostic.** It uses generic key-value shapes
   with string keys and serializable values.
2. **Cache keys are namespaced.** Keys include a context prefix (e.g.
   `pages:`, `media:`) to avoid collisions and enable bulk invalidation.
3. **Cache is optional.** If no cache adapter is configured, use cases fall
   back to direct repository reads. Cache is a performance optimization, not
   a correctness dependency.
4. **TTLs are explicit.** Every `set` includes a TTL. No infinite caching.
