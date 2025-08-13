/**
 * Service Worker Cleanup Utility
 * Completely removes service workers and caches in development
 */

export class ServiceWorkerCleanup {
  private static instance: ServiceWorkerCleanup;

  public static getInstance(): ServiceWorkerCleanup {
    if (!ServiceWorkerCleanup.instance) {
      ServiceWorkerCleanup.instance = new ServiceWorkerCleanup();
    }
    return ServiceWorkerCleanup.instance;
  }

  /**
   * Check if we're in development mode
   */
  private isDevelopment(): boolean {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '' ||
      import.meta.env.DEV
    );
  }

  /**
   * Unregister all service workers
   */
  public async unregisterAllServiceWorkers(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        console.log('No service workers to unregister');
        return;
      }

      console.log(`Found ${registrations.length} service worker(s) to unregister`);

      for (const registration of registrations) {
        console.log('Unregistering service worker:', registration.scope);
        await registration.unregister();
      }

      console.log('All service workers unregistered successfully');
    } catch (error) {
      console.error('Error unregistering service workers:', error);
    }
  }

  /**
   * Clear all caches
   */
  public async clearAllCaches(): Promise<void> {
    if (!('caches' in window)) {
      console.log('Cache API not supported');
      return;
    }

    try {
      const cacheNames = await caches.keys();
      
      if (cacheNames.length === 0) {
        console.log('No caches to clear');
        return;
      }

      console.log(`Found ${cacheNames.length} cache(s) to clear`);

      for (const cacheName of cacheNames) {
        console.log('Deleting cache:', cacheName);
        await caches.delete(cacheName);
      }

      console.log('All caches cleared successfully');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }

  /**
   * Complete cleanup - unregister SWs and clear caches
   */
  public async performCompleteCleanup(): Promise<void> {
    console.log('Starting complete service worker cleanup...');
    
    await this.unregisterAllServiceWorkers();
    await this.clearAllCaches();
    
    console.log('Service worker cleanup completed');
  }

  /**
   * Auto-cleanup in development mode
   */
  public async autoCleanupInDevelopment(): Promise<void> {
    if (!this.isDevelopment()) {
      console.log('Not in development mode - skipping SW cleanup');
      return;
    }

    console.log('Development mode detected - performing SW cleanup');
    await this.performCompleteCleanup();
  }

  /**
   * Monitor for service worker registrations and clean them up
   */
  public startDevelopmentMonitoring(): void {
    if (!this.isDevelopment()) {
      return;
    }

    console.log('Starting development SW monitoring...');

    // Clean up immediately
    this.autoCleanupInDevelopment();

    // Monitor for new registrations every 5 seconds
    const monitorInterval = setInterval(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          console.log('Detected service worker registrations in dev mode - cleaning up');
          await this.unregisterAllServiceWorkers();
        }
      }
    }, 5000);

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(monitorInterval);
    });
  }

  /**
   * Force reload after cleanup
   */
  public async cleanupAndReload(): Promise<void> {
    await this.performCompleteCleanup();
    
    // Wait a bit for cleanup to complete
    setTimeout(() => {
      console.log('Reloading page after cleanup...');
      window.location.reload();
    }, 1000);
  }
}

// Export singleton instance
export const swCleanup = ServiceWorkerCleanup.getInstance();
