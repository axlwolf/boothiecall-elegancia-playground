import { PhotoSession, SessionSummary, SessionStats } from '@/types/session';

const STORAGE_KEY = 'boothie-call-sessions';
const DB_NAME = 'BoothieCallDB';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';
const MAX_SESSIONS = 50;

interface StorageAdapter {
  saveSession(session: PhotoSession): Promise<void>;
  getAllSessions(): Promise<PhotoSession[]>;
  getSession(id: string): Promise<PhotoSession | null>;
  deleteSession(id: string): Promise<boolean>;
  clearAllSessions(): Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  async saveSession(session: PhotoSession): Promise<void> {
    const sessions = await this.getAllSessions();
    sessions.unshift(session);
    const limitedSessions = sessions.slice(0, MAX_SESSIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSessions));
  }

  async getAllSessions(): Promise<PhotoSession[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load sessions from localStorage:', error);
      return [];
    }
  }

  async getSession(id: string): Promise<PhotoSession | null> {
    const sessions = await this.getAllSessions();
    return sessions.find(session => session.id === id) || null;
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      const sessions = await this.getAllSessions();
      const filteredSessions = sessions.filter(session => session.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions));
      return true;
    } catch (error) {
      console.error('Failed to delete session from localStorage:', error);
      return false;
    }
  }

  async clearAllSessions(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }
}

class IndexedDBAdapter implements StorageAdapter {
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async saveSession(session: PhotoSession): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.put(session);
      request.onsuccess = () => {
        // Clean up old sessions if we have too many
        this.cleanupOldSessions();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSessions(): Promise<PhotoSession[]> {
    const db = await this.getDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('createdAt');
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev'); // Get newest first
      const sessions: PhotoSession[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions.slice(0, MAX_SESSIONS));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getSession(id: string): Promise<PhotoSession | null> {
    const db = await this.getDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSession(id: string): Promise<boolean> {
    const db = await this.getDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('Failed to delete session from IndexedDB:', request.error);
        resolve(false);
      };
    });
  }

  async clearAllSessions(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async cleanupOldSessions(): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      if (sessions.length <= MAX_SESSIONS) return;

      const db = await this.getDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Delete sessions beyond the limit
      const sessionsToDelete = sessions.slice(MAX_SESSIONS);
      for (const session of sessionsToDelete) {
        store.delete(session.id);
      }
    } catch (error) {
      console.error('Failed to cleanup old sessions in IndexedDB:', error);
    }
  }
}

export class HybridStorageService {
  private static instance: HybridStorageService;
  private adapter: StorageAdapter;
  private usingIndexedDB = false;

  private constructor() {
    this.adapter = new LocalStorageAdapter();
  }

  static getInstance(): HybridStorageService {
    if (!HybridStorageService.instance) {
      HybridStorageService.instance = new HybridStorageService();
    }
    return HybridStorageService.instance;
  }

  private async switchToIndexedDB(): Promise<void> {
    if (this.usingIndexedDB) return;

    console.log('Switching to IndexedDB due to localStorage quota exceeded');
    
    try {
      // Get existing sessions from localStorage
      const existingSessions = await this.adapter.getAllSessions();
      
      // Switch to IndexedDB
      this.adapter = new IndexedDBAdapter();
      this.usingIndexedDB = true;
      
      // Migrate existing sessions to IndexedDB
      for (const session of existingSessions) {
        await this.adapter.saveSession(session);
      }
      
      // Clear localStorage to free up space
      localStorage.removeItem(STORAGE_KEY);
      
      console.log(`Migrated ${existingSessions.length} sessions to IndexedDB`);
    } catch (error) {
      console.error('Failed to switch to IndexedDB:', error);
    }
  }

  async saveSession(session: PhotoSession): Promise<void> {
    try {
      await this.adapter.saveSession(session);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        await this.switchToIndexedDB();
        await this.adapter.saveSession(session);
      } else {
        throw error;
      }
    }
  }

  async getAllSessions(): Promise<PhotoSession[]> {
    return this.adapter.getAllSessions();
  }

  async getSessionSummaries(): Promise<SessionSummary[]> {
    const sessions = await this.getAllSessions();
    return sessions.map(session => ({
      id: session.id,
      layoutName: session.layout.name,
      templateName: session.template.name,
      photoCount: session.photos.length,
      createdAt: session.createdAt,
      thumbnailUrl: session.finalImageUrl
    }));
  }

  async getSession(id: string): Promise<PhotoSession | null> {
    return this.adapter.getSession(id);
  }

  async deleteSession(id: string): Promise<boolean> {
    return this.adapter.deleteSession(id);
  }

  async clearAllSessions(): Promise<void> {
    await this.adapter.clearAllSessions();
  }

  async getSessionStats(): Promise<SessionStats> {
    const sessions = await this.getAllSessions();
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalPhotos: 0,
        favoriteLayout: '',
        favoriteTemplate: '',
        averageSessionDuration: 0,
        mostUsedFilters: []
      };
    }

    // Calculate statistics
    const totalPhotos = sessions.reduce((sum, session) => sum + session.photos.length, 0);
    const totalDuration = sessions.reduce((sum, session) => sum + session.metadata.duration, 0);
    
    // Find favorite layout
    const layoutCounts = sessions.reduce((acc, session) => {
      acc[session.layout.name] = (acc[session.layout.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favoriteLayout = Object.entries(layoutCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Find favorite template
    const templateCounts = sessions.reduce((acc, session) => {
      acc[session.template.name] = (acc[session.template.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favoriteTemplate = Object.entries(templateCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Find most used filters
    const filterCounts = sessions.reduce((acc, session) => {
      session.metadata.filtersUsed.forEach(filter => {
        acc[filter] = (acc[filter] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedFilters = Object.entries(filterCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalSessions: sessions.length,
      totalPhotos,
      favoriteLayout,
      favoriteTemplate,
      averageSessionDuration: Math.round(totalDuration / sessions.length),
      mostUsedFilters
    };
  }

  async exportSessions(): Promise<string> {
    const sessions = await this.getAllSessions();
    return JSON.stringify(sessions, null, 2);
  }

  async importSessions(jsonData: string): Promise<boolean> {
    try {
      const sessions = JSON.parse(jsonData) as PhotoSession[];
      if (Array.isArray(sessions)) {
        // Clear existing sessions and import new ones
        await this.clearAllSessions();
        for (const session of sessions) {
          await this.saveSession(session);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import sessions:', error);
      return false;
    }
  }

  getStorageType(): string {
    return this.usingIndexedDB ? 'IndexedDB' : 'localStorage';
  }
}