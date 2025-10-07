import { getCacheStats } from './fetchWithCache';

// Debug function để xem cache stats
export function logCacheStatus() {
  const stats = getCacheStats();
  console.log('📊 Cache Stats:', {
    size: stats.size,
    keys: stats.keys,
    items: stats.items.map(item => ({
      key: item.key.split('/').pop(), // Just show the slug
      age: Math.round(item.age / 1000) + 's ago'
    }))
  });
}

// Add to window for debugging
if (typeof window !== 'undefined') {
  (window as unknown as { cacheDebug: unknown }).cacheDebug = {
    stats: getCacheStats,
    log: logCacheStatus
  };
}