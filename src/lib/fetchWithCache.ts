import clientCache from './clientCache';

interface FetchOptions extends Omit<RequestInit, 'cache'> {
  cache?: boolean;
  cacheTime?: number; // TTL in milliseconds
}

/**
 * Fetch with client-side caching
 * @param url - URL to fetch
 * @param options - Fetch options including caching options
 * @returns Promise with cached or fresh data
 */
export async function fetchWithCache<T = unknown>(
  url: string, 
  options: FetchOptions = {}
): Promise<T> {
  const { cache = true, cacheTime = 5 * 60 * 1000, ...fetchOptions } = options;
  
  // If caching is disabled, just fetch normally
  if (!cache) {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Check cache first
  const cachedData = clientCache.get<T>(url);
  if (cachedData) {
    console.log(`Cache hit for: ${url}`);
    return cachedData;
  }

  console.log(`Cache miss for: ${url}, fetching...`);
  
  // Fetch fresh data
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Cache the fresh data
  clientCache.set(url, data, cacheTime);
  
  return data;
}

/**
 * Invalidate cache for specific URL
 * @param url - URL to invalidate
 */
export function invalidateCache(url: string): void {
  clientCache.delete(url);
  console.log(`Cache invalidated for: ${url}`);
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
  return clientCache.getStats();
}