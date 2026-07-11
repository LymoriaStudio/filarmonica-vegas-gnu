/**
 * Simple in-memory cache for Supabase data.
 * Survives tab switches (component unmount/remount) but is cleared on page reload.
 * Call invalidate(key) after any mutation so the next mount re-fetches.
 */

const cache = new Map<string, unknown>();

export const dataCache = {
  get<T>(key: string): T | undefined {
    return cache.get(key) as T | undefined;
  },
  set<T>(key: string, data: T): void {
    cache.set(key, data);
  },
  has(key: string): boolean {
    return cache.has(key);
  },
  invalidate(key: string): void {
    cache.delete(key);
  },
  invalidateMany(...keys: string[]): void {
    keys.forEach(k => cache.delete(k));
  },
};
