/**
 * Simple in-memory cache hook for API responses
 * Reduces redundant API calls for frequently accessed data
 */

import { useRef, useCallback } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
}

export function useCache<T>(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000 } = options; // 5 minutes default
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback(
    (key: string): T | null => {
      const entry = cache.current.get(key);
      if (!entry) return null;

      const now = Date.now();
      if (now - entry.timestamp > ttl) {
        cache.current.delete(key);
        return null;
      }

      return entry.data;
    },
    [ttl]
  );

  const set = useCallback((key: string, data: T) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  const invalidate = useCallback((key: string) => {
    cache.current.delete(key);
  }, []);

  const invalidateAll = useCallback(() => {
    cache.current.clear();
  }, []);

  return { get, set, invalidate, invalidateAll };
}
