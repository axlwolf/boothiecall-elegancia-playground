// Database schemas and migration strategies for BoothieCall Elegancia Playground
// Supports versioned IndexedDB schemas with automatic migrations

import { DatabaseSchema, MigrationScript } from '@/types/persistence';

// Current schema version
export const CURRENT_SCHEMA_VERSION = 2;

// Main app database schema
export const MAIN_APP_SCHEMA: DatabaseSchema = {
  version: 2,
  stores: {
    sessions: {
      keyPath: 'id',
      indexes: {
        createdAt: { keyPath: 'createdAt' },
        layoutId: { keyPath: 'layout.id' },
        templateId: { keyPath: 'template.id' },
        duration: { keyPath: 'metadata.duration' }
      }
    },
    preferences: {
      keyPath: 'id',
      indexes: {
        userId: { keyPath: 'userId' },
        category: { keyPath: 'category' }
      }
    },
    cache: {
      keyPath: 'key',
      indexes: {
        expiresAt: { keyPath: 'expiresAt' },
        tags: { keyPath: 'tags', unique: false },
        size: { keyPath: 'size' }
      }
    },
    offline_queue: {
      keyPath: 'id',
      indexes: {
        priority: { keyPath: 'priority' },
        createdAt: { keyPath: 'createdAt' },
        status: { keyPath: 'status' }
      }
    }
  }
};

// Admin database schema
export const ADMIN_SCHEMA: DatabaseSchema = {
  version: 2,
  stores: {
    assets: {
      keyPath: 'id',
      indexes: {
        tenantId: { keyPath: 'tenantId' },
        type: { keyPath: 'type' },
        isActive: { keyPath: 'isActive' },
        createdAt: { keyPath: 'metadata.createdAt' },
        size: { keyPath: 'metadata.size' }
      }
    },
    filters: {
      keyPath: 'id',
      indexes: {
        tenantId: { keyPath: 'tenantId' },
        category: { keyPath: 'category' },
        order: { keyPath: 'order' },
        isActive: { keyPath: 'isActive' }
      }
    },
    templates: {
      keyPath: 'id',
      indexes: {
        tenantId: { keyPath: 'tenantId' },
        layoutType: { keyPath: 'layoutType' },
        order: { keyPath: 'order' },
        isActive: { keyPath: 'isActive' }
      }
    },
    users: {
      keyPath: 'id',
      indexes: {
        email: { keyPath: 'email', unique: true },
        tenantId: { keyPath: 'tenantId' },
        role: { keyPath: 'role' },
        isActive: { keyPath: 'isActive' },
        lastLogin: { keyPath: 'lastLogin' }
      }
    },
    tenants: {
      keyPath: 'id',
      indexes: {
        domain: { keyPath: 'domain', unique: true },
        isActive: { keyPath: 'isActive' },
        createdAt: { keyPath: 'metadata.createdAt' }
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
        date: { keyPath: 'date' },
        createdAt: { keyPath: 'metadata.createdAt' }
      }
    },
    audit_logs: {
      keyPath: 'id',
      indexes: {
        userId: { keyPath: 'userId' },
        tenantId: { keyPath: 'tenantId' },
        action: { keyPath: 'action' },
        entity: { keyPath: 'entity' },
        timestamp: { keyPath: 'timestamp' }
      }
    },
    notifications: {
      keyPath: 'id',
      indexes: {
        tenantId: { keyPath: 'tenantId' },
        userId: { keyPath: 'userId' },
        type: { keyPath: 'type' },
        read: { keyPath: 'read' },
        createdAt: { keyPath: 'createdAt' },
        expiresAt: { keyPath: 'expiresAt' }
      }
    },
    sync_status: {
      keyPath: 'id',
      indexes: {
        entity: { keyPath: 'entity' },
        status: { keyPath: 'status' },
        lastSync: { keyPath: 'lastSync' }
      }
    }
  }
};

// Migration scripts
export const MIGRATION_SCRIPTS: MigrationScript[] = [
  {
    version: 1,
    up: async (db: IDBDatabase, transaction: IDBTransaction) => {
      console.log('Running migration to version 1: Initial schema setup');
      
      // Initial schema is created automatically by the database opening process
      // This migration is mainly for logging purposes
    }
  },
  {
    version: 2,
    up: async (db: IDBDatabase, transaction: IDBTransaction) => {
      console.log('Running migration to version 2: Adding new indexes and stores');
      
      // Add new indexes to existing stores
      if (db.objectStoreNames.contains('sessions')) {
        const sessionsStore = transaction.objectStore('sessions');
        
        // Add duration index if it doesn't exist
        if (!sessionsStore.indexNames.contains('duration')) {
          sessionsStore.createIndex('duration', 'metadata.duration', { unique: false });
        }
      }
      
      // Add audit_logs store if it doesn't exist
      if (!db.objectStoreNames.contains('audit_logs')) {
        const auditStore = db.createObjectStore('audit_logs', { keyPath: 'id' });
        auditStore.createIndex('userId', 'userId', { unique: false });
        auditStore.createIndex('tenantId', 'tenantId', { unique: false });
        auditStore.createIndex('action', 'action', { unique: false });
        auditStore.createIndex('entity', 'entity', { unique: false });
        auditStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Add notifications store if it doesn't exist
      if (!db.objectStoreNames.contains('notifications')) {
        const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
        notificationStore.createIndex('tenantId', 'tenantId', { unique: false });
        notificationStore.createIndex('userId', 'userId', { unique: false });
        notificationStore.createIndex('type', 'type', { unique: false });
        notificationStore.createIndex('read', 'read', { unique: false });
        notificationStore.createIndex('createdAt', 'createdAt', { unique: false });
        notificationStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
      
      // Add sync_status store if it doesn't exist
      if (!db.objectStoreNames.contains('sync_status')) {
        const syncStore = db.createObjectStore('sync_status', { keyPath: 'id' });
        syncStore.createIndex('entity', 'entity', { unique: false });
        syncStore.createIndex('status', 'status', { unique: false });
        syncStore.createIndex('lastSync', 'lastSync', { unique: false });
      }
      
      // Add offline_queue store if it doesn't exist (for main app)
      if (!db.objectStoreNames.contains('offline_queue')) {
        const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id' });
        queueStore.createIndex('priority', 'priority', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
        queueStore.createIndex('status', 'status', { unique: false });
      }
    },
    down: async (db: IDBDatabase, transaction: IDBTransaction) => {
      console.log('Rolling back migration from version 2');
      
      // Remove new stores
      if (db.objectStoreNames.contains('audit_logs')) {
        db.deleteObjectStore('audit_logs');
      }
      
      if (db.objectStoreNames.contains('notifications')) {
        db.deleteObjectStore('notifications');
      }
      
      if (db.objectStoreNames.contains('sync_status')) {
        db.deleteObjectStore('sync_status');
      }
      
      if (db.objectStoreNames.contains('offline_queue')) {
        db.deleteObjectStore('offline_queue');
      }
      
      // Note: We can't remove indexes from existing stores in a downgrade
      // This would require recreating the entire store
    }
  }
];

// Schema validation functions
export function validateSchema(db: IDBDatabase, expectedSchema: DatabaseSchema): boolean {
  try {
    // Check if all expected stores exist
    for (const storeName of Object.keys(expectedSchema.stores)) {
      if (!db.objectStoreNames.contains(storeName)) {
        console.error(`Missing object store: ${storeName}`);
        return false;
      }
    }
    
    // Additional validation could be added here to check indexes
    return true;
  } catch (error) {
    console.error('Schema validation error:', error);
    return false;
  }
}

export function getRequiredMigrations(currentVersion: number, targetVersion: number): MigrationScript[] {
  return MIGRATION_SCRIPTS.filter(migration => 
    migration.version > currentVersion && migration.version <= targetVersion
  ).sort((a, b) => a.version - b.version);
}

export async function runMigrations(
  db: IDBDatabase, 
  transaction: IDBTransaction, 
  migrations: MigrationScript[]
): Promise<void> {
  for (const migration of migrations) {
    try {
      console.log(`Running migration to version ${migration.version}`);
      await migration.up(db, transaction);
      console.log(`Migration to version ${migration.version} completed successfully`);
    } catch (error) {
      console.error(`Migration to version ${migration.version} failed:`, error);
      
      // Attempt rollback if available
      if (migration.down) {
        try {
          console.log(`Attempting rollback for version ${migration.version}`);
          await migration.down(db, transaction);
          console.log(`Rollback for version ${migration.version} completed`);
        } catch (rollbackError) {
          console.error(`Rollback for version ${migration.version} failed:`, rollbackError);
        }
      }
      
      throw error;
    }
  }
}

// Database initialization helper
export async function initializeDatabase(
  dbName: string, 
  schema: DatabaseSchema,
  onUpgradeNeeded?: (db: IDBDatabase, transaction: IDBTransaction, oldVersion: number, newVersion: number) => void
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, schema.version);
    
    request.onerror = () => {
      reject(new Error(`Failed to open database ${dbName}: ${request.error}`));
    };
    
    request.onsuccess = () => {
      const db = request.result;
      
      // Validate schema
      if (!validateSchema(db, schema)) {
        reject(new Error(`Schema validation failed for database ${dbName}`));
        return;
      }
      
      resolve(db);
    };
    
    request.onupgradeneeded = async (event) => {
      const db = request.result;
      const transaction = request.transaction!;
      const oldVersion = event.oldVersion;
      const newVersion = event.newVersion!;
      
      try {
        console.log(`Upgrading database ${dbName} from version ${oldVersion} to ${newVersion}`);
        
        // Create stores and indexes based on schema
        Object.entries(schema.stores).forEach(([storeName, storeConfig]) => {
          let store: IDBObjectStore;
          
          if (!db.objectStoreNames.contains(storeName)) {
            store = db.createObjectStore(storeName, {
              keyPath: storeConfig.keyPath,
              autoIncrement: storeConfig.autoIncrement
            });
          } else {
            store = transaction.objectStore(storeName);
          }
          
          // Create indexes
          Object.entries(storeConfig.indexes).forEach(([indexName, indexConfig]) => {
            if (!store.indexNames.contains(indexName)) {
              store.createIndex(indexName, indexConfig.keyPath, {
                unique: indexConfig.unique || false
              });
            }
          });
        });
        
        // Run migrations
        const migrations = getRequiredMigrations(oldVersion, newVersion);
        if (migrations.length > 0) {
          await runMigrations(db, transaction, migrations);
        }
        
        // Custom upgrade logic
        if (onUpgradeNeeded) {
          onUpgradeNeeded(db, transaction, oldVersion, newVersion);
        }
        
        console.log(`Database ${dbName} upgrade completed successfully`);
      } catch (error) {
        console.error(`Database ${dbName} upgrade failed:`, error);
        reject(error);
      }
    };
  });
}

// Utility functions for schema management
export function getSchemaVersion(dbName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    
    request.onsuccess = () => {
      const db = request.result;
      const version = db.version;
      db.close();
      resolve(version);
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to get version for database ${dbName}`));
    };
  });
}

export async function deleteDatabase(dbName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    
    request.onsuccess = () => {
      console.log(`Database ${dbName} deleted successfully`);
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to delete database ${dbName}: ${request.error}`));
    };
    
    request.onblocked = () => {
      console.warn(`Database ${dbName} deletion blocked - close all connections first`);
    };
  });
}
