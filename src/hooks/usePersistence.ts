// React hooks for persistence operations in BoothieCall Elegancia Playground
// Provides easy-to-use hooks for localStorage, IndexedDB, and Cache API

import { useState, useEffect, useCallback, useRef } from 'react';
import { HybridStorageService } from '@/lib/hybridStorage';
import { AdminPersistenceService } from '@/lib/adminPersistence';
import { SyncService } from '@/lib/syncService';
import { CacheService } from '@/lib/cacheService';
import {
  PhotoSession,
  SessionSummary,
  SessionStats
} from '@/types/session';
import {
  AdminAsset,
  AdminFilter,
  AdminTemplate,
  AdminUser,
  AdminTenant,
  OutputFormat,
  AnalyticsData,
  SyncEvent,
  SyncStatus
} from '@/types/persistence';

// Generic persistence hook for any data type
export function usePersistence<T>(
  key: string,
  initialValue: T,
  storageType: 'localStorage' | 'sessionStorage' = 'localStorage'
) {
  const [value, setValue] = useState<T>(() => {
    try {
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Failed to load ${key} from ${storageType}:`, error);
      return initialValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
      storage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Failed to save ${key} to ${storageType}:`, error);
    }
  }, [key, value, storageType]);

  const removeValue = useCallback(() => {
    try {
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
      storage.removeItem(key);
      setValue(initialValue);
    } catch (error) {
      console.error(`Failed to remove ${key} from ${storageType}:`, error);
    }
  }, [key, initialValue, storageType]);

  return [value, setStoredValue, removeValue] as const;
}

// Hook for photo sessions using HybridStorageService
export function usePhotoSessions() {
  const [sessions, setSessions] = useState<PhotoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storageService = useRef(HybridStorageService.getInstance());

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allSessions = await storageService.current.getAllSessions();
      setSessions(allSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSession = useCallback(async (session: PhotoSession) => {
    try {
      await storageService.current.saveSession(session);
      await loadSessions(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session');
      return false;
    }
  }, [loadSessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const success = await storageService.current.deleteSession(sessionId);
      if (success) {
        await loadSessions(); // Refresh the list
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      return false;
    }
  }, [loadSessions]);

  const clearAllSessions = useCallback(async () => {
    try {
      await storageService.current.clearAllSessions();
      setSessions([]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear sessions');
      return false;
    }
  }, []);

  const getSessionStats = useCallback(async (): Promise<SessionStats | null> => {
    try {
      return await storageService.current.getSessionStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get session stats');
      return null;
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    loading,
    error,
    saveSession,
    deleteSession,
    clearAllSessions,
    getSessionStats,
    refreshSessions: loadSessions
  };
}

// Hook for admin persistence operations
export function useAdminPersistence<T>(
  entityType: 'assets' | 'filters' | 'templates' | 'users' | 'tenants' | 'formats' | 'analytics'
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const adminService = useRef(AdminPersistenceService.getInstance());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result: T[] = [];
      switch (entityType) {
        case 'assets':
          result = await adminService.current.getAllAssets() as T[];
          break;
        case 'filters':
          result = await adminService.current.getAllFilters() as T[];
          break;
        case 'templates':
          result = await adminService.current.getAllTemplates() as T[];
          break;
        case 'users':
          result = await adminService.current.getAllUsers() as T[];
          break;
        case 'tenants':
          result = await adminService.current.getAllTenants() as T[];
          break;
        case 'formats':
          result = await adminService.current.getAllFormats() as T[];
          break;
        case 'analytics':
          result = await adminService.current.analyticsAdapter.getAll() as T[];
          break;
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${entityType}`);
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  const saveItem = useCallback(async (item: T): Promise<boolean> => {
    try {
      const itemWithId = item as any;
      
      switch (entityType) {
        case 'assets':
          await adminService.current.saveAsset(itemWithId as AdminAsset);
          break;
        case 'filters':
          await adminService.current.saveFilter(itemWithId as AdminFilter);
          break;
        case 'templates':
          await adminService.current.saveTemplate(itemWithId as AdminTemplate);
          break;
        case 'users':
          await adminService.current.saveUser(itemWithId as AdminUser);
          break;
        case 'tenants':
          await adminService.current.saveTenant(itemWithId as AdminTenant);
          break;
        case 'formats':
          await adminService.current.saveFormat(itemWithId as OutputFormat);
          break;
        case 'analytics':
          await adminService.current.saveAnalytics(itemWithId as AnalyticsData);
          break;
      }
      
      await loadData(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to save ${entityType} item`);
      return false;
    }
  }, [entityType, loadData]);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      let success = false;
      
      switch (entityType) {
        case 'assets':
          success = await adminService.current.deleteAsset(id);
          break;
        case 'filters':
          success = await adminService.current.deleteFilter(id);
          break;
        case 'templates':
          success = await adminService.current.deleteTemplate(id);
          break;
        case 'users':
          success = await adminService.current.deleteUser(id);
          break;
        case 'tenants':
          success = await adminService.current.deleteTenant(id);
          break;
        case 'formats':
          success = await adminService.current.deleteFormat(id);
          break;
      }
      
      if (success) {
        await loadData(); // Refresh the list
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to delete ${entityType} item`);
      return false;
    }
  }, [entityType, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    saveItem,
    deleteItem,
    refreshData: loadData
  };
}

// Hook for sync operations
export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const syncService = useRef(SyncService.getInstance());

  const refreshSyncStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status = await syncService.current.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to get sync status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeToEvents = useCallback((
    entityType: string,
    handler: (event: SyncEvent) => void
  ) => {
    return syncService.current.subscribe(entityType, handler);
  }, []);

  const emitEvent = useCallback(async (
    type: SyncEvent['type'],
    entity: SyncEvent['entity'],
    id: string,
    data?: any,
    source: 'main' | 'admin' = 'main'
  ) => {
    try {
      await syncService.current.emitEvent(type, entity, id, data, source);
      await refreshSyncStatus();
    } catch (error) {
      console.error('Failed to emit sync event:', error);
    }
  }, [refreshSyncStatus]);

  const forceSync = useCallback(async () => {
    try {
      setLoading(true);
      await syncService.current.forcSync();
      await refreshSyncStatus();
    } catch (error) {
      console.error('Failed to force sync:', error);
    } finally {
      setLoading(false);
    }
  }, [refreshSyncStatus]);

  useEffect(() => {
    refreshSyncStatus();
  }, [refreshSyncStatus]);

  return {
    syncStatus,
    loading,
    subscribeToEvents,
    emitEvent,
    forceSync,
    refreshSyncStatus
  };
}

// Hook for cache operations
export function useCache() {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const cacheService = useRef(CacheService.getInstance());

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      const stats = await cacheService.current.getStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const cacheItem = useCallback(async (
    key: string,
    data: string | Blob | Response,
    options?: any
  ) => {
    try {
      await cacheService.current.set(key, data, options);
      await refreshStats();
      return true;
    } catch (error) {
      console.error('Failed to cache item:', error);
      return false;
    }
  }, [refreshStats]);

  const getCachedItem = useCallback(async (key: string) => {
    try {
      return await cacheService.current.get(key);
    } catch (error) {
      console.error('Failed to get cached item:', error);
      return null;
    }
  }, []);

  const deleteCachedItem = useCallback(async (key: string) => {
    try {
      const success = await cacheService.current.delete(key);
      if (success) {
        await refreshStats();
      }
      return success;
    } catch (error) {
      console.error('Failed to delete cached item:', error);
      return false;
    }
  }, [refreshStats]);

  const clearCache = useCallback(async () => {
    try {
      await cacheService.current.clear();
      await refreshStats();
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }, [refreshStats]);

  useEffect(() => {
    if (cacheService.current.isSupported()) {
      refreshStats();
    }
  }, [refreshStats]);

  return {
    cacheStats,
    loading,
    isSupported: cacheService.current.isSupported(),
    cacheItem,
    getCachedItem,
    deleteCachedItem,
    clearCache,
    refreshStats
  };
}

// Hook for storage quota and usage information
export function useStorageQuota() {
  const [quota, setQuota] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refreshQuota = useCallback(async () => {
    try {
      setLoading(true);
      
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setQuota({
          used: estimate.usage || 0,
          total: estimate.quota || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
        });
      } else {
        // Fallback for browsers that don't support Storage API
        setQuota({
          used: 0,
          total: 0,
          available: 0,
          percentage: 0,
          unsupported: true
        });
      }
    } catch (error) {
      console.error('Failed to get storage quota:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  return {
    quota,
    loading,
    refreshQuota
  };
}

// Hook for offline detection and queue management
export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = useCallback(async (operation: any) => {
    // Implementation would depend on your offline queue strategy
    console.log('Adding operation to offline queue:', operation);
    setQueueSize(prev => prev + 1);
  }, []);

  const processQueue = useCallback(async () => {
    if (!isOnline) return;
    
    // Implementation would process queued operations
    console.log('Processing offline queue...');
    setQueueSize(0);
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline, processQueue]);

  return {
    isOnline,
    queueSize,
    addToQueue,
    processQueue
  };
}
