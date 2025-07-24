/**
 * React hooks for performance optimization and monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { imageCompressionService, type CompressionResult } from '../lib/imageCompression';
import { lazyLoadingService, type LoadableResource } from '../lib/lazyLoadingService';
import { performanceOptimizer, type PerformanceMetrics } from '../lib/performanceOptimizer';

/**
 * Hook for image compression with progress tracking
 */
export const useImageCompression = () => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressionStats, setCompressionStats] = useState<{
    totalSaved: number;
    averageRatio: number;
  }>({ totalSaved: 0, averageRatio: 1 });

  const compressImage = useCallback(async (
    imageUrl: string,
    context: 'thumbnail' | 'preview' | 'final' | 'storage' = 'preview'
  ): Promise<CompressionResult> => {
    setIsCompressing(true);
    
    try {
      const result = await imageCompressionService.compressImage(imageUrl, context);
      
      // Update stats
      const stats = imageCompressionService.getCompressionStats();
      setCompressionStats({
        totalSaved: stats.totalCompressions,
        averageRatio: stats.averageCompressionRatio
      });
      
      return result;
    } finally {
      setIsCompressing(false);
    }
  }, []);

  const compressMultiple = useCallback(async (
    images: Array<{ url: string; context?: 'thumbnail' | 'preview' | 'final' | 'storage' }>
  ): Promise<CompressionResult[]> => {
    setIsCompressing(true);
    setProgress(0);
    
    try {
      const results = await imageCompressionService.compressMultiple(
        images,
        (completed, total) => {
          setProgress((completed / total) * 100);
        }
      );
      
      return results;
    } finally {
      setIsCompressing(false);
      setProgress(0);
    }
  }, []);

  return {
    compressImage,
    compressMultiple,
    isCompressing,
    progress,
    compressionStats
  };
};

/**
 * Hook for lazy loading with intersection observer
 */
export const useLazyLoading = () => {
  const [loadingStats, setLoadingStats] = useState({
    total: 0,
    loaded: 0,
    loading: 0,
    failed: 0,
    loadingProgress: 0
  });

  const registerResource = useCallback((
    id: string,
    url: string,
    type: 'image' | 'template' | 'asset' | 'font',
    element?: HTMLElement,
    options?: any
  ): LoadableResource => {
    const resource = lazyLoadingService.registerResource(id, url, type, element, options);
    
    // Update stats after registration
    setTimeout(() => {
      setLoadingStats(lazyLoadingService.getLoadingStats());
    }, 0);
    
    return resource;
  }, []);

  const loadResource = useCallback(async (id: string): Promise<LoadableResource> => {
    const resource = await lazyLoadingService.loadResource(id);
    setLoadingStats(lazyLoadingService.getLoadingStats());
    return resource;
  }, []);

  const preloadByPriority = useCallback(async (
    priority: 'low' | 'normal' | 'high' | 'critical'
  ): Promise<void> => {
    await lazyLoadingService.preloadByPriority(priority);
    setLoadingStats(lazyLoadingService.getLoadingStats());
  }, []);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStats(lazyLoadingService.getLoadingStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    registerResource,
    loadResource,
    preloadByPriority,
    loadingStats
  };
};

/**
 * Hook for performance monitoring and optimization
 */
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    bundleSize: 0,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0,
    resourceCount: 0,
    cacheHitRate: 0
  });
  
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceOptimizer.getMetrics());
    };

    updateMetrics(); // Initial update
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  const optimizePage = useCallback(async (): Promise<void> => {
    setIsOptimizing(true);
    
    try {
      await performanceOptimizer.optimizeCurrentPage();
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const loadComponent = useCallback(async <T>(componentName: string): Promise<T> => {
    return performanceOptimizer.loadComponent<T>(componentName);
  }, []);

  const generateReport = useCallback(() => {
    return performanceOptimizer.generatePerformanceReport();
  }, []);

  const trackMemoryUsage = useCallback((key: string, obj: any) => {
    performanceOptimizer.registerForMemoryTracking(key, obj);
  }, []);

  return {
    metrics,
    isOptimizing,
    optimizePage,
    loadComponent,
    generateReport,
    trackMemoryUsage
  };
};

/**
 * Hook for lazy loading images with intersection observer
 */
export const useLazyImage = (
  src: string,
  options?: {
    threshold?: number;
    rootMargin?: string;
    placeholder?: string;
  }
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [imageSrc, setImageSrc] = useState(options?.placeholder || '');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current || !src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded && !isLoading) {
            setIsLoading(true);
            
            const img = new Image();
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
              setIsLoading(false);
              observer.unobserve(entry.target);
            };
            
            img.onerror = () => {
              setError(new Error(`Failed to load image: ${src}`));
              setIsLoading(false);
            };
            
            img.src = src;
          }
        });
      },
      {
        threshold: options?.threshold || 0.1,
        rootMargin: options?.rootMargin || '50px'
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, isLoaded, isLoading, options]);

  return {
    imgRef,
    imageSrc,
    isLoaded,
    isLoading,
    error
  };
};

/**
 * Hook for measuring component render performance
 */
export const useRenderPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const [renderTime, setRenderTime] = useState<number>(0);
  const [hasStartMark, setHasStartMark] = useState(false);

  // Mark render start - runs first
  useEffect(() => {
    try {
      performance.mark(`${componentName}-render-start`);
      renderStartTime.current = performance.now();
      setHasStartMark(true);
    } catch (error) {
      console.warn('Failed to create performance mark:', error);
    }
  }, [componentName]);

  // Measure render time - runs after start mark is created
  useEffect(() => {
    if (!hasStartMark) return;
    
    try {
      const endTime = performance.now();
      const duration = endTime - renderStartTime.current;
      setRenderTime(duration);
      
      // Track in performance optimizer
      performance.mark(`${componentName}-render-end`);
      
      // Only measure if start mark exists
      const marks = performance.getEntriesByName(`${componentName}-render-start`, 'mark');
      if (marks.length > 0) {
        performance.measure(
          `${componentName}-render`,
          `${componentName}-render-start`,
          `${componentName}-render-end`
        );
      }
    } catch (error) {
      console.warn('Failed to measure performance:', error);
    }
  }, [componentName, hasStartMark]);

  return { renderTime };
};

/**
 * Hook for debounced performance optimization
 */
export const useDebouncedOptimization = (delay: number = 1000) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const scheduleOptimization = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsOptimizing(true);
      
      try {
        await performanceOptimizer.optimizeCurrentPage();
      } catch (error) {
        console.error('Optimization failed:', error);
      } finally {
        setIsOptimizing(false);
      }
    }, delay);
  }, [delay]);

  const cancelOptimization = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsOptimizing(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    scheduleOptimization,
    cancelOptimization,
    isOptimizing
  };
};

/**
 * Hook for memory usage monitoring
 */
export const useMemoryMonitoring = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    percentage: number;
  }>({ used: 0, total: 0, percentage: 0 });

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize / (1024 * 1024); // MB
        const total = memory.totalJSHeapSize / (1024 * 1024); // MB
        const percentage = total > 0 ? (used / total) * 100 : 0;

        setMemoryInfo({ used, total, percentage });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 2000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

/**
 * Hook for bundle size monitoring
 */
export const useBundleMonitoring = () => {
  const [bundleInfo, setBundleInfo] = useState<{
    size: number;
    gzippedSize: number;
    loadTime: number;
  }>({ size: 0, gzippedSize: 0, loadTime: 0 });

  useEffect(() => {
    // Monitor bundle loading performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'resource' && entry.name.includes('main')) {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          setBundleInfo({
            size: resourceEntry.transferSize || 0,
            gzippedSize: resourceEntry.encodedBodySize || 0,
            loadTime: resourceEntry.duration
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  return bundleInfo;
};
