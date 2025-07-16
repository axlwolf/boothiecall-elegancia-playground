import { PhotoSession, SessionSummary, SessionStats } from '@/types/session';

const STORAGE_KEY = 'boothie-call-sessions';
const MAX_SESSIONS = 50; // Limit stored sessions to prevent storage overflow

export class SessionStorageService {
  private static instance: SessionStorageService;

  static getInstance(): SessionStorageService {
    if (!SessionStorageService.instance) {
      SessionStorageService.instance = new SessionStorageService();
    }
    return SessionStorageService.instance;
  }

  /**
   * Save a new photo session
   */
  saveSession(session: PhotoSession): void {
    try {
      const sessions = this.getAllSessions();
      sessions.unshift(session); // Add to beginning
      
      // Keep only the most recent sessions
      const limitedSessions = sessions.slice(0, MAX_SESSIONS);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSessions));
    } catch (error) {
      console.error('Failed to save session:', error);
      // If localStorage is full, remove oldest sessions and retry
      this.cleanupOldSessions();
      try {
        const sessions = this.getAllSessions();
        sessions.unshift(session);
        const limitedSessions = sessions.slice(0, MAX_SESSIONS / 2); // Keep fewer sessions
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSessions));
      } catch (retryError) {
        console.error('Failed to save session after cleanup:', retryError);
      }
    }
  }

  /**
   * Get all saved sessions
   */
  getAllSessions(): PhotoSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  /**
   * Get session summaries for quick loading
   */
  getSessionSummaries(): SessionSummary[] {
    const sessions = this.getAllSessions();
    return sessions.map(session => ({
      id: session.id,
      layoutName: session.layout.name,
      templateName: session.template.name,
      photoCount: session.photos.length,
      createdAt: session.createdAt,
      thumbnailUrl: session.finalImageUrl
    }));
  }

  /**
   * Get a specific session by ID
   */
  getSession(id: string): PhotoSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(session => session.id === id) || null;
  }

  /**
   * Delete a session by ID
   */
  deleteSession(id: string): boolean {
    try {
      const sessions = this.getAllSessions();
      const filteredSessions = sessions.filter(session => session.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions));
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear sessions:', error);
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats(): SessionStats {
    const sessions = this.getAllSessions();
    
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

  /**
   * Export sessions as JSON for backup
   */
  exportSessions(): string {
    const sessions = this.getAllSessions();
    return JSON.stringify(sessions, null, 2);
  }

  /**
   * Import sessions from JSON backup
   */
  importSessions(jsonData: string): boolean {
    try {
      const sessions = JSON.parse(jsonData) as PhotoSession[];
      // Validate the data structure
      if (Array.isArray(sessions)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import sessions:', error);
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const data = localStorage.getItem(STORAGE_KEY) || '';
      const used = new Blob([data]).size;
      const available = 5 * 1024 * 1024; // Assume 5MB localStorage limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Clean up old sessions to free space
   */
  private cleanupOldSessions(): void {
    try {
      const sessions = this.getAllSessions();
      const recentSessions = sessions.slice(0, Math.floor(MAX_SESSIONS / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSessions));
    } catch (error) {
      console.error('Failed to cleanup old sessions:', error);
    }
  }
}