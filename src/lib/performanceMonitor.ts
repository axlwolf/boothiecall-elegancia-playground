/**
 * Production Performance Monitoring Service
 * Tracks real user metrics and performance data
 */

interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Load Performance
  ttfb?: number; // Time to First Byte
  fcp?: number;  // First Contentful Paint
  loadTime?: number;
  
  // Custom Metrics
  fontLoadTime?: number;
  chunkLoadTime?: number;
  routeChangeTime?: number;
  
  // User Context
  userAgent?: string;
  connection?: string;
  deviceMemory?: number;
  timestamp: number;
  
  // Allow additional custom metrics
  [key: string]: unknown;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = { timestamp: Date.now() };
  private observer?: PerformanceObserver;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    if (this.isProduction && typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring(): void {
    // Collect basic device/connection info
    this.collectDeviceInfo();
    
    // Monitor Core Web Vitals
    this.observeWebVitals();
    
    // Monitor navigation timing
    this.observeNavigationTiming();
    
    // Monitor resource loading
    this.observeResourceTiming();
    
    // Monitor font loading
    this.observeFontLoading();
    
    // Send metrics periodically
    this.scheduleMetricsSending();
  }

  private collectDeviceInfo(): void {
    if (typeof navigator !== 'undefined') {
      this.metrics.userAgent = navigator.userAgent;
      
      // Network information (if available)
      const connection = (navigator as { connection?: { effectiveType: string } }).connection;
      if (connection) {
        this.metrics.connection = connection.effectiveType;
      }
      
      // Device memory (if available)
      if ('deviceMemory' in navigator) {
        this.metrics.deviceMemory = (navigator as { deviceMemory: number }).deviceMemory;
      }
    }
  }

  private observeWebVitals(): void {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        this.metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: PerformanceEntry & { processingStart: number; startTime: number }) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        const entries = entryList.getEntries();
        entries.forEach((entry: PerformanceEntry & { hadRecentInput?: boolean; value: number }) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private observeNavigationTiming(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0];
        
        this.metrics.ttfb = entry.responseStart - entry.fetchStart;
        this.metrics.loadTime = entry.loadEventEnd - entry.fetchStart;
        
        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
        }
      }
    }
  }

  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        entries.forEach((entry: PerformanceResourceTiming) => {
          // Track chunk loading times
          if (entry.name.includes('.js') && entry.name.includes('assets/')) {
            const loadTime = entry.responseEnd - entry.startTime;
            if (!this.metrics.chunkLoadTime || loadTime > this.metrics.chunkLoadTime) {
              this.metrics.chunkLoadTime = loadTime;
            }
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  private observeFontLoading(): void {
    if ('fonts' in document) {
      const fontLoadStart = performance.now();
      
      document.fonts.ready.then(() => {
        this.metrics.fontLoadTime = performance.now() - fontLoadStart;
      }).catch(() => {
        // Font loading failed, but don't crash
        this.metrics.fontLoadTime = -1;
      });
    }
  }

  private scheduleMetricsSending(): void {
    // Send metrics after page load is complete
    window.addEventListener('load', () => {
      setTimeout(() => this.sendMetrics(), 2000);
    });

    // Send metrics before page unload
    window.addEventListener('beforeunload', () => {
      this.sendMetrics(true);
    });

    // Send metrics periodically for long sessions
    setInterval(() => this.sendMetrics(), 30000); // Every 30 seconds
  }

  private sendMetrics(isBeacon: boolean = false): void {
    if (!this.isProduction) return;

    const metricsData = {
      ...this.metrics,
      url: window.location.href,
      timestamp: Date.now(),
    };

    // In a real app, you would send this to your analytics service
    // For now, we'll just log to console in production
    console.log('📊 Performance Metrics:', metricsData);

    // Example of sending to analytics service:
    // if (isBeacon && 'sendBeacon' in navigator) {
    //   navigator.sendBeacon('/api/metrics', JSON.stringify(metricsData));
    // } else {
    //   fetch('/api/metrics', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(metricsData),
    //   }).catch(() => {
    //     // Ignore errors in metrics sending
    //   });
    // }
  }

  // Public method to track custom metrics
  public trackCustomMetric(name: string, value: number): void {
    this.metrics[name] = value;
  }

  // Public method to track route changes
  public trackRouteChange(route: string): void {
    const routeChangeStart = performance.now();
    
    // Track route change completion
    requestAnimationFrame(() => {
      this.metrics.routeChangeTime = performance.now() - routeChangeStart;
      this.trackCustomMetric('lastRoute', Date.now());
    });
  }

  // Get current metrics snapshot
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for manual usage
export default PerformanceMonitor;
