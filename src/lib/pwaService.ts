/**
 * PWA Service for BoothieCall Elegancia Playground
 * Handles service worker registration, installation prompts, and PWA features
 */

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  supportsNotifications: boolean;
  supportsBackgroundSync: boolean;
  supportsPushNotifications: boolean;
  supportsShare: boolean;
  supportsFileHandling: boolean;
}

export interface PWAUpdateInfo {
  available: boolean;
  waiting: ServiceWorker | null;
  installing: ServiceWorker | null;
}

export interface PWANotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: Record<string, unknown>;
}

export interface PWAShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

// Extended Navigator interface for iOS standalone detection
interface ExtendedNavigator extends Navigator {
  standalone?: boolean;
}

// Extended Window interface for development cleanup
declare global {
  interface Window {
    cleanupPWA?: () => Promise<void>;
  }
}

// Message response interface
interface MessageResponse {
  data?: {
    error?: string;
    success?: boolean;
    message?: string;
    timestamp?: number;
  };
}

export class PWAService {
  private static instance: PWAService;
  private registration: ServiceWorkerRegistration | null = null;
  private installPrompt: PWAInstallPrompt | null = null;
  private updateCallbacks: Array<(updateInfo: PWAUpdateInfo) => void> = [];
  private installCallbacks: Array<(canInstall: boolean) => void> = [];
  private isDevelopment: boolean = false;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  /**
   * Initialize PWA service
   */
  private async initialize(): Promise<void> {
    if (!this.isSupported()) {
      console.warn('PWA features not supported in this browser');
      return;
    }

    // Detect development mode
    this.isDevelopment = this.detectDevelopmentMode();
    
    if (this.isDevelopment) {
      console.log('🔧 PWA Service: Development mode detected');
      await this.handleDevelopmentMode();
    }

    await this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNotificationPermission();
    this.detectStandaloneMode();
    
    // Setup development cleanup if needed
    if (this.isDevelopment) {
      this.setupDevelopmentCleanup();
    }
  }

  /**
   * Check if PWA features are supported
   */
  public isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      // Get base path from document base or default to /playground/
      const basePath = document.querySelector('base')?.getAttribute('href') || '/playground/';
      const swPath = basePath + 'sw.js';
      
      this.registration = await navigator.serviceWorker.register(swPath, {
        scope: basePath
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          this.handleServiceWorkerUpdate(newWorker);
        }
      });

      // Check for existing updates
      if (this.registration.waiting) {
        this.notifyUpdateCallbacks({
          available: true,
          waiting: this.registration.waiting,
          installing: null
        });
      }

      // Listen for controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller changed');
        window.location.reload();
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Handle service worker updates
   */
  private handleServiceWorkerUpdate(newWorker: ServiceWorker): void {
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New update available
          this.notifyUpdateCallbacks({
            available: true,
            waiting: newWorker,
            installing: null
          });
        } else {
          // First install
          console.log('Service Worker installed for the first time');
        }
      }
    });
  }

  /**
   * Setup install prompt handling
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event as unknown as PWAInstallPrompt;
      this.notifyInstallCallbacks(true);
      console.log('PWA install prompt available');
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.installPrompt = null;
      this.notifyInstallCallbacks(false);
    });
  }

  /**
   * Setup notification permission
   */
  private setupNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      // Don't request permission immediately, wait for user interaction
      console.log('Notification permission available to request');
    }
  }

  /**
   * Detect if running in standalone mode
   */
  private detectStandaloneMode(): void {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as unknown as { standalone?: boolean }).standalone ||
                        document.referrer.includes('android-app://');

    if (isStandalone) {
      console.log('Running in standalone PWA mode');
      document.body.classList.add('pwa-standalone');
    }
  }

  /**
   * Get PWA capabilities
   */
  public getCapabilities(): PWACapabilities {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as ExtendedNavigator).standalone ||
                        document.referrer.includes('android-app://');

    return {
      isInstallable: !!this.installPrompt,
      isInstalled: isStandalone,
      isStandalone,
      supportsNotifications: 'Notification' in window,
      supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      supportsPushNotifications: 'serviceWorker' in navigator && 'PushManager' in window,
      supportsShare: 'share' in navigator,
      supportsFileHandling: 'launchQueue' in window
    };
  }

  /**
   * Prompt user to install PWA
   */
  public async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choice = await this.installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        console.log('User accepted PWA install');
        this.installPrompt = null;
        return true;
      } else {
        console.log('User dismissed PWA install');
        return false;
      }
    } catch (error) {
      console.error('Error prompting PWA install:', error);
      return false;
    }
  }

  /**
   * Apply pending service worker update
   */
  public async applyUpdate(): Promise<void> {
    if (!this.registration?.waiting) {
      console.warn('No pending service worker update');
      return;
    }

    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * Request notification permission
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Show local notification
   */
  public async showNotification(options: PWANotificationOptions): Promise<void> {
    const permission = await this.requestNotificationPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    if (this.registration) {
      await this.registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        badge: options.badge || '/icons/badge-72x72.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction,
        data: options.data
      });
    } else {
      // Fallback to browser notification
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icons/icon-192x192.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction,
        data: options.data
      });
    }
  }

  /**
   * Share content using Web Share API
   */
  public async share(data: PWAShareData): Promise<boolean> {
    if (!('share' in navigator)) {
      console.warn('Web Share API not supported');
      return false;
    }

    try {
      await navigator.share(data);
      console.log('Content shared successfully');
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing content:', error);
      }
      return false;
    }
  }

  /**
   * Register for background sync
   */
  public async registerBackgroundSync(tag: string): Promise<void> {
    if (!this.registration) {
      console.warn('Service Worker not registered');
      return;
    }

    if (!('sync' in window.ServiceWorkerRegistration.prototype)) {
      console.warn('Background Sync not supported');
      return;
    }

    try {
      const syncManager = (this.registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync;
      await syncManager.register(tag);
      console.log(`Background sync registered: ${tag}`);
    } catch (error) {
      console.error('Error registering background sync:', error);
    }
  }

  /**
   * Cache URLs for offline use
   */
  public async cacheUrls(urls: string[]): Promise<void> {
    if (!this.registration) {
      console.warn('Service Worker not registered');
      return;
    }

    try {
      // Send message to service worker to cache URLs
      this.registration.active?.postMessage({
        type: 'CACHE_URLS',
        urls
      });
      console.log('URLs queued for caching:', urls);
    } catch (error) {
      console.error('Error caching URLs:', error);
    }
  }

  /**
   * Get service worker version
   */
  public async getVersion(): Promise<string> {
    if (!this.registration?.active) {
      return 'unknown';
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version || 'unknown');
      };

      this.registration!.active!.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }

  /**
   * Subscribe to update notifications
   */
  public onUpdateAvailable(callback: (updateInfo: PWAUpdateInfo) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to install availability notifications
   */
  public onInstallAvailable(callback: (canInstall: boolean) => void): () => void {
    this.installCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.installCallbacks.indexOf(callback);
      if (index > -1) {
        this.installCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify update callbacks
   */
  private notifyUpdateCallbacks(updateInfo: PWAUpdateInfo): void {
    this.updateCallbacks.forEach(callback => callback(updateInfo));
  }

  /**
   * Notify install callbacks
   */
  private notifyInstallCallbacks(canInstall: boolean): void {
    this.installCallbacks.forEach(callback => callback(canInstall));
  }

  /**
   * Check if device is mobile
   */
  public isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Check if device is iOS
   */
  public isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  /**
   * Get install instructions for iOS
   */
  public getIOSInstallInstructions(): string[] {
    return [
      'Tap the Share button',
      'Scroll down and tap "Add to Home Screen"',
      'Tap "Add" to install the app'
    ];
  }

  /**
   * Detect if we're in development mode
   */
  private detectDevelopmentMode(): boolean {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    
    // Development indicators
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isDevPort = port === '5173' || port === '3000' || port === '8080' || port === '4173';
    const isFileProtocol = protocol === 'file:';
    const hasDevQuery = window.location.search.includes('dev=true');
    const isViteDevServer = hostname === 'localhost' && (port === '5173' || port === '4173');
    
    return isLocalhost || isDevPort || isFileProtocol || hasDevQuery || isViteDevServer;
  }

  /**
   * Handle development mode initialization
   */
  private async handleDevelopmentMode(): Promise<void> {
    console.log('🔧 PWA: Setting up development mode');
    
    // Check for existing problematic service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        let hasProblematicWorkers = false;
        
        for (const registration of registrations) {
          if (registration.active && registration.active.state === 'activated') {
            // Check if this worker might cause issues
            const workerUrl = registration.active.scriptURL;
            if (workerUrl.includes('sw.js') && !workerUrl.includes('dev=true')) {
              hasProblematicWorkers = true;
              console.warn('🚨 PWA: Found potentially problematic service worker:', workerUrl);
            }
          }
        }
        
        if (hasProblematicWorkers) {
          console.log('🧹 PWA: Suggesting cleanup for development');
          this.suggestDevelopmentCleanup();
        }
      } catch (error) {
        console.warn('PWA: Could not check existing service workers:', error);
      }
    }
  }

  /**
   * Setup development cleanup helpers
   */
  private setupDevelopmentCleanup(): void {
    // Listen for page visibility changes to detect dev server restarts
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isDevelopment) {
        this.checkForDevServerRestart();
      }
    });
    
    // Setup keyboard shortcut for manual cleanup (Ctrl+Shift+C)
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'C' && this.isDevelopment) {
        event.preventDefault();
        this.performDevelopmentCleanup();
      }
    });
    
    // Add cleanup helper to window for manual access
    if (this.isDevelopment) {
      window.cleanupPWA = () => this.performDevelopmentCleanup();
      console.log('🔧 PWA: Development cleanup available via window.cleanupPWA() or Ctrl+Shift+C');
    }
  }

  /**
   * Check for development server restart
   */
  private async checkForDevServerRestart(): Promise<void> {
    if (!this.isDevelopment) return;
    
    try {
      // Try to fetch a dev server specific endpoint
      const response = await fetch('/__vite_ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        console.log('🔄 PWA: Dev server restart detected, checking service worker status');
        await this.validateServiceWorkerState();
      }
    } catch (error) {
      // This is expected if not using Vite or if the endpoint doesn't exist
    }
  }

  /**
   * Validate service worker state in development
   */
  private async validateServiceWorkerState(): Promise<void> {
    if (!('serviceWorker' in navigator) || !this.isDevelopment) return;
    
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      let hasIssues = false;
      
      for (const registration of registrations) {
        if (registration.active) {
          // Send a ping to check if the service worker is responsive
          try {
            const messageChannel = new MessageChannel();
            const responsePromise = new Promise((resolve) => {
              messageChannel.port1.onmessage = resolve;
              setTimeout(() => resolve({ data: { error: 'timeout' } }), 1000);
            });
            
            registration.active.postMessage(
              { type: 'DEV_PING' },
              [messageChannel.port2]
            );
            
            const response = await responsePromise as MessageResponse;
            if (response.data?.error) {
              hasIssues = true;
            }
          } catch (error) {
            hasIssues = true;
          }
        }
      }
      
      if (hasIssues) {
        console.warn('🚨 PWA: Service worker issues detected in development');
        this.suggestDevelopmentCleanup();
      }
    } catch (error) {
      console.warn('PWA: Could not validate service worker state:', error);
    }
  }

  /**
   * Suggest development cleanup to user
   */
  private suggestDevelopmentCleanup(): void {
    if (!this.isDevelopment) return;
    
    console.log('💡 PWA: Consider running cleanup if you experience issues:');
    console.log('   • Visit: ' + window.location.origin + '/cleanup.html');
    console.log('   • Or run: window.cleanupPWA()');
    console.log('   • Or press: Ctrl+Shift+C');
    
    // Show a subtle notification if possible
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('PWA Development', {
        body: 'Service worker cleanup may be needed. Check console for details.',
        icon: '/icons/icon-192x192.png',
        tag: 'pwa-dev-cleanup',
        requireInteraction: false
      });
    }
  }

  /**
   * Perform development cleanup
   */
  public async performDevelopmentCleanup(): Promise<void> {
    if (!this.isDevelopment) {
      console.warn('PWA: Cleanup only available in development mode');
      return;
    }
    
    console.log('🧹 PWA: Starting development cleanup...');
    
    try {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('✅ PWA: Unregistered service worker:', registration.scope);
        }
      }
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log('✅ PWA: Cleared cache:', cacheName);
        }
      }
      
      // Clear relevant localStorage items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('pwa') || key.includes('sw') || key.includes('cache'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('✅ PWA: Cleared localStorage:', key);
      });
      
      console.log('🎉 PWA: Development cleanup completed successfully!');
      console.log('💡 PWA: Refresh the page to start fresh');
      
      // Optionally reload the page after a short delay
      setTimeout(() => {
        if (confirm('PWA cleanup completed. Reload the page to start fresh?')) {
          window.location.reload();
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ PWA: Cleanup failed:', error);
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.updateCallbacks = [];
    this.installCallbacks = [];
    this.installPrompt = null;
  }
}

// Export singleton instance
export const pwaService = PWAService.getInstance();
