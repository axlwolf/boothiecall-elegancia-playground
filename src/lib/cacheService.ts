// Cache API service for BoothieCall Elegancia Playground
// Handles static assets, templates, and resource caching with TTL and invalidation

import {
  CacheEntry,
  CacheConfig,
  StorageMetadata,
  PersistenceError
} from '@/types/persistence';

const DEFAULT_CACHE_NAME = 'boothie-call-cache-v1';
const METADATA_CACHE_NAME = 'boothie-call-metadata-v1';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
  compression?: boolean;
}

export interface CacheStats {
  totalSize: number;
  itemCount: number;
  hitRate: number;
  missRate: number;
  oldestEntry: string;
  newestEntry: string;
}

export class CacheService {
  private static instance: CacheService;
  private config: CacheConfig;
  private hitCount: number = 0;
  private missCount: number = 0;

  private constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxSize: MAX_CACHE_SIZE,
      defaultTTL: DEFAULT_TTL,
      enableCompression: false,
      enableEncryption: false,
      ...config
    };
  }

  static getInstance(config?: Partial<CacheConfig>): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config);
    }
    return CacheService.instance;
  }

  /**
   * Check if Cache API is supported
   */
  isSupported(): boolean {
    return 'caches' in window;
  }

  /**
   * Get cache instance
   */
  private async getCache(cacheName: string = DEFAULT_CACHE_NAME): Promise<Cache> {
    if (!this.isSupported()) {
      throw new PersistenceError('Cache API not supported', 'CACHE_NOT_SUPPORTED');
    }
    return await caches.open(cacheName);
  }

  /**
   * Get metadata cache instance
   */
  private async getMetadataCache(): Promise<Cache> {
    return await this.getCache(METADATA_CACHE_NAME);
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string, prefix: string = 'asset'): string {
    return `boothie-${prefix}-${key}`;
  }

  /**
   * Create cache entry metadata
   */
  private createMetadata(options?: CacheOptions): StorageMetadata {
    const now = new Date().toISOString();
    return {
      version: 1,
      createdAt: now,
      updatedAt: now,
      size: 0
    };
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(metadata: StorageMetadata, ttl: number): boolean {
    const expiryTime = new Date(metadata.createdAt).getTime() + ttl;
    return Date.now() > expiryTime;
  }

  /**
   * Store data in cache with metadata
   */
  async set(
    key: string, 
    data: string | Blob | Response, 
    options?: CacheOptions
  ): Promise<void> {
    try {
      const cache = await this.getCache();
      const metadataCache = await this.getMetadataCache();
      const cacheKey = this.generateKey(key);
      
      // Create response object
      let response: Response;
      if (data instanceof Response) {
        response = data.clone();
      } else if (data instanceof Blob) {
        response = new Response(data);
      } else {
        response = new Response(data, {
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      // Add cache headers
      const headers = new Headers(response.headers);
      headers.set('X-Cache-Timestamp', Date.now().toString());
      headers.set('X-Cache-TTL', (options?.ttl || this.config.defaultTTL).toString());
      
      if (options?.tags) {
        headers.set('X-Cache-Tags', options.tags.join(','));
      }

      const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });

      // Store in cache
      await cache.put(cacheKey, cachedResponse);

      // Store metadata
      const metadata: CacheEntry = {
        key: cacheKey,
        data: null, // Data is stored in the main cache
        metadata: this.createMetadata(options),
        ttl: options?.ttl || this.config.defaultTTL,
        tags: options?.tags || []
      };

      await metadataCache.put(
        `metadata-${cacheKey}`, 
        new Response(JSON.stringify(metadata))
      );

      // Check cache size and cleanup if necessary
      await this.cleanupIfNeeded();

    } catch (error) {
      throw new PersistenceError(
        `Failed to cache item with key: ${key}`,
        'CACHE_SET_ERROR',
        error
      );
    }
  }

  /**
   * Get data from cache
   */
  async get(key: string): Promise<Response | null> {
    try {
      const cache = await this.getCache();
      const metadataCache = await this.getMetadataCache();
      const cacheKey = this.generateKey(key);
      
      // Get cached response
      const cachedResponse = await cache.match(cacheKey);
      if (!cachedResponse) {
        this.missCount++;
        return null;
      }

      // Get metadata
      const metadataResponse = await metadataCache.match(`metadata-${cacheKey}`);
      if (metadataResponse) {
        const metadata: CacheEntry = await metadataResponse.json();
        
        // Check if expired
        if (this.isExpired(metadata.metadata, metadata.ttl)) {
          await this.delete(key);
          this.missCount++;
          return null;
        }
      }

      this.hitCount++;
      return cachedResponse;

    } catch (error) {
      this.missCount++;
      console.error(`Failed to get cached item with key: ${key}`, error);
      return null;
    }
  }

  /**
   * Get cached data as text
   */
  async getText(key: string): Promise<string | null> {
    const response = await this.get(key);
    return response ? await response.text() : null;
  }

  /**
   * Get cached data as blob
   */
  async getBlob(key: string): Promise<Blob | null> {
    const response = await this.get(key);
    return response ? await response.blob() : null;
  }

  /**
   * Get cached data as JSON
   */
  async getJSON<T>(key: string): Promise<T | null> {
    const response = await this.get(key);
    if (!response) return null;
    
    try {
      return await response.json();
    } catch (error) {
      console.error(`Failed to parse JSON for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    try {
      const cache = await this.getCache();
      const cacheKey = this.generateKey(key);
      const response = await cache.match(cacheKey);
      return !!response;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete item from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const cache = await this.getCache();
      const metadataCache = await this.getMetadataCache();
      const cacheKey = this.generateKey(key);
      
      const deleted = await cache.delete(cacheKey);
      await metadataCache.delete(`metadata-${cacheKey}`);
      
      return deleted;
    } catch (error) {
      console.error(`Failed to delete cached item with key: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all cached items
   */
  async clear(): Promise<void> {
    try {
      await caches.delete(DEFAULT_CACHE_NAME);
      await caches.delete(METADATA_CACHE_NAME);
      this.hitCount = 0;
      this.missCount = 0;
    } catch (error) {
      throw new PersistenceError(
        'Failed to clear cache',
        'CACHE_CLEAR_ERROR',
        error
      );
    }
  }

  /**
   * Get all cached keys
   */
  async keys(): Promise<string[]> {
    try {
      const cache = await this.getCache();
      const requests = await cache.keys();
      return requests.map(req => {
        const url = new URL(req.url);
        return url.pathname.replace('/boothie-asset-', '');
      });
    } catch (error) {
      console.error('Failed to get cache keys:', error);
      return [];
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const cache = await this.getCache();
      const metadataCache = await this.getMetadataCache();
      
      const requests = await cache.keys();
      const metadataRequests = await metadataCache.keys();
      
      let totalSize = 0;
      let oldestEntry = '';
      let newestEntry = '';
      let oldestTime = Date.now();
      let newestTime = 0;

      // Calculate total size and find oldest/newest entries
      for (const request of metadataRequests) {
        try {
          const response = await metadataCache.match(request);
          if (response) {
            const metadata: CacheEntry = await response.json();
            const createdTime = new Date(metadata.metadata.createdAt).getTime();
            
            if (metadata.metadata.size) {
              totalSize += metadata.metadata.size;
            }
            
            if (createdTime < oldestTime) {
              oldestTime = createdTime;
              oldestEntry = metadata.key;
            }
            
            if (createdTime > newestTime) {
              newestTime = createdTime;
              newestEntry = metadata.key;
            }
          }
        } catch (error) {
          console.error('Error processing metadata entry:', error);
        }
      }

      const totalRequests = this.hitCount + this.missCount;
      const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;
      const missRate = totalRequests > 0 ? (this.missCount / totalRequests) * 100 : 0;

      return {
        totalSize,
        itemCount: requests.length,
        hitRate: Math.round(hitRate * 100) / 100,
        missRate: Math.round(missRate * 100) / 100,
        oldestEntry,
        newestEntry
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        totalSize: 0,
        itemCount: 0,
        hitRate: 0,
        missRate: 0,
        oldestEntry: '',
        newestEntry: ''
      };
    }
  }

  /**
   * Cleanup expired entries and enforce size limits
   */
  private async cleanupIfNeeded(): Promise<void> {
    try {
      const stats = await this.getStats();
      
      if (stats.totalSize > this.config.maxSize) {
        await this.evictOldestEntries(stats.totalSize - this.config.maxSize);
      }
      
      await this.removeExpiredEntries();
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  /**
   * Remove expired entries
   */
  private async removeExpiredEntries(): Promise<void> {
    try {
      const metadataCache = await this.getMetadataCache();
      const requests = await metadataCache.keys();
      
      for (const request of requests) {
        try {
          const response = await metadataCache.match(request);
          if (response) {
            const metadata: CacheEntry = await response.json();
            
            if (this.isExpired(metadata.metadata, metadata.ttl)) {
              const originalKey = metadata.key.replace('boothie-asset-', '');
              await this.delete(originalKey);
            }
          }
        } catch (error) {
          console.error('Error checking expired entry:', error);
        }
      }
    } catch (error) {
      console.error('Failed to remove expired entries:', error);
    }
  }

  /**
   * Evict oldest entries to free up space
   */
  private async evictOldestEntries(bytesToFree: number): Promise<void> {
    try {
      const metadataCache = await this.getMetadataCache();
      const requests = await metadataCache.keys();
      
      // Get all entries with timestamps
      const entries: { key: string; timestamp: number; size: number }[] = [];
      
      for (const request of requests) {
        try {
          const response = await metadataCache.match(request);
          if (response) {
            const metadata: CacheEntry = await response.json();
            entries.push({
              key: metadata.key.replace('boothie-asset-', ''),
              timestamp: new Date(metadata.metadata.createdAt).getTime(),
              size: metadata.metadata.size || 0
            });
          }
        } catch (error) {
          console.error('Error processing entry for eviction:', error);
        }
      }
      
      // Sort by timestamp (oldest first)
      entries.sort((a, b) => a.timestamp - b.timestamp);
      
      let freedBytes = 0;
      for (const entry of entries) {
        if (freedBytes >= bytesToFree) break;
        
        await this.delete(entry.key);
        freedBytes += entry.size;
      }
      
      console.log(`Evicted ${freedBytes} bytes from cache`);
    } catch (error) {
      console.error('Failed to evict oldest entries:', error);
    }
  }

  /**
   * Invalidate cache entries by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      const metadataCache = await this.getMetadataCache();
      const requests = await metadataCache.keys();
      let invalidatedCount = 0;
      
      for (const request of requests) {
        try {
          const response = await metadataCache.match(request);
          if (response) {
            const metadata: CacheEntry = await response.json();
            
            // Check if any of the entry's tags match the invalidation tags
            const hasMatchingTag = metadata.tags.some(tag => tags.includes(tag));
            
            if (hasMatchingTag) {
              const originalKey = metadata.key.replace('boothie-asset-', '');
              await this.delete(originalKey);
              invalidatedCount++;
            }
          }
        } catch (error) {
          console.error('Error invalidating entry by tags:', error);
        }
      }
      
      return invalidatedCount;
    } catch (error) {
      console.error('Failed to invalidate by tags:', error);
      return 0;
    }
  }

  /**
   * Preload resources into cache
   */
  async preload(resources: { key: string; url: string; options?: CacheOptions }[]): Promise<void> {
    const promises = resources.map(async ({ key, url, options }) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await this.set(key, response, options);
        }
      } catch (error) {
        console.error(`Failed to preload resource: ${url}`, error);
      }
    });
    
    await Promise.allSettled(promises);
  }

  /**
   * Get cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
