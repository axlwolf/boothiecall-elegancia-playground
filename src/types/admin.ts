/* eslint-disable @typescript-eslint/no-explicit-any */
// Admin-specific types with persistence metadata for BoothieCall Elegancia Playground

import { StorageMetadata } from './persistence';

// Enhanced admin types with persistence support
export interface AdminConfig {
  tenantId: string;
  settings: {
    theme: {
      primaryColor: string;
      secondaryColor: string;
      logoUrl?: string;
    };
    features: {
      enableGif: boolean;
      maxPhotosPerSession: number;
      allowedFileFormats: string[];
      enableAnalytics: boolean;
      enableSharing: boolean;
    };
    branding: {
      companyName: string;
      logoUrl?: string;
      watermarkUrl?: string;
      customCss?: string;
    };
  };
  metadata: StorageMetadata;
}

export interface AdminSession {
  id: string;
  userId: string;
  tenantId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  permissions: string[];
  metadata: StorageMetadata;
}

export interface AdminPreferences {
  userId: string;
  tenantId: string;
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      browser: boolean;
      desktop: boolean;
    };
    dashboard: {
      defaultView: string;
      widgetLayout: any[];
      refreshInterval: number;
    };
  };
  metadata: StorageMetadata;
}

export interface AdminAuditLog {
  id: string;
  userId: string;
  tenantId: string;
  action: string;
  entity: string;
  entityId: string;
  changes: {
    before?: any;
    after?: any;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  metadata: StorageMetadata;
}

// Cache-specific types
export interface CachedAsset {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mimeType: string;
  size: number;
  blob?: Blob;
  cachedAt: string;
  expiresAt: string;
  metadata: StorageMetadata;
}

export interface CachedTemplate {
  id: string;
  name: string;
  layoutType: string;
  imageBlob: Blob;
  frameMapping: any;
  cachedAt: string;
  metadata: StorageMetadata;
}

// Sync-specific types
export interface SyncableEntity {
  id: string;
  version: number;
  lastModified: string;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  metadata: StorageMetadata;
}

export interface AdminEntityWithSync<T> extends SyncableEntity {
  data: T;
}

// Storage configuration types
export interface StorageQuota {
  used: number;
  available: number;
  total: number;
  percentage: number;
}

export interface StorageStats {
  localStorage: {
    used: number;
    available: number;
    items: number;
  };
  indexedDB: {
    used: number;
    available: number;
    databases: string[];
  };
  cacheAPI: {
    used: number;
    available: number;
    caches: string[];
  };
  total: StorageQuota;
}

// Backup and export types
export interface BackupManifest {
  id: string;
  version: string;
  createdAt: string;
  tenantId: string;
  entities: {
    [entityType: string]: {
      count: number;
      size: number;
      checksum: string;
    };
  };
  metadata: StorageMetadata;
}

export interface ExportOptions {
  includeAssets: boolean;
  includeAnalytics: boolean;
  includeAuditLogs: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  format: 'json' | 'csv' | 'xlsx';
  compression: boolean;
}

// Migration types
export interface MigrationPlan {
  fromVersion: number;
  toVersion: number;
  steps: MigrationStep[];
  estimatedDuration: number;
  backupRequired: boolean;
}

export interface MigrationStep {
  id: string;
  description: string;
  type: 'schema' | 'data' | 'cleanup';
  script: string;
  rollbackScript?: string;
  dependencies: string[];
}

export interface MigrationResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  duration: number;
  errors: string[];
  warnings: string[];
  backupId?: string;
}

// Performance monitoring types
export interface PerformanceMetrics {
  id: string;
  tenantId: string;
  timestamp: string;
  metrics: {
    storage: {
      readTime: number;
      writeTime: number;
      deleteTime: number;
      queryTime: number;
    };
    sync: {
      eventProcessingTime: number;
      conflictResolutionTime: number;
      broadcastTime: number;
    };
    cache: {
      hitRate: number;
      missRate: number;
      evictionRate: number;
      averageResponseTime: number;
    };
    memory: {
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
  };
  metadata: StorageMetadata;
}

// Error tracking types
export interface PersistenceErrorLog {
  id: string;
  tenantId: string;
  timestamp: string;
  error: {
    type: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context: {
    operation: string;
    entity?: string;
    entityId?: string;
    storageType: string;
    userAgent: string;
  };
  metadata: StorageMetadata;
}

// Notification types for admin events
export interface AdminNotification {
  id: string;
  tenantId: string;
  userId?: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  metadata: StorageMetadata;
}
