/* eslint-disable @typescript-eslint/no-explicit-any */
// Synchronization service for BoothieCall Elegancia Playground
// Handles real-time sync between main app and admin interface using BroadcastChannel

import {
  SyncEvent,
  SyncStatus,
  SyncConflict,
  SyncError
} from '@/types/persistence';

const SYNC_CHANNEL_NAME = 'boothie-call-sync';
const SYNC_STORAGE_KEY = 'boothie-sync-status';
const CONFLICT_STORAGE_KEY = 'boothie-sync-conflicts';

export type SyncEventHandler = (event: SyncEvent) => void;
export type ConflictResolver = (conflict: SyncConflict) => Promise<unknown>;

export class SyncService {
  private static instance: SyncService;
  private channel: BroadcastChannel | null = null;
  private eventHandlers: Map<string, SyncEventHandler[]> = new Map();
  private conflictResolvers: Map<string, ConflictResolver> = new Map();
  private isOnline: boolean = navigator.onLine;
  private pendingEvents: SyncEvent[] = [];

  private constructor() {
    this.initializeBroadcastChannel();
    this.setupOnlineStatusListener();
    this.loadPendingEvents();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private initializeBroadcastChannel(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      this.channel.addEventListener('message', this.handleBroadcastMessage.bind(this));
    } else {
      console.warn('BroadcastChannel not supported, falling back to localStorage events');
      window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private loadPendingEvents(): void {
    try {
      const stored = localStorage.getItem('boothie-pending-sync-events');
      if (stored) {
        this.pendingEvents = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load pending sync events:', error);
      this.pendingEvents = [];
    }
  }

  private savePendingEvents(): void {
    try {
      localStorage.setItem('boothie-pending-sync-events', JSON.stringify(this.pendingEvents));
    } catch (error) {
      console.error('Failed to save pending sync events:', error);
    }
  }

  private handleBroadcastMessage(event: MessageEvent): void {
    try {
      const syncEvent: SyncEvent = event.data;
      this.processIncomingEvent(syncEvent);
    } catch (error) {
      console.error('Failed to process broadcast message:', error);
    }
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (event.key === 'boothie-sync-broadcast' && event.newValue) {
      try {
        const syncEvent: SyncEvent = JSON.parse(event.newValue);
        this.processIncomingEvent(syncEvent);
      } catch (error) {
        console.error('Failed to process storage sync event:', error);
      }
    }
  }

  private processIncomingEvent(syncEvent: SyncEvent): void {
    const handlers = this.eventHandlers.get(syncEvent.entity) || [];
    const globalHandlers = this.eventHandlers.get('*') || [];
    
    [...handlers, ...globalHandlers].forEach(handler => {
      try {
        handler(syncEvent);
      } catch (error) {
        console.error('Error in sync event handler:', error);
      }
    });
  }

  private async processPendingEvents(): Promise<void> {
    if (!this.isOnline || this.pendingEvents.length === 0) {
      return;
    }

    const eventsToProcess = [...this.pendingEvents];
    this.pendingEvents = [];
    this.savePendingEvents();

    for (const event of eventsToProcess) {
      try {
        await this.broadcastEvent(event);
      } catch (error) {
        console.error('Failed to process pending sync event:', error);
        this.pendingEvents.push(event);
      }
    }

    if (this.pendingEvents.length > 0) {
      this.savePendingEvents();
    }
  }

  // Public API methods

  /**
   * Subscribe to sync events for a specific entity type
   * @param entityType - The entity type to listen for ('*' for all events)
   * @param handler - The event handler function
   */
  subscribe(entityType: string, handler: SyncEventHandler): () => void {
    if (!this.eventHandlers.has(entityType)) {
      this.eventHandlers.set(entityType, []);
    }
    
    this.eventHandlers.get(entityType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(entityType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Broadcast a sync event to all connected instances
   */
  async broadcastEvent(event: SyncEvent): Promise<void> {
    try {
      if (this.channel) {
        this.channel.postMessage(event);
      } else {
        // Fallback to localStorage for older browsers
        localStorage.setItem('boothie-sync-broadcast', JSON.stringify(event));
        localStorage.removeItem('boothie-sync-broadcast');
      }

      // Log the event for debugging (disabled to prevent spam)
      // console.log(`Sync event broadcasted:`, event);
    } catch (error) {
      console.error('Failed to broadcast sync event:', error);
      
      if (!this.isOnline) {
        this.pendingEvents.push(event);
        this.savePendingEvents();
      }
      
      throw new SyncError('Failed to broadcast sync event', error);
    }
  }

  /**
   * Create and broadcast a sync event
   */
  async emitEvent(
    type: SyncEvent['type'],
    entity: SyncEvent['entity'],
    id: string,
    data?: Record<string, unknown>,
    source: 'main' | 'admin' = 'main'
  ): Promise<void> {
    const event: SyncEvent = {
      type,
      entity,
      id,
      data,
      timestamp: new Date().toISOString(),
      source
    };

    await this.broadcastEvent(event);
  }

  /**
   * Register a conflict resolver for a specific entity type
   */
  registerConflictResolver(entityType: string, resolver: ConflictResolver): void {
    this.conflictResolvers.set(entityType, resolver);
  }

  /**
   * Resolve a sync conflict
   */
  async resolveConflict(conflict: SyncConflict): Promise<unknown> {
    const resolver = this.conflictResolvers.get(conflict.entity);
    
    if (resolver) {
      try {
        const resolution = await resolver(conflict);
        await this.removeConflict(conflict.id);
        return resolution;
      } catch (error) {
        console.error('Failed to resolve conflict:', error);
        throw new SyncError('Failed to resolve conflict', error);
      }
    } else {
      throw new SyncError(`No conflict resolver registered for entity type: ${conflict.entity}`);
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const conflicts = await this.getConflicts();
    
    return {
      lastSync: this.getLastSyncTime(),
      pendingChanges: this.pendingEvents.length,
      isOnline: this.isOnline,
      conflicts
    };
  }

  /**
   * Get all unresolved conflicts
   */
  async getConflicts(): Promise<SyncConflict[]> {
    try {
      const stored = localStorage.getItem(CONFLICT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load conflicts:', error);
      return [];
    }
  }

  /**
   * Add a new conflict
   */
  async addConflict(conflict: SyncConflict): Promise<void> {
    try {
      const conflicts = await this.getConflicts();
      conflicts.push(conflict);
      localStorage.setItem(CONFLICT_STORAGE_KEY, JSON.stringify(conflicts));
    } catch (error) {
      console.error('Failed to save conflict:', error);
      throw new SyncError('Failed to save conflict', error);
    }
  }

  /**
   * Remove a resolved conflict
   */
  async removeConflict(conflictId: string): Promise<void> {
    try {
      const conflicts = await this.getConflicts();
      const filteredConflicts = conflicts.filter(c => c.id !== conflictId);
      localStorage.setItem(CONFLICT_STORAGE_KEY, JSON.stringify(filteredConflicts));
    } catch (error) {
      console.error('Failed to remove conflict:', error);
      throw new SyncError('Failed to remove conflict', error);
    }
  }

  /**
   * Clear all conflicts
   */
  async clearConflicts(): Promise<void> {
    try {
      localStorage.removeItem(CONFLICT_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear conflicts:', error);
      throw new SyncError('Failed to clear conflicts', error);
    }
  }

  /**
   * Force sync all pending changes
   */
  async forcSync(): Promise<void> {
    await this.processPendingEvents();
    this.updateLastSyncTime();
  }

  /**
   * Get the last sync timestamp
   */
  private getLastSyncTime(): string {
    return localStorage.getItem('boothie-last-sync') || new Date().toISOString();
  }

  /**
   * Update the last sync timestamp
   */
  private updateLastSyncTime(): void {
    localStorage.setItem('boothie-last-sync', new Date().toISOString());
  }

  /**
   * Check if sync is available (online and BroadcastChannel supported)
   */
  isSyncAvailable(): boolean {
    return this.isOnline && (this.channel !== null || typeof Storage !== 'undefined');
  }

  /**
   * Get sync statistics
   */
  getSyncStats(): {
    totalEventsBroadcasted: number;
    pendingEvents: number;
    unresolvedConflicts: number;
    isOnline: boolean;
    lastSync: string;
  } {
    return {
      totalEventsBroadcasted: this.getTotalEventsBroadcasted(),
      pendingEvents: this.pendingEvents.length,
      unresolvedConflicts: 0, // Will be updated when conflicts are loaded
      isOnline: this.isOnline,
      lastSync: this.getLastSyncTime()
    };
  }

  private getTotalEventsBroadcasted(): number {
    const stored = localStorage.getItem('boothie-sync-stats');
    if (stored) {
      try {
        const stats = JSON.parse(stored);
        return stats.totalEventsBroadcasted || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.channel) {
      this.channel.close();
    }
    
    window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    window.removeEventListener('online', () => this.isOnline = true);
    window.removeEventListener('offline', () => this.isOnline = false);
    
    this.eventHandlers.clear();
    this.conflictResolvers.clear();
  }
}
