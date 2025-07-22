// Centralized storage-related types for BoothieCall Elegancia Playground
// Consolidates all storage, persistence, and sync types

// Re-export all persistence types
export * from './persistence';
export * from './admin';

// Re-export session types
export * from './session';

// Additional storage utility types
export interface StorageInfo {
  type: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'cache';
  available: boolean;
  quota?: {
    used: number;
    total: number;
    available: number;
    percentage: number;
  };
}

export interface StorageManager {
  localStorage: StorageInfo;
  sessionStorage: StorageInfo;
  indexedDB: StorageInfo;
  cache: StorageInfo;
  total: {
    used: number;
    available: number;
    percentage: number;
  };
}

// Offline storage types
export interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: unknown;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'normal' | 'high';
}

export interface OfflineQueue {
  operations: OfflineOperation[];
  isProcessing: boolean;
  lastProcessed: string;
}

// Backup and restore types
export interface BackupData {
  version: string;
  timestamp: string;
  sessions: unknown[];
  adminData: {
    assets: unknown[];
    filters: unknown[];
    templates: unknown[];
    users: unknown[];
    tenants: unknown[];
    formats: unknown[];
    analytics: unknown[];
  };
  preferences: unknown;
  metadata: {
    totalSize: number;
    itemCount: number;
    checksum: string;
  };
}

export interface RestoreOptions {
  overwriteExisting: boolean;
  selectiveRestore: {
    sessions: boolean;
    adminData: boolean;
    preferences: boolean;
  };
  backupCurrent: boolean;
}

// Performance monitoring types
export interface StoragePerformanceMetrics {
  operation: 'read' | 'write' | 'delete' | 'query';
  storageType: 'localStorage' | 'indexedDB' | 'cache';
  duration: number;
  dataSize: number;
  success: boolean;
  timestamp: string;
}

export interface StorageHealthCheck {
  localStorage: {
    available: boolean;
    quota: number;
    used: number;
    errors: string[];
  };
  indexedDB: {
    available: boolean;
    databases: string[];
    errors: string[];
  };
  cache: {
    available: boolean;
    caches: string[];
    errors: string[];
  };
  overall: {
    status: 'healthy' | 'warning' | 'error';
    score: number; // 0-100
    recommendations: string[];
  };
}

// Migration and versioning types
export interface StorageVersion {
  major: number;
  minor: number;
  patch: number;
  label?: string;
}

export interface MigrationStatus {
  currentVersion: StorageVersion;
  targetVersion: StorageVersion;
  isRequired: boolean;
  inProgress: boolean;
  completed: boolean;
  error?: string;
  progress: number; // 0-100
}

// Configuration types
export interface StorageConfiguration {
  enableSync: boolean;
  enableCache: boolean;
  enableOfflineQueue: boolean;
  enablePerformanceMonitoring: boolean;
  quotaWarningThreshold: number; // percentage
  maxCacheSize: number; // bytes
  maxOfflineOperations: number;
  syncInterval: number; // milliseconds
  cacheExpirationTime: number; // milliseconds
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

// Event types for storage operations
export interface StorageEvent {
  type: 'quota-warning' | 'quota-exceeded' | 'sync-conflict' | 'migration-required' | 'cache-miss' | 'offline-mode';
  timestamp: string;
  data: unknown;
  source: 'main' | 'admin' | 'system';
}

export type StorageEventHandler = (event: StorageEvent) => void;

// Utility types for type safety
export type StorageKey = string;
export type StorageValue = string | number | boolean | object | null;

// Generic storage operation result
export interface StorageOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    duration: number;
    size: number;
    cached: boolean;
  };
}

// Batch operation types
export interface BatchOperation<T = unknown> {
  type: 'create' | 'update' | 'delete';
  key: string;
  data?: T;
}

export interface BatchOperationResult {
  successful: number;
  failed: number;
  errors: Array<{
    key: string;
    error: string;
  }>;
  duration: number;
}
