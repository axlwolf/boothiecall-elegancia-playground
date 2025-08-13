// Admin persistence provider for BoothieCall Elegancia Playground
// Provides React context for admin data management operations

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { AdminPersistenceService } from '@/lib/adminPersistence';
import { SyncService } from '@/lib/syncService';
import { CacheService } from '@/lib/cacheService';
import {
  AdminAsset,
  AdminFilter,
  AdminTemplate,
  AdminUser,
  AdminTenant,
  OutputFormat,
  AnalyticsData,
  SyncStatus,
  SyncEvent
} from '@/types/persistence';

interface PersistenceContextType {
  // Services
  adminService: AdminPersistenceService;
  syncService: SyncService;
  cacheService: CacheService;
  
  // Sync status
  syncStatus: SyncStatus | null;
  isOnline: boolean;
  
  // Generic CRUD operations
  saveEntity: <T>(entityType: string, entity: T) => Promise<boolean>;
  getEntity: <T>(entityType: string, id: string) => Promise<T | null>;
  getAllEntities: <T>(entityType: string) => Promise<T[]>;
  deleteEntity: (entityType: string, id: string) => Promise<boolean>;
  
  // Specialized operations
  getEntitiesByTenant: <T>(entityType: string, tenantId: string) => Promise<T[]>;
  getEntitiesByType: <T>(entityType: string, type: string) => Promise<T[]>;
  
  // Sync operations
  emitSyncEvent: (type: SyncEvent['type'], entity: string, id: string, data?: unknown) => Promise<void>;
  subscribeTo: (entityType: string, handler: (event: SyncEvent) => void) => () => void;
  
  // Cache operations
  cacheAsset: (key: string, data: string | Blob, options?: unknown) => Promise<boolean>;
  getCachedAsset: (key: string) => Promise<Response | null>;
  
  // Utility operations
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<boolean>;
  clearAllData: () => Promise<void>;
  
  // Loading states
  loading: {
    [key: string]: boolean;
  };
  
  // Error states
  errors: {
    [key: string]: string | null;
  };
}

const PersistenceContext = createContext<PersistenceContextType | null>(null);

interface PersistenceProviderProps {
  children: React.ReactNode;
  tenantId?: string;
}

export const PersistenceProvider: React.FC<PersistenceProviderProps> = ({ 
  children, 
  tenantId 
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  // Initialize services
  const adminService = AdminPersistenceService.getInstance();
  const syncService = SyncService.getInstance();
  const cacheService = CacheService.getInstance();

  // Set loading state for specific operations
  const setLoadingState = useCallback((key: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  // Set error state for specific operations
  const setErrorState = useCallback((key: string, error: string | null) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  }, []);

  // Generic save entity operation
  const saveEntity = useCallback(async <T,>(entityType: string, entity: T): Promise<boolean> => {
    const key = `save-${entityType}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      const entityWithId = entity as unknown as { id: string };
      
      switch (entityType) {
        case 'assets':
          await adminService.saveAsset(entityWithId as AdminAsset);
          break;
        case 'filters':
          await adminService.saveFilter(entityWithId as AdminFilter);
          break;
        case 'templates':
          await adminService.saveTemplate(entityWithId as AdminTemplate);
          break;
        case 'users':
          await adminService.saveUser(entityWithId as AdminUser);
          break;
        case 'tenants':
          await adminService.saveTenant(entityWithId as AdminTenant);
          break;
        case 'formats':
          await adminService.saveFormat(entityWithId as OutputFormat);
          break;
        case 'analytics':
          await adminService.saveAnalytics(entityWithId as AnalyticsData);
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      // Emit sync event
      await emitSyncEvent('create', entityType, entityWithId.id, entity);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to save ${entityType}`;
      setErrorState(key, errorMessage);
      return false;
    } finally {
      setLoadingState(key, false);
    }
  }, [adminService]);

  // Generic get entity operation
  const getEntity = useCallback(async <T,>(entityType: string, id: string): Promise<T | null> => {
    const key = `get-${entityType}-${id}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      let result: T | null = null;
      
      switch (entityType) {
        case 'assets':
          result = await adminService.getAsset(id) as T;
          break;
        case 'filters':
          result = await adminService.getFilter(id) as T;
          break;
        case 'templates':
          result = await adminService.getTemplate(id) as T;
          break;
        case 'users':
          result = await adminService.getUser(id) as T;
          break;
        case 'tenants':
          result = await adminService.getTenant(id) as T;
          break;
        case 'formats':
          result = await adminService.getFormat(id) as T;
          break;
        case 'analytics':
          result = await adminService.getAnalytics(id) as T;
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to get ${entityType}`;
      setErrorState(key, errorMessage);
      return null;
    } finally {
      setLoadingState(key, false);
    }
  }, [adminService]);

  // Generic get all entities operation
  const getAllEntities = useCallback(async <T,>(entityType: string): Promise<T[]> => {
    const key = `getAll-${entityType}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      let result: T[] = [];
      
      switch (entityType) {
        case 'assets':
          result = await adminService.getAllAssets() as T[];
          break;
        case 'filters':
          result = await adminService.getAllFilters() as T[];
          break;
        case 'templates':
          result = await adminService.getAllTemplates() as T[];
          break;
        case 'users':
          result = await adminService.getAllUsers() as T[];
          break;
        case 'tenants':
          result = await adminService.getAllTenants() as T[];
          break;
        case 'formats':
          result = await adminService.getAllFormats() as T[];
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to get all ${entityType}`;
      setErrorState(key, errorMessage);
      return [];
    } finally {
      setLoadingState(key, false);
    }
  }, [adminService]);

  // Generic delete entity operation
  const deleteEntity = useCallback(async (entityType: string, id: string): Promise<boolean> => {
    const key = `delete-${entityType}-${id}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      let success = false;
      
      switch (entityType) {
        case 'assets':
          success = await adminService.deleteAsset(id);
          break;
        case 'filters':
          success = await adminService.deleteFilter(id);
          break;
        case 'templates':
          success = await adminService.deleteTemplate(id);
          break;
        case 'users':
          success = await adminService.deleteUser(id);
          break;
        case 'tenants':
          success = await adminService.deleteTenant(id);
          break;
        case 'formats':
          success = await adminService.deleteFormat(id);
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }

      if (success) {
        // Emit sync event
        await emitSyncEvent('delete', entityType, id);
      }
      
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to delete ${entityType}`;
      setErrorState(key, errorMessage);
      return false;
    } finally {
      setLoadingState(key, false);
    }
  }, [adminService]);

  // Get entities by tenant
  const getEntitiesByTenant = useCallback(async <T,>(entityType: string, tenantId: string): Promise<T[]> => {
    const key = `getByTenant-${entityType}-${tenantId}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      let result: T[] = [];
      
      switch (entityType) {
        case 'assets':
          result = await adminService.getAssetsByTenant(tenantId) as T[];
          break;
        case 'filters':
          result = await adminService.getFiltersByTenant(tenantId) as T[];
          break;
        case 'templates':
          result = await adminService.getTemplatesByTenant(tenantId) as T[];
          break;
        case 'users':
          result = await adminService.getUsersByTenant(tenantId) as T[];
          break;
        case 'formats':
          result = await adminService.getFormatsByTenant(tenantId) as T[];
          break;
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to get ${entityType} by tenant`;
      setErrorState(key, errorMessage);
      return [];
    } finally {
      setLoadingState(key, false);
    }
  }, [adminService]);

  // Get entities by type
  const getEntitiesByType = useCallback(async <T,>(entityType: string, type: string): Promise<T[]> => {
    const key = `getByType-${entityType}-${type}`;
    setLoadingState(key, true);
    setErrorState(key, null);

    try {
      let result: T[] = [];
      
      switch (entityType) {
        case 'assets':
          result = await adminService.getAssetsByType(type) as T[];
          break;
        case 'templates':
          result = await adminService.getTemplatesByLayout(type) as T[];
          break;
        default:
          throw new Error(`getByType not supported for entity type: ${entityType}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to get ${entityType} by type`;
      setErrorState(key, errorMessage);
      return [];
    } finally {
      setLoadingState(key, false);
    }
  }, [adminService]);

  // Emit sync event
  const emitSyncEvent = useCallback(async (
    type: SyncEvent['type'],
    entity: string,
    id: string,
    data?: unknown
  ) => {
    try {
      await syncService.emitEvent(type, entity as SyncEvent['entity'], id, data, 'admin');
    } catch (error) {
      console.error('Failed to emit sync event:', error);
    }
  }, [syncService]);

  // Subscribe to sync events
  const subscribeTo = useCallback((entityType: string, handler: (event: SyncEvent) => void) => {
    return syncService.subscribe(entityType, handler);
  }, [syncService]);

  // Cache asset
  const cacheAsset = useCallback(async (key: string, data: string | Blob, options?: unknown): Promise<boolean> => {
    try {
      await cacheService.set(key, data, options as Parameters<typeof cacheService.set>[2]);
      return true;
    } catch (error) {
      console.error('Failed to cache asset:', error);
      return false;
    }
  }, [cacheService]);

  // Get cached asset
  const getCachedAsset = useCallback(async (key: string): Promise<Response | null> => {
    try {
      return await cacheService.get(key);
    } catch (error) {
      console.error('Failed to get cached asset:', error);
      return null;
    }
  }, [cacheService]);

  // Export data
  const exportData = useCallback(async (): Promise<string> => {
    try {
      return await adminService.exportData();
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }, [adminService]);

  // Import data
  const importData = useCallback(async (jsonData: string): Promise<boolean> => {
    try {
      return await adminService.importData(jsonData);
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }, [adminService]);

  // Clear all data
  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      await adminService.clearAllData();
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }, [adminService]);

  // Update sync status
  const updateSyncStatus = useCallback(async () => {
    try {
      const status = await syncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to get sync status:', error);
    }
  }, [syncService]);

  // Handle online/offline status
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

  // Initialize sync status
  useEffect(() => {
    updateSyncStatus();
  }, [updateSyncStatus]);

  // Subscribe to global sync events for status updates
  useEffect(() => {
    const unsubscribe = syncService.subscribe('*', () => {
      updateSyncStatus();
    });

    return unsubscribe;
  }, [syncService, updateSyncStatus]);

  const contextValue: PersistenceContextType = {
    adminService,
    syncService,
    cacheService,
    syncStatus,
    isOnline,
    saveEntity,
    getEntity,
    getAllEntities,
    deleteEntity,
    getEntitiesByTenant,
    getEntitiesByType,
    emitSyncEvent,
    subscribeTo,
    cacheAsset,
    getCachedAsset,
    exportData,
    importData,
    clearAllData,
    loading,
    errors
  };

  return (
    <PersistenceContext.Provider value={contextValue}>
      {children}
    </PersistenceContext.Provider>
  );
};

// Custom hook to use the persistence context
export const usePersistenceContext = (): PersistenceContextType => {
  const context = useContext(PersistenceContext);
  if (!context) {
    throw new Error('usePersistenceContext must be used within a PersistenceProvider');
  }
  return context;
};

// Export the context for advanced usage
export { PersistenceContext };
