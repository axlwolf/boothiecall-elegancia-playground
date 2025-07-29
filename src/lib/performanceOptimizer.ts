/**
 * Performance optimization service for bundle size and memory management
 * Provides intelligent resource management, code splitting, and memory optimization
 */

export interface PerformanceMetrics {
  bundleSize: number;
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
  resourceCount: number;
  cacheHitRate: number;
}

export interface OptimizationConfig {
  enableCodeSplitting: boolean;
  enableTreeShaking: boolean;
  enableMinification: boolean;
  enableGzipCompression: boolean;
  maxBundleSize: number; // in KB
  maxMemoryUsage: number; // in MB
  enableMemoryProfiling: boolean;
  enablePerformanceMonitoring: boolean;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: PerformanceMetrics = {
    bundleSize: 0,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0,
    resourceCount: 0,
    cacheHitRate: 0
  };
  
  private config: OptimizationConfig = {
    enableCodeSplitting: true,
    enableTreeShaking: true,
    enableMinification: true,
    enableGzipCompression: true,
    maxBundleSize: 1024, // 1MB
    maxMemoryUsage: 500, // 500MB (increased to prevent frequent warnings)
    enableMemoryProfiling: true,
    enablePerformanceMonitoring: true
  };

  private memoryLeakDetector: Map<string, WeakRef<any>> = new Map();
  private performanceObserver: PerformanceObserver | null = null;
  private resourceCache: Map<string, any> = new Map();
  private componentRegistry: Map<string, () => Promise<any>> = new Map();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  constructor() {
    this.initializePerformanceMonitoring();
    this.setupMemoryProfiling();
    this.registerDynamicImports();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring || typeof window === 'undefined') {
      return;
    }

    // Setup Performance Observer
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.processPerformanceEntries(entries);
      });

      this.performanceObserver.observe({ 
        entryTypes: ['navigation', 'resource', 'measure', 'paint'] 
      });
    }

    // Monitor bundle size
    this.monitorBundleSize();
    
    // Setup memory monitoring
    this.startMemoryMonitoring();
  }

  /**
   * Setup memory profiling and leak detection
   */
  private setupMemoryProfiling(): void {
    if (!this.config.enableMemoryProfiling) return;

    // Setup periodic memory cleanup
    setInterval(() => {
      this.performMemoryCleanup();
      this.detectMemoryLeaks();
    }, 30000); // Every 30 seconds

    // Setup garbage collection monitoring
    if ('gc' in performance) {
      this.monitorGarbageCollection();
    }
  }

  /**
   * Register dynamic imports for code splitting
   */
  private registerDynamicImports(): void {
    if (!this.config.enableCodeSplitting) return;

    // Register lazy-loaded components
    this.componentRegistry.set('PhotoEditor', () => 
      import('../components/PhotoEditor').then(m => m.default)
    );
    
    this.componentRegistry.set('AdminDashboard', () => 
      import('../admin/pages/Dashboard').then(m => m.default)
    );
    
    this.componentRegistry.set('FilterEngine', () => 
      import('./filterEngine').then(m => m.FilterEngine)
    );
    
    this.componentRegistry.set('TemplateService', () => 
      import('./templateService').then(m => m.TemplateService)
    );
  }

  /**
   * Dynamically load component with performance tracking
   */
  async loadComponent<T>(componentName: string): Promise<T> {
    const startTime = performance.now();
    
    try {
      const loader = this.componentRegistry.get(componentName);
      if (!loader) {
        throw new Error(`Component ${componentName} not registered`);
      }

      // Check cache first
      if (this.resourceCache.has(componentName)) {
        return this.resourceCache.get(componentName);
      }

      const component = await loader();
      
      // Cache the loaded component
      this.resourceCache.set(componentName, component);
      
      // Track loading performance
      const loadTime = performance.now() - startTime;
      this.trackComponentLoad(componentName, loadTime);
      
      return component;
      
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      throw error;
    }
  }

  /**
   * Process performance entries from PerformanceObserver
   */
  private processPerformanceEntries(entries: PerformanceEntry[]): void {
    entries.forEach(entry => {
      switch (entry.entryType) {
        case 'navigation':
          this.processNavigationEntry(entry as PerformanceNavigationTiming);
          break;
        case 'resource':
          this.processResourceEntry(entry as PerformanceResourceTiming);
          break;
        case 'paint':
          this.processPaintEntry(entry as PerformancePaintTiming);
          break;
        case 'measure':
          this.processMeasureEntry(entry as PerformanceMeasure);
          break;
      }
    });
  }

  /**
   * Process navigation timing entry
   */
  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    this.metrics.loadTime = entry.loadEventEnd - entry.navigationStart;
    this.metrics.renderTime = entry.domContentLoadedEventEnd - entry.navigationStart;
  }

  /**
   * Process resource timing entry
   */
  private processResourceEntry(entry: PerformanceResourceTiming): void {
    this.metrics.resourceCount++;
    
    // Track bundle size from main resources
    if (entry.name.includes('main') || entry.name.includes('chunk')) {
      this.metrics.bundleSize += entry.transferSize || 0;
    }
  }

  /**
   * Process paint timing entry
   */
  private processPaintEntry(entry: PerformancePaintTiming): void {
    if (entry.name === 'first-contentful-paint') {
      // Track first contentful paint for render performance
      console.log(`First Contentful Paint: ${entry.startTime}ms`);
    }
  }

  /**
   * Process measure entry
   */
  private processMeasureEntry(entry: PerformanceMeasure): void {
    // Custom performance measures
    console.log(`Custom measure ${entry.name}: ${entry.duration}ms`);
  }

  /**
   * Monitor bundle size
   */
  private monitorBundleSize(): void {
    // Estimate bundle size from loaded scripts
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (src && !src.includes('node_modules')) {
        // This is an approximation - real bundle size would need build-time analysis
        totalSize += 100; // Estimated KB per script
      }
    });

    this.metrics.bundleSize = totalSize;

    // Warn if bundle size exceeds threshold
    if (totalSize > this.config.maxBundleSize) {
      console.warn(`Bundle size (${totalSize}KB) exceeds threshold (${this.config.maxBundleSize}KB)`);
    }
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    if (!('memory' in performance)) return;

    const updateMemoryMetrics = () => {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB

      // Warn if memory usage is high
      if (this.metrics.memoryUsage > this.config.maxMemoryUsage) {
        console.warn(`Memory usage (${this.metrics.memoryUsage.toFixed(2)}MB) exceeds threshold (${this.config.maxMemoryUsage}MB)`);
        this.performMemoryCleanup();
      }
    };

    // Update memory metrics every 30 seconds (reduced frequency to prevent crashes)
    setInterval(updateMemoryMetrics, 30000);
    updateMemoryMetrics(); // Initial update
  }

  /**
   * Perform memory cleanup
   */
  private performMemoryCleanup(): void {
    // Clear expired cache entries
    this.cleanupResourceCache();
    
    // Clean up weak references
    this.cleanupWeakReferences();
    
    // Suggest garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }

  /**
   * Clean up resource cache
   */
  private cleanupResourceCache(): void {
    const maxCacheSize = 50;
    
    if (this.resourceCache.size > maxCacheSize) {
      // Remove oldest entries (simple LRU-like behavior)
      const entries = Array.from(this.resourceCache.entries());
      const toRemove = entries.slice(0, entries.length - maxCacheSize);
      
      toRemove.forEach(([key]) => {
        this.resourceCache.delete(key);
      });
    }
  }

  /**
   * Clean up weak references
   */
  private cleanupWeakReferences(): void {
    for (const [key, weakRef] of this.memoryLeakDetector.entries()) {
      if (!weakRef.deref()) {
        this.memoryLeakDetector.delete(key);
      }
    }
  }

  /**
   * Detect potential memory leaks
   */
  private detectMemoryLeaks(): void {
    const suspiciousObjects = [];
    
    for (const [key, weakRef] of this.memoryLeakDetector.entries()) {
      const obj = weakRef.deref();
      if (obj && this.isLikelyMemoryLeak(obj)) {
        suspiciousObjects.push(key);
      }
    }

    if (suspiciousObjects.length > 0) {
      console.warn('Potential memory leaks detected:', suspiciousObjects);
    }
  }

  /**
   * Check if object is likely a memory leak
   */
  private isLikelyMemoryLeak(obj: any): boolean {
    // Simple heuristics for memory leak detection
    if (obj && typeof obj === 'object') {
      // Check for circular references
      try {
        JSON.stringify(obj);
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('circular')) {
          return true;
        }
      }
      
      // Check for large objects
      const keys = Object.keys(obj);
      if (keys.length > 1000) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Monitor garbage collection
   */
  private monitorGarbageCollection(): void {
    // This would require specific browser APIs or Node.js environment
    // Implementation would depend on available GC monitoring tools
  }

  /**
   * Track component loading performance
   */
  private trackComponentLoad(componentName: string, loadTime: number): void {
    performance.mark(`component-${componentName}-loaded`);
    performance.measure(`component-${componentName}-load-time`, `component-${componentName}-start`, `component-${componentName}-loaded`);
    
    console.log(`Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
  }

  /**
   * Register object for memory leak detection
   */
  registerForMemoryTracking(key: string, obj: any): void {
    if (this.config.enableMemoryProfiling) {
      this.memoryLeakDetector.set(key, new WeakRef(obj));
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): {
    metrics: PerformanceMetrics;
    recommendations: string[];
    warnings: string[];
  } {
    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Analyze metrics and generate recommendations
    if (this.metrics.bundleSize > this.config.maxBundleSize) {
      warnings.push(`Bundle size (${this.metrics.bundleSize}KB) exceeds recommended size`);
      recommendations.push('Consider code splitting and lazy loading');
    }

    if (this.metrics.memoryUsage > this.config.maxMemoryUsage) {
      warnings.push(`Memory usage (${this.metrics.memoryUsage.toFixed(2)}MB) is high`);
      recommendations.push('Review memory usage and implement cleanup strategies');
    }

    if (this.metrics.loadTime > 3000) {
      warnings.push(`Load time (${this.metrics.loadTime}ms) is slow`);
      recommendations.push('Optimize resource loading and implement preloading');
    }

    if (this.metrics.cacheHitRate < 0.8) {
      recommendations.push('Improve caching strategy to increase cache hit rate');
    }

    return {
      metrics: this.metrics,
      recommendations,
      warnings
    };
  }

  /**
   * Optimize current page performance
   */
  async optimizeCurrentPage(): Promise<void> {
    // Preload critical resources
    await this.preloadCriticalResources();
    
    // Cleanup unused resources
    this.performMemoryCleanup();
    
    // Optimize images
    this.optimizeImages();
    
    // Defer non-critical scripts
    this.deferNonCriticalScripts();
  }

  /**
   * Preload critical resources
   */
  private async preloadCriticalResources(): Promise<void> {
    try {
      // Get base path from document base or default to /playground/
      const basePath = document.querySelector('base')?.getAttribute('href') || '/playground/';
      
      const criticalResources = [
        basePath + 'assets/templates/1shot-template.png',
        basePath + 'assets/templates/3shot-template.png',
        basePath + 'assets/filters/noir.css',
        basePath + 'assets/fonts/cinzel.woff2'
      ];

      // Check if resources exist before preloading
      const existingResources = await this.filterExistingResources(criticalResources);
      
      if (existingResources.length === 0) {
        console.log('No critical resources found to preload');
        return;
      }

      const preloadPromises = existingResources.map(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = this.getResourceType(resource);
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        
        return new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            resolve(); // Timeout after 5 seconds
          }, 5000);
          
          link.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          link.onerror = () => {
            clearTimeout(timeout);
            console.warn(`Failed to preload resource: ${resource}`);
            resolve(); // Don't fail the whole process
          };
        });
      });

      await Promise.all(preloadPromises);
    } catch (error) {
      console.warn('Error in preloadCriticalResources:', error);
    }
  }

  /**
   * Filter resources that actually exist to avoid 404 errors
   */
  private async filterExistingResources(resources: string[]): Promise<string[]> {
    const existingResources: string[] = [];
    
    for (const resource of resources) {
      try {
        const response = await fetch(resource, { method: 'HEAD' });
        if (response.ok) {
          existingResources.push(resource);
        }
      } catch (error) {
        // Resource doesn't exist or is not accessible
        console.warn(`Resource not accessible: ${resource}`);
      }
    }
    
    return existingResources;
  }

  /**
   * Get resource type for preloading
   */
  private getResourceType(url: string): string {
    if (url.includes('.css')) return 'style';
    if (url.includes('.js')) return 'script';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.webp')) return 'image';
    return 'fetch';
  }

  /**
   * Optimize images on current page
   */
  private optimizeImages(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" if not already present
      if (!img.hasAttribute('loading')) {
        img.loading = 'lazy';
      }
      
      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.decoding = 'async';
      }
    });
  }

  /**
   * Defer non-critical scripts
   */
  private deferNonCriticalScripts(): void {
    const scripts = document.querySelectorAll('script[src]');
    
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      
      // Defer analytics and non-critical scripts
      if (src.includes('analytics') || src.includes('tracking')) {
        (script as HTMLScriptElement).defer = true;
      }
    });
  }

  /**
   * Cleanup and destroy optimizer
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    this.resourceCache.clear();
    this.memoryLeakDetector.clear();
    this.componentRegistry.clear();
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Utility functions
export const trackComponentLoad = (componentName: string) => {
  performance.mark(`component-${componentName}-start`);
  return () => performance.mark(`component-${componentName}-loaded`);
};

export const measureAsync = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  performance.mark(startMark);
  
  try {
    const result = await fn();
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);
    return result;
  } catch (error) {
    performance.mark(endMark);
    performance.measure(`${name}-error`, startMark, endMark);
    throw error;
  }
};
