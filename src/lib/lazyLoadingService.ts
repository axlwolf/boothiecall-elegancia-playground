/**
 * Intelligent lazy loading service for templates, assets, and images
 * Provides priority-based loading with intersection observer and preloading strategies
 */

export interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number | number[];
  priority?: 'low' | 'normal' | 'high' | 'critical';
  preload?: boolean;
  retryAttempts?: number;
  timeout?: number;
}

export interface LoadableResource {
  id: string;
  url: string;
  type: 'image' | 'template' | 'asset' | 'font';
  priority: 'low' | 'normal' | 'high' | 'critical';
  loaded: boolean;
  loading: boolean;
  error?: Error;
  element?: HTMLElement;
  onLoad?: (resource: LoadableResource) => void;
  onError?: (resource: LoadableResource, error: Error) => void;
}

export class LazyLoadingService {
  private static instance: LazyLoadingService;
  private observer: IntersectionObserver | null = null;
  private loadQueue: Map<string, LoadableResource> = new Map();
  private loadedResources: Set<string> = new Set();
  private loadingResources: Set<string> = new Set();
  private retryQueue: Map<string, number> = new Map();
  
  private readonly DEFAULT_OPTIONS: LazyLoadOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    priority: 'normal',
    preload: false,
    retryAttempts: 3,
    timeout: 10000
  };

  static getInstance(): LazyLoadingService {
    if (!LazyLoadingService.instance) {
      LazyLoadingService.instance = new LazyLoadingService();
    }
    return LazyLoadingService.instance;
  }

  constructor() {
    this.initializeObserver();
    this.setupPreloadStrategies();
  }

  /**
   * Initialize intersection observer for viewport-based loading
   */
  private initializeObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const resourceId = element.dataset.lazyId;
            
            if (resourceId && this.loadQueue.has(resourceId)) {
              this.loadResource(resourceId);
              this.observer?.unobserve(element);
            }
          }
        });
      },
      {
        rootMargin: this.DEFAULT_OPTIONS.rootMargin,
        threshold: this.DEFAULT_OPTIONS.threshold
      }
    );
  }

  /**
   * Setup preloading strategies based on user behavior and priorities
   */
  private setupPreloadStrategies(): void {
    // Preload critical resources immediately
    this.preloadCriticalResources();
    
    // Setup idle time preloading
    this.setupIdlePreloading();
    
    // Setup connection-aware preloading
    this.setupConnectionAwarePreloading();
  }

  /**
   * Register a resource for lazy loading
   */
  registerResource(
    id: string,
    url: string,
    type: LoadableResource['type'],
    element?: HTMLElement,
    options?: LazyLoadOptions
  ): LoadableResource {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    const resource: LoadableResource = {
      id,
      url,
      type,
      priority: mergedOptions.priority!,
      loaded: false,
      loading: false,
      element
    };

    this.loadQueue.set(id, resource);

    // Set up element observation if provided
    if (element && this.observer) {
      element.dataset.lazyId = id;
      this.observer.observe(element);
    }

    // Load immediately if critical priority or preload enabled
    if (mergedOptions.priority === 'critical' || mergedOptions.preload) {
      this.loadResource(id);
    }

    return resource;
  }

  /**
   * Load a specific resource
   */
  async loadResource(id: string): Promise<LoadableResource> {
    const resource = this.loadQueue.get(id);
    
    if (!resource) {
      throw new Error(`Resource ${id} not found in load queue`);
    }

    if (resource.loaded || resource.loading) {
      return resource;
    }

    resource.loading = true;
    this.loadingResources.add(id);

    try {
      await this.performLoad(resource);
      resource.loaded = true;
      resource.loading = false;
      this.loadedResources.add(id);
      this.loadingResources.delete(id);
      
      // Call success callback
      if (resource.onLoad) {
        resource.onLoad(resource);
      }

      // Remove from retry queue if successful
      this.retryQueue.delete(id);

    } catch (error) {
      resource.loading = false;
      resource.error = error as Error;
      this.loadingResources.delete(id);
      
      // Handle retry logic
      await this.handleLoadError(resource, error as Error);
    }

    return resource;
  }

  /**
   * Perform the actual loading based on resource type
   */
  private async performLoad(resource: LoadableResource): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Load timeout for resource ${resource.id}`));
      }, this.DEFAULT_OPTIONS.timeout);

      switch (resource.type) {
        case 'image':
          this.loadImage(resource, resolve, reject, timeout);
          break;
        case 'template':
          this.loadTemplate(resource, resolve, reject, timeout);
          break;
        case 'asset':
          this.loadAsset(resource, resolve, reject, timeout);
          break;
        case 'font':
          this.loadFont(resource, resolve, reject, timeout);
          break;
        default:
          clearTimeout(timeout);
          reject(new Error(`Unknown resource type: ${resource.type}`));
      }
    });
  }

  /**
   * Load image resource
   */
  private loadImage(
    resource: LoadableResource,
    resolve: () => void,
    reject: (error: Error) => void,
    timeout: NodeJS.Timeout
  ): void {
    const img = new Image();
    
    img.onload = () => {
      clearTimeout(timeout);
      
      // Update element if provided
      if (resource.element) {
        if (resource.element.tagName === 'IMG') {
          (resource.element as HTMLImageElement).src = resource.url;
        } else {
          resource.element.style.backgroundImage = `url(${resource.url})`;
        }
        resource.element.classList.add('lazy-loaded');
      }
      
      resolve();
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load image: ${resource.url}`));
    };

    img.src = resource.url;
  }

  /**
   * Load template resource (JSON or HTML)
   */
  private async loadTemplate(
    resource: LoadableResource,
    resolve: () => void,
    reject: (error: Error) => void,
    timeout: NodeJS.Timeout
  ): Promise<void> {
    try {
      const response = await fetch(resource.url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      
      // Store template content for later use
      (resource as any).content = content;
      
      clearTimeout(timeout);
      resolve();
      
    } catch (error) {
      clearTimeout(timeout);
      reject(error as Error);
    }
  }

  /**
   * Load generic asset resource
   */
  private async loadAsset(
    resource: LoadableResource,
    resolve: () => void,
    reject: (error: Error) => void,
    timeout: NodeJS.Timeout
  ): Promise<void> {
    try {
      const response = await fetch(resource.url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Store asset data
      (resource as any).data = await response.blob();
      
      clearTimeout(timeout);
      resolve();
      
    } catch (error) {
      clearTimeout(timeout);
      reject(error as Error);
    }
  }

  /**
   * Load font resource
   */
  private loadFont(
    resource: LoadableResource,
    resolve: () => void,
    reject: (error: Error) => void,
    timeout: NodeJS.Timeout
  ): void {
    if ('FontFace' in window) {
      const font = new FontFace('LazyFont', `url(${resource.url})`);
      
      font.load().then(() => {
        (document as any).fonts.add(font);
        clearTimeout(timeout);
        resolve();
      }).catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
    } else {
      // Fallback for older browsers
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = resource.url;
      
      link.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      link.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load font: ${resource.url}`));
      };
      
      document.head.appendChild(link);
    }
  }

  /**
   * Handle load errors with retry logic
   */
  private async handleLoadError(resource: LoadableResource, error: Error): Promise<void> {
    const currentRetries = this.retryQueue.get(resource.id) || 0;
    
    if (currentRetries < this.DEFAULT_OPTIONS.retryAttempts!) {
      this.retryQueue.set(resource.id, currentRetries + 1);
      
      // Exponential backoff
      const delay = Math.pow(2, currentRetries) * 1000;
      
      setTimeout(() => {
        this.loadResource(resource.id);
      }, delay);
      
    } else {
      // Max retries reached, call error callback
      if (resource.onError) {
        resource.onError(resource, error);
      }
      
      console.error(`Failed to load resource ${resource.id} after ${currentRetries} retries:`, error);
    }
  }

  /**
   * Preload critical resources immediately
   */
  private preloadCriticalResources(): void {
    // This will be called during initialization
    // Critical resources should be loaded immediately
    for (const [id, resource] of this.loadQueue) {
      if (resource.priority === 'critical') {
        this.loadResource(id);
      }
    }
  }

  /**
   * Setup idle time preloading for non-critical resources
   */
  private setupIdlePreloading(): void {
    if ('requestIdleCallback' in window) {
      const preloadDuringIdle = () => {
        (window as any).requestIdleCallback((deadline: any) => {
          while (deadline.timeRemaining() > 0) {
            const unloadedResource = this.getNextUnloadedResource('high');
            if (unloadedResource) {
              this.loadResource(unloadedResource.id);
            } else {
              break;
            }
          }
          
          // Schedule next idle preload
          setTimeout(preloadDuringIdle, 5000);
        });
      };
      
      preloadDuringIdle();
    }
  }

  /**
   * Setup connection-aware preloading
   */
  private setupConnectionAwarePreloading(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      // Only preload on fast connections
      if (connection && connection.effectiveType === '4g') {
        setTimeout(() => {
          this.preloadByPriority('normal');
        }, 2000);
      }
    }
  }

  /**
   * Get next unloaded resource by priority
   */
  private getNextUnloadedResource(minPriority: LoadableResource['priority']): LoadableResource | null {
    const priorities = ['critical', 'high', 'normal', 'low'];
    const minIndex = priorities.indexOf(minPriority);
    
    for (let i = 0; i <= minIndex; i++) {
      const priority = priorities[i] as LoadableResource['priority'];
      
      for (const resource of this.loadQueue.values()) {
        if (resource.priority === priority && !resource.loaded && !resource.loading) {
          return resource;
        }
      }
    }
    
    return null;
  }

  /**
   * Preload resources by priority level
   */
  async preloadByPriority(priority: LoadableResource['priority']): Promise<void> {
    const resourcesToLoad = Array.from(this.loadQueue.values())
      .filter(resource => 
        resource.priority === priority && 
        !resource.loaded && 
        !resource.loading
      );

    const loadPromises = resourcesToLoad.map(resource => 
      this.loadResource(resource.id).catch(error => {
        console.warn(`Failed to preload resource ${resource.id}:`, error);
      })
    );

    await Promise.all(loadPromises);
  }

  /**
   * Get loading statistics
   */
  getLoadingStats(): {
    total: number;
    loaded: number;
    loading: number;
    failed: number;
    loadingProgress: number;
  } {
    const total = this.loadQueue.size;
    const loaded = this.loadedResources.size;
    const loading = this.loadingResources.size;
    const failed = Array.from(this.loadQueue.values()).filter(r => r.error).length;
    const loadingProgress = total > 0 ? (loaded / total) * 100 : 0;

    return {
      total,
      loaded,
      loading,
      failed,
      loadingProgress
    };
  }

  /**
   * Clear all resources and reset service
   */
  reset(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.loadQueue.clear();
    this.loadedResources.clear();
    this.loadingResources.clear();
    this.retryQueue.clear();
    
    this.initializeObserver();
  }

  /**
   * Unregister a specific resource
   */
  unregisterResource(id: string): void {
    const resource = this.loadQueue.get(id);
    
    if (resource && resource.element && this.observer) {
      this.observer.unobserve(resource.element);
    }
    
    this.loadQueue.delete(id);
    this.loadedResources.delete(id);
    this.loadingResources.delete(id);
    this.retryQueue.delete(id);
  }
}

// Export singleton instance
export const lazyLoadingService = LazyLoadingService.getInstance();

// Utility functions for common lazy loading tasks
export const lazyLoadImage = (
  id: string,
  url: string,
  element?: HTMLElement,
  options?: LazyLoadOptions
) => lazyLoadingService.registerResource(id, url, 'image', element, options);

export const lazyLoadTemplate = (
  id: string,
  url: string,
  options?: LazyLoadOptions
) => lazyLoadingService.registerResource(id, url, 'template', undefined, options);

export const preloadCriticalAssets = () => 
  lazyLoadingService.preloadByPriority('critical');

export const preloadHighPriorityAssets = () => 
  lazyLoadingService.preloadByPriority('high');
