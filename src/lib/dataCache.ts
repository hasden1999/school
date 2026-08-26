/**
 * Ultra-Fast In-Memory + IndexedDB SWR (Stale-While-Revalidate) Caching Engine
 * Enables instant (0ms) page navigation between system sections.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-Memory Global Store (Persists across client-side route navigations)
const memoryStore = new Map<string, CacheEntry<any>>();

export function getMemoryData<T>(key: string): T | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  return entry.data as T;
}

export function setMemoryData<T>(key: string, data: T): void {
  memoryStore.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearMemoryCache(key?: string): void {
  if (key) {
    memoryStore.delete(key);
  } else {
    memoryStore.clear();
  }
}

/**
 * Executes a fast load pipeline:
 * 1. Return in-memory cache instantly (0ms) if present.
 * 2. If not in memory, fetch from IndexedDB (~3-8ms) and return.
 * 3. In background, execute server action, update memory + IndexedDB, and call onFreshData.
 */
export async function fastLoad<T>({
  cacheKey,
  indexedDbLoader,
  serverFetcher,
  onCachedData,
  onFreshData,
  onIndexedDbPersist,
}: {
  cacheKey: string;
  indexedDbLoader?: () => Promise<T | null>;
  serverFetcher: () => Promise<{ success: boolean; [key: string]: any }>;
  onCachedData?: (data: T) => void;
  onFreshData?: (data: T) => void;
  onIndexedDbPersist?: (data: T) => Promise<void> | void;
}): Promise<T | null> {
  // Step 1: Check In-Memory Store (Instant 0ms)
  const memData = getMemoryData<T>(cacheKey);
  if (memData) {
    if (onCachedData) onCachedData(memData);

    // Revalidate in background without blocking UI
    silentRevalidate(cacheKey, serverFetcher, onFreshData, onIndexedDbPersist);
    return memData;
  }

  // Step 2: Check IndexedDB (3-8ms)
  if (indexedDbLoader) {
    try {
      const idbData = await indexedDbLoader();
      if (idbData) {
        setMemoryData(cacheKey, idbData);
        if (onCachedData) onCachedData(idbData);

        // Revalidate in background without blocking UI
        silentRevalidate(cacheKey, serverFetcher, onFreshData, onIndexedDbPersist);
        return idbData;
      }
    } catch (e) {
      console.warn(`[fastLoad] Error reading IndexedDB for ${cacheKey}:`, e);
    }
  }

  // Step 3: First-time cold fetch (no cache available)
  try {
    const res = await serverFetcher();
    if (res && res.success) {
      const data = res as unknown as T;
      setMemoryData(cacheKey, data);
      if (onFreshData) onFreshData(data);

      // Async background IndexedDB persist (non-blocking)
      if (onIndexedDbPersist) {
        Promise.resolve(onIndexedDbPersist(data)).catch((err) =>
          console.warn(`[fastLoad] Background IDB persist failed:`, err)
        );
      }
      return data;
    }
  } catch (err) {
    console.error(`[fastLoad] Server fetch failed for ${cacheKey}:`, err);
  }

  return null;
}

/**
 * Background silent revalidator (does not throw or block)
 */
async function silentRevalidate<T>(
  cacheKey: string,
  serverFetcher: () => Promise<{ success: boolean; [key: string]: any }>,
  onFreshData?: (data: T) => void,
  onIndexedDbPersist?: (data: T) => Promise<void> | void
) {
  if (typeof window === "undefined" || !navigator.onLine) return;

  try {
    const res = await serverFetcher();
    if (res && res.success) {
      const freshData = res as unknown as T;
      setMemoryData(cacheKey, freshData);
      if (onFreshData) onFreshData(freshData);

      // Non-blocking IndexedDB persistence
      if (onIndexedDbPersist) {
        Promise.resolve(onIndexedDbPersist(freshData)).catch(() => {});
      }
    }
  } catch {
    // Silently retain stale cache
  }
}
