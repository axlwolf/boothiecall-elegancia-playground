/* eslint-disable @typescript-eslint/no-explicit-any */
// Base persistence interfaces for BoothieCall Elegancia Playground
// Supports localStorage, IndexedDB, and Cache API operations

export interface StorageMetadata {
  version: number;
  createdAt: string;
  updatedAt: string;
  size?: number;
  checksum?: string;
}

export interface PersistenceConfig {
  maxItems?: number;
  ttl?: number; // Time to live in milliseconds
  enableEncryption?: boolean;
  enableCompression?: boolean;
}

// Base storage adapter interface
export interface BaseStorageAdapter<T> {
  save(key: string, data: T, config?: PersistenceConfig): Promise<void>;
  get(key: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
  getMetadata(key: string): Promise<StorageMetadata | null>;
}

// Admin-specific data interfaces
export interface AdminAsset {
  id: string;
  name: string;
  type: 'logo' | 'background' | 'template' | 'filter';
  url: string;
  thumbnailUrl?: string;
  metadata: StorageMetadata;
  tenantId: string;
  tags: string[];
  isActive: boolean;
}

export interface AdminFilter {
  id: string;
  name: string;
  category: string;
  cssFilter: string;
  previewUrl?: string;
  metadata: StorageMetadata;
  tenantId: string;
  isActive: boolean;
  order: number;
}

export interface AdminTemplate {
  id: string;
  name: string;
  layoutType: '1shot' | '3shot' | '4shot' | '6shot';
  imageUrl: string;
  frameMapping: Record<string, unknown>; // Frame positioning data
  metadata: StorageMetadata;
  tenantId: string;
  isActive: boolean;
  order: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'tenant_admin' | 'editor' | 'viewer';
  tenantId: string;
  isActive: boolean;
  lastLogin?: string;
  metadata: StorageMetadata;
}

export interface AdminTenant {
  id: string;
  name: string;
  domain: string;
  settings: {
    branding: {
      logo?: string;
      primaryColor: string;
      secondaryColor: string;
    };
    features: {
      gifSupport: boolean;
      maxPhotos: number;
      allowedFormats: string[];
    };
  };
  metadata: StorageMetadata;
  isActive: boolean;
}

export interface OutputFormat {
  id: string;
  name: string;
  type: 'png' | 'jpg' | 'gif' | 'pdf';
  quality: number;
  dimensions: {
    width: number;
    height: number;
  };
  metadata: StorageMetadata;
  tenantId: string;
  isDefault: boolean;
}

// Analytics data interfaces
export interface AnalyticsData {
  id: string;
  tenantId: string;
  date: string;
  metrics: {
    totalSessions: number;
    totalPhotos: number;
    popularLayouts: { [key: string]: number };
    popularFilters: { [key: string]: number };
    averageSessionDuration: number;
    deviceTypes: { [key: string]: number };
    browserTypes: { [key: string]: number };
  };
  metadata: StorageMetadata;
}

// Sync-related interfaces
export interface SyncEvent {
  type: 'create' | 'update' | 'delete';
  entity: 'asset' | 'filter' | 'template' | 'user' | 'tenant' | 'format' | 'session';
  id: string;
  data?: Record<string, unknown>;
  timestamp: string;
  source: 'main' | 'admin';
}

export interface SyncStatus {
  lastSync: string;
  pendingChanges: number;
  isOnline: boolean;
  conflicts: SyncConflict[];
}

export interface SyncConflict {
  id: string;
  entity: string;
  localVersion: unknown;
  remoteVersion: unknown;
  timestamp: string;
}

// Cache-related interfaces
export interface CacheEntry {
  key: string;
  data: unknown;
  metadata: StorageMetadata;
  ttl: number;
  tags: string[];
}

export interface CacheConfig {
  maxSize: number; // in bytes
  defaultTTL: number; // in milliseconds
  enableCompression: boolean;
  enableEncryption: boolean;
}

// Database schema interfaces
export interface DatabaseSchema {
  version: number;
  stores: {
    [storeName: string]: {
      keyPath: string;
      autoIncrement?: boolean;
      indexes: {
        [indexName: string]: {
          keyPath: string | string[];
          unique?: boolean;
        };
      };
    };
  };
}

export interface MigrationScript {
  version: number;
  up: (db: IDBDatabase, transaction: IDBTransaction) => Promise<void>;
  down?: (db: IDBDatabase, transaction: IDBTransaction) => Promise<void>;
}

// Error types
export class PersistenceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PersistenceError';
  }
}

export class QuotaExceededError extends PersistenceError {
  constructor(storageType: string, details?: Record<string, unknown>) {
    super(`Storage quota exceeded for ${storageType}`, 'QUOTA_EXCEEDED', details);
  }
}

export class SyncError extends PersistenceError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'SYNC_ERROR', details);
  }
}
