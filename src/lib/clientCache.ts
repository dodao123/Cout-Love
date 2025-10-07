// Client-side cache với TTL cho React components
interface CacheItem<T> {
  data: T;
  expiry: number;
  timestamp: number;
}

class ClientCache {
  private cache = new Map<string, CacheItem<unknown>>();

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { 
      data, 
      expiry,
      timestamp: Date.now()
    });
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

  // Get cache stats for debugging
  getStats(): { size: number; keys: string[]; items: Array<{key: string, age: number}> } {
    const now = Date.now();
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      items: Array.from(this.cache.entries()).map(([key, item]) => ({
        key,
        age: now - item.timestamp
      }))
    };
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

// Singleton instance
const clientCache = new ClientCache();

// Clean up expired entries periodically
setInterval(() => {
  clientCache.clear();
}, 60 * 1000); // Clean every minute

export default clientCache;