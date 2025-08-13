/* eslint-disable @typescript-eslint/no-explicit-any */
// Admin-specific persistence service for BoothieCall Elegancia Playground
// Handles admin data with IndexedDB + localStorage + Cache API

import {
  AdminAsset,
  AdminFilter,
  AdminTemplate,
  AdminUser,
  AdminTenant,
  OutputFormat,
  AnalyticsData,
  BaseStorageAdapter,
  StorageMetadata,
  PersistenceConfig,
  PersistenceError,
  QuotaExceededError,
  DatabaseSchema,
  MigrationScript
} from '@/types/persistence';

const ADMIN_DB_NAME = 'BoothieCallAdminDB';
const ADMIN_DB_VERSION = 1;
const ADMIN_STORAGE_PREFIX = 'boothie-admin-';

// Database schema definition
const ADMIN_SCHEMA: DatabaseSchema = {
  version: 1,
  stores: {
    assets: {
      keyPath: 'id',
      indexes: {
        tenantId: { keyPath: 'tenantId' },
        type: { keyPath: 'type' },
        isActive: { keyPath: 'isActive' }
      }
    },
    filters: {
      keyPath: 'id',
      indexes: {
        tenantId: { keyPath: 'tenantId' },
        category: { keyPath: 'category' },
        order: { keyPath: 'order' }
      }
    },
    templates: {
      keyPath: 'id',
      indexes: {
        tenantId: { keyPath: 'tenantId' },
        layoutType: { keyPath: 'layoutType' },
        order: { keyPath: 'order' }
      }
    },
    users: {
      keyPath: 'id',
      indexes: {
        email: { keyPath: 'email', unique: true },
        tenantId: { keyPath: 'tenantId' },
        role: { keyPath: 'role' }
      }
    },
    tenants: {
      keyPath: 'id',
      indexes: {
        domain: { keyPath: 'domain', unique: true },
        isActive: { keyPath: 'isActive' }
      }
    },
    formats: {
      keyPath: 'id',
      indexes: {
        tenantId: { keyPath: 'tenantId' },
        type: { keyPath: 'type' },
        isDefault: { keyPath: 'isDefault' }
      }
    },
    analytics: {
      keyPath: 'id',
      indexes: {
        tenantId: { keyPath: 'tenantId' },
        date: { keyPath: 'date' }
      }
    },
    metadata: {
      keyPath: 'key',
      indexes: {}
    }
  }
};

class AdminIndexedDBAdapter<T> implements BaseStorageAdapter<T> {
  private db: IDBDatabase | null = null;
  private storeName: string;

  constructor(storeName: string) {
    this.storeName = storeName;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(ADMIN_DB_NAME, ADMIN_DB_VERSION);
      
      request.onerror = () => reject(new PersistenceError(
        'Failed to open admin database',
        'DB_OPEN_ERROR',
        request.error
      ));

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  private createStores(db: IDBDatabase): void {
    Object.entries(ADMIN_SCHEMA.stores).forEach(([storeName, config]) => {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, {
          keyPath: config.keyPath,
          autoIncrement: config.autoIncrement
        });

        // Create indexes
        Object.entries(config.indexes).forEach(([indexName, indexConfig]) => {
          store.createIndex(indexName, indexConfig.keyPath, {
            unique: indexConfig.unique || false
          });
        });
      }
    });
  }

  async save(key: string, data: T, config?: PersistenceConfig): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    // Add metadata
    const dataWithMetadata = {
      ...data,
      metadata: {
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        size: JSON.stringify(data).length
      } as StorageMetadata
    };

    return new Promise((resolve, reject) => {
      const request = store.put(dataWithMetadata);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new PersistenceError(
        `Failed to save ${key} to ${this.storeName}`,
        'SAVE_ERROR',
        request.error
      ));
    });
  }

  async get(key: string): Promise<T | null> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new PersistenceError(
        `Failed to get ${key} from ${this.storeName}`,
        'GET_ERROR',
        request.error
      ));
    });
  }

  async getAll(): Promise<T[]> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new PersistenceError(
        `Failed to get all from ${this.storeName}`,
        'GET_ALL_ERROR',
        request.error
      ));
    });
  }

  async delete(key: string): Promise<boolean> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error(`Failed to delete ${key} from ${this.storeName}:`, request.error);
        resolve(false);
      };
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new PersistenceError(
        `Failed to clear ${this.storeName}`,
        'CLEAR_ERROR',
        request.error
      ));
    });
  }

  async exists(key: string): Promise<boolean> {
    const item = await this.get(key);
    return item !== null;
  }

  async getMetadata(key: string): Promise<StorageMetadata | null> {
    const item = await this.get(key) as T & { metadata?: StorageMetadata };
    return item?.metadata || null;
  }

  async getByIndex(indexName: string, value: string | number | Date): Promise<T[]> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index(indexName);
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new PersistenceError(
        `Failed to get by index ${indexName} from ${this.storeName}`,
        'GET_BY_INDEX_ERROR',
        request.error
      ));
    });
  }
}

export class AdminPersistenceService {
  private static instance: AdminPersistenceService;
  
  // Storage adapters for different entity types
  private assetAdapter: AdminIndexedDBAdapter<AdminAsset>;
  private filterAdapter: AdminIndexedDBAdapter<AdminFilter>;
  private templateAdapter: AdminIndexedDBAdapter<AdminTemplate>;
  private userAdapter: AdminIndexedDBAdapter<AdminUser>;
  private tenantAdapter: AdminIndexedDBAdapter<AdminTenant>;
  private formatAdapter: AdminIndexedDBAdapter<OutputFormat>;
  private analyticsAdapter: AdminIndexedDBAdapter<AnalyticsData>;

  private constructor() {
    this.assetAdapter = new AdminIndexedDBAdapter<AdminAsset>('assets');
    this.filterAdapter = new AdminIndexedDBAdapter<AdminFilter>('filters');
    this.templateAdapter = new AdminIndexedDBAdapter<AdminTemplate>('templates');
    this.userAdapter = new AdminIndexedDBAdapter<AdminUser>('users');
    this.tenantAdapter = new AdminIndexedDBAdapter<AdminTenant>('tenants');
    this.formatAdapter = new AdminIndexedDBAdapter<OutputFormat>('formats');
    this.analyticsAdapter = new AdminIndexedDBAdapter<AnalyticsData>('analytics');
  }

  static getInstance(): AdminPersistenceService {
    if (!AdminPersistenceService.instance) {
      AdminPersistenceService.instance = new AdminPersistenceService();
    }
    return AdminPersistenceService.instance;
  }

  // Asset management methods
  async saveAsset(asset: AdminAsset): Promise<void> {
    return this.assetAdapter.save(asset.id, asset);
  }

  async getAsset(id: string): Promise<AdminAsset | null> {
    return this.assetAdapter.get(id);
  }

  async getAllAssets(): Promise<AdminAsset[]> {
    return this.assetAdapter.getAll();
  }

  async getAssetsByTenant(tenantId: string): Promise<AdminAsset[]> {
    return this.assetAdapter.getByIndex('tenantId', tenantId);
  }

  async getAssetsByType(type: string): Promise<AdminAsset[]> {
    return this.assetAdapter.getByIndex('type', type);
  }

  async deleteAsset(id: string): Promise<boolean> {
    return this.assetAdapter.delete(id);
  }

  // Filter management methods
  async saveFilter(filter: AdminFilter): Promise<void> {
    return this.filterAdapter.save(filter.id, filter);
  }

  async getFilter(id: string): Promise<AdminFilter | null> {
    return this.filterAdapter.get(id);
  }

  async getAllFilters(): Promise<AdminFilter[]> {
    return this.filterAdapter.getAll();
  }

  async getFiltersByTenant(tenantId: string): Promise<AdminFilter[]> {
    return this.filterAdapter.getByIndex('tenantId', tenantId);
  }

  async deleteFilter(id: string): Promise<boolean> {
    return this.filterAdapter.delete(id);
  }

  // Template management methods
  async saveTemplate(template: AdminTemplate): Promise<void> {
    return this.templateAdapter.save(template.id, template);
  }

  async getTemplate(id: string): Promise<AdminTemplate | null> {
    return this.templateAdapter.get(id);
  }

  async getAllTemplates(): Promise<AdminTemplate[]> {
    return this.templateAdapter.getAll();
  }

  async getTemplatesByTenant(tenantId: string): Promise<AdminTemplate[]> {
    return this.templateAdapter.getByIndex('tenantId', tenantId);
  }

  async getTemplatesByLayout(layoutType: string): Promise<AdminTemplate[]> {
    return this.templateAdapter.getByIndex('layoutType', layoutType);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templateAdapter.delete(id);
  }

  // User management methods
  async saveUser(user: AdminUser): Promise<void> {
    return this.userAdapter.save(user.id, user);
  }

  async getUser(id: string): Promise<AdminUser | null> {
    return this.userAdapter.get(id);
  }

  async getUserByEmail(email: string): Promise<AdminUser | null> {
    const users = await this.userAdapter.getByIndex('email', email);
    return users[0] || null;
  }

  async getAllUsers(): Promise<AdminUser[]> {
    return this.userAdapter.getAll();
  }

  async getUsersByTenant(tenantId: string): Promise<AdminUser[]> {
    return this.userAdapter.getByIndex('tenantId', tenantId);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.userAdapter.delete(id);
  }

  // Tenant management methods
  async saveTenant(tenant: AdminTenant): Promise<void> {
    return this.tenantAdapter.save(tenant.id, tenant);
  }

  async getTenant(id: string): Promise<AdminTenant | null> {
    return this.tenantAdapter.get(id);
  }

  async getAllTenants(): Promise<AdminTenant[]> {
    return this.tenantAdapter.getAll();
  }

  async getTenantByDomain(domain: string): Promise<AdminTenant | null> {
    const tenants = await this.tenantAdapter.getByIndex('domain', domain);
    return tenants[0] || null;
  }

  async deleteTenant(id: string): Promise<boolean> {
    return this.tenantAdapter.delete(id);
  }

  // Output format management methods
  async saveFormat(format: OutputFormat): Promise<void> {
    return this.formatAdapter.save(format.id, format);
  }

  async getFormat(id: string): Promise<OutputFormat | null> {
    return this.formatAdapter.get(id);
  }

  async getAllFormats(): Promise<OutputFormat[]> {
    return this.formatAdapter.getAll();
  }

  async getFormatsByTenant(tenantId: string): Promise<OutputFormat[]> {
    return this.formatAdapter.getByIndex('tenantId', tenantId);
  }

  async deleteFormat(id: string): Promise<boolean> {
    return this.formatAdapter.delete(id);
  }

  // Analytics methods
  async saveAnalytics(analytics: AnalyticsData): Promise<void> {
    return this.analyticsAdapter.save(analytics.id, analytics);
  }

  async getAnalytics(id: string): Promise<AnalyticsData | null> {
    return this.analyticsAdapter.get(id);
  }

  async getAnalyticsByTenant(tenantId: string): Promise<AnalyticsData[]> {
    return this.analyticsAdapter.getByIndex('tenantId', tenantId);
  }

  async getAnalyticsByDateRange(tenantId: string, startDate: string, endDate: string): Promise<AnalyticsData[]> {
    const allAnalytics = await this.getAnalyticsByTenant(tenantId);
    return allAnalytics.filter(analytics => 
      analytics.date >= startDate && analytics.date <= endDate
    );
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.assetAdapter.clear(),
      this.filterAdapter.clear(),
      this.templateAdapter.clear(),
      this.userAdapter.clear(),
      this.tenantAdapter.clear(),
      this.formatAdapter.clear(),
      this.analyticsAdapter.clear()
    ]);
  }

  async exportData(): Promise<string> {
    const data = {
      assets: await this.getAllAssets(),
      filters: await this.getAllFilters(),
      templates: await this.getAllTemplates(),
      users: await this.getAllUsers(),
      tenants: await this.getAllTenants(),
      formats: await this.getAllFormats(),
      analytics: await this.analyticsAdapter.getAll()
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data
      await this.clearAllData();
      
      // Import new data
      if (data.assets) {
        for (const asset of data.assets) {
          await this.saveAsset(asset);
        }
      }
      
      if (data.filters) {
        for (const filter of data.filters) {
          await this.saveFilter(filter);
        }
      }
      
      if (data.templates) {
        for (const template of data.templates) {
          await this.saveTemplate(template);
        }
      }
      
      if (data.users) {
        for (const user of data.users) {
          await this.saveUser(user);
        }
      }
      
      if (data.tenants) {
        for (const tenant of data.tenants) {
          await this.saveTenant(tenant);
        }
      }
      
      if (data.formats) {
        for (const format of data.formats) {
          await this.saveFormat(format);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import admin data:', error);
      return false;
    }
  }

  getStorageInfo(): { type: string; version: number } {
    return {
      type: 'IndexedDB',
      version: ADMIN_DB_VERSION
    };
  }
}
