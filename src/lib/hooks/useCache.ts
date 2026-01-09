/**
 * Simple in-memory cache for API responses
 * Reduces redundant API calls for frequently accessed data
 * Uses module-level singleton to persist across renders
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Module-level cache singleton (persists across component renders)
const globalCache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const appCache = {
  get<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
    const entry = globalCache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > ttl) {
      globalCache.delete(key);
      return null;
    }

    return entry.data;
  },

  set<T>(key: string, data: T): void {
    globalCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  invalidate(key: string): void {
    globalCache.delete(key);
  },

  invalidateAll(): void {
    globalCache.clear();
  },
};
