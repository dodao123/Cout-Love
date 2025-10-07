// Album cache với TTL (Time To Live)
interface CacheItem<T> {
  data: T;
  expiry: number;
}

class AlbumCache {
  private cache = new Map<string, CacheItem<unknown>>();

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    for (const [key, item] of this.cache.entries()) {
      // Remove expired items
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Clean expired entries periodically
  startCleanup(intervalMs: number = 60 * 1000): void {
    setInterval(() => {
      this.clear();
    }, intervalMs);
  }

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
const albumCache = new AlbumCache();

// Start cleanup process
albumCache.startCleanup(60 * 1000); // Clean every minute

export default albumCache;