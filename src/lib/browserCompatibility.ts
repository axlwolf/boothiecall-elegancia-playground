/**
 * Cross-browser compatibility service
 * Handles browser-specific optimizations and fallbacks
 */

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  features: {
    webp: boolean;
    avif: boolean;
    webgl: boolean;
    webgl2: boolean;
    indexeddb: boolean;
    serviceworker: boolean;
    intersectionobserver: boolean;
    resizeobserver: boolean;
    mediarecorder: boolean;
    webrtc: boolean;
    offscreencanvas: boolean;
    webassembly: boolean;
  };
}

export interface CompatibilityFix {
  browser: string;
  version?: string;
  fix: () => void;
  description: string;
}

export class BrowserCompatibilityService {
  private static instance: BrowserCompatibilityService;
  private browserInfo: BrowserInfo;
  private fixes: CompatibilityFix[] = [];
  private appliedFixes: Set<string> = new Set();

  static getInstance(): BrowserCompatibilityService {
    if (!BrowserCompatibilityService.instance) {
      BrowserCompatibilityService.instance = new BrowserCompatibilityService();
    }
    return BrowserCompatibilityService.instance;
  }

  constructor() {
    this.browserInfo = this.detectBrowser();
    this.registerCompatibilityFixes();
    this.applyCompatibilityFixes();
  }

  /**
   * Detect browser information and capabilities
   */
  private detectBrowser(): BrowserInfo {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Browser detection
    let name = 'Unknown';
    let version = '0';
    let engine = 'Unknown';

    if (userAgent.includes('Firefox')) {
      name = 'Firefox';
      engine = 'Gecko';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : '0';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari';
      engine = 'WebKit';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : '0';
    } else if (userAgent.includes('Chrome')) {
      name = 'Chrome';
      engine = 'Blink';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : '0';
    } else if (userAgent.includes('Edge')) {
      name = 'Edge';
      engine = 'Blink';
      const match = userAgent.match(/Edge\/(\d+)/);
      version = match ? match[1] : '0';
    }

    // Device type detection
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*Tablet)|Windows NT.*Touch/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    // Feature detection
    const features = {
      webp: this.supportsWebP(),
      avif: this.supportsAVIF(),
      webgl: this.supportsWebGL(),
      webgl2: this.supportsWebGL2(),
      indexeddb: 'indexedDB' in window,
      serviceworker: 'serviceWorker' in navigator,
      intersectionobserver: 'IntersectionObserver' in window,
      resizeobserver: 'ResizeObserver' in window,
      mediarecorder: 'MediaRecorder' in window,
      webrtc: 'RTCPeerConnection' in window,
      offscreencanvas: 'OffscreenCanvas' in window,
      webassembly: 'WebAssembly' in window
    };

    return {
      name,
      version,
      engine,
      platform,
      isMobile,
      isTablet,
      isDesktop,
      features
    };
  }

  /**
   * Check WebP support
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Check AVIF support
   */
  private supportsAVIF(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  /**
   * Check WebGL support
   */
  private supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  /**
   * Check WebGL2 support
   */
  private supportsWebGL2(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch (e) {
      return false;
    }
  }

  /**
   * Register compatibility fixes for different browsers
   */
  private registerCompatibilityFixes(): void {
    // Safari mobile optimizations
    this.fixes.push({
      browser: 'Safari',
      fix: () => this.applySafariMobileFixes(),
      description: 'Safari mobile viewport and touch optimizations'
    });

    // Firefox compatibility fixes
    this.fixes.push({
      browser: 'Firefox',
      fix: () => this.applyFirefoxFixes(),
      description: 'Firefox-specific CSS and API fixes'
    });

    // Edge compatibility fixes
    this.fixes.push({
      browser: 'Edge',
      fix: () => this.applyEdgeFixes(),
      description: 'Edge browser compatibility fixes'
    });

    // WebP fallback for unsupported browsers
    if (!this.browserInfo.features.webp) {
      this.fixes.push({
        browser: 'All',
        fix: () => this.setupWebPFallback(),
        description: 'WebP format fallback to JPEG/PNG'
      });
    }

    // IndexedDB fallback
    if (!this.browserInfo.features.indexeddb) {
      this.fixes.push({
        browser: 'All',
        fix: () => this.setupIndexedDBFallback(),
        description: 'IndexedDB fallback to localStorage'
      });
    }

    // IntersectionObserver polyfill
    if (!this.browserInfo.features.intersectionobserver) {
      this.fixes.push({
        browser: 'All',
        fix: () => this.setupIntersectionObserverPolyfill(),
        description: 'IntersectionObserver polyfill for lazy loading'
      });
    }
  }

  /**
   * Apply all relevant compatibility fixes
   */
  private applyCompatibilityFixes(): void {
    this.fixes.forEach(fix => {
      if (fix.browser === 'All' || fix.browser === this.browserInfo.name) {
        try {
          fix.fix();
          this.appliedFixes.add(fix.description);
          console.log(`Applied compatibility fix: ${fix.description}`);
        } catch (error) {
          console.warn(`Failed to apply compatibility fix: ${fix.description}`, error);
        }
      }
    });
  }

  /**
   * Safari mobile specific fixes
   */
  private applySafariMobileFixes(): void {
    // Fix viewport height issues on iOS Safari
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setViewportHeight, 100);
    });

    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }
      });

      input.addEventListener('blur', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1');
        }
      });
    });

    // Fix touch events
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });

    // Add Safari-specific CSS classes
    document.documentElement.classList.add('safari-mobile');
  }

  /**
   * Firefox specific fixes
   */
  private applyFirefoxFixes(): void {
    // Fix CSS Grid issues in older Firefox versions
    if (parseInt(this.browserInfo.version) < 60) {
      document.documentElement.classList.add('firefox-legacy');
    }

    // Fix scrollbar styling
    const style = document.createElement('style');
    style.textContent = `
      /* Firefox scrollbar styling */
      * {
        scrollbar-width: thin;
        scrollbar-color: #D8AE48 #1a1a1a;
      }
    `;
    document.head.appendChild(style);

    document.documentElement.classList.add('firefox');
  }

  /**
   * Edge specific fixes
   */
  private applyEdgeFixes(): void {
    // Fix CSS custom properties in older Edge versions
    if (parseInt(this.browserInfo.version) < 79) {
      document.documentElement.classList.add('edge-legacy');
    }

    document.documentElement.classList.add('edge');
  }

  /**
   * Setup WebP fallback
   */
  private setupWebPFallback(): void {
    // Replace WebP images with JPEG/PNG alternatives
    const images = document.querySelectorAll('img[src*=".webp"], img[data-src*=".webp"]');
    
    images.forEach(img => {
      const webpSrc = img.getAttribute('src') || img.getAttribute('data-src');
      if (webpSrc) {
        const fallbackSrc = webpSrc.replace('.webp', '.jpg');
        if (img.hasAttribute('src')) {
          img.setAttribute('src', fallbackSrc);
        } else {
          img.setAttribute('data-src', fallbackSrc);
        }
      }
    });

    // Set up observer for dynamically added images
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const webpImages = element.querySelectorAll('img[src*=".webp"], img[data-src*=".webp"]');
            
            webpImages.forEach(img => {
              const webpSrc = img.getAttribute('src') || img.getAttribute('data-src');
              if (webpSrc) {
                const fallbackSrc = webpSrc.replace('.webp', '.jpg');
                if (img.hasAttribute('src')) {
                  img.setAttribute('src', fallbackSrc);
                } else {
                  img.setAttribute('data-src', fallbackSrc);
                }
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Setup IndexedDB fallback
   */
  private setupIndexedDBFallback(): void {
    // This would be handled by the HybridStorageService
    console.warn('IndexedDB not supported, falling back to localStorage');
  }

  /**
   * Setup IntersectionObserver polyfill
   */
  private setupIntersectionObserverPolyfill(): void {
    // Simple polyfill for IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      (window as any).IntersectionObserver = class {
        constructor(callback: any, options: any = {}) {
          this.callback = callback;
          this.options = options;
          this.elements = new Set();
        }

        observe(element: Element) {
          this.elements.add(element);
          // Simple fallback: assume element is always intersecting
          setTimeout(() => {
            this.callback([{
              target: element,
              isIntersecting: true,
              intersectionRatio: 1
            }]);
          }, 100);
        }

        unobserve(element: Element) {
          this.elements.delete(element);
        }

        disconnect() {
          this.elements.clear();
        }
      };
    }
  }

  /**
   * Get optimal image format based on browser support
   */
  getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
    if (this.browserInfo.features.avif) return 'avif';
    if (this.browserInfo.features.webp) return 'webp';
    return 'jpeg';
  }

  /**
   * Get browser-specific CSS classes
   */
  getBrowserClasses(): string[] {
    const classes = [];
    
    classes.push(`browser-${this.browserInfo.name.toLowerCase()}`);
    classes.push(`engine-${this.browserInfo.engine.toLowerCase()}`);
    
    if (this.browserInfo.isMobile) classes.push('mobile');
    if (this.browserInfo.isTablet) classes.push('tablet');
    if (this.browserInfo.isDesktop) classes.push('desktop');
    
    // Feature-based classes
    Object.entries(this.browserInfo.features).forEach(([feature, supported]) => {
      classes.push(supported ? `supports-${feature}` : `no-${feature}`);
    });
    
    return classes;
  }

  /**
   * Apply browser-specific optimizations
   */
  applyOptimizations(): void {
    // Add browser classes to document
    const classes = this.getBrowserClasses();
    document.documentElement.classList.add(...classes);

    // Browser-specific performance optimizations
    if (this.browserInfo.name === 'Safari' && this.browserInfo.isMobile) {
      // Reduce animations on Safari mobile for better performance
      document.documentElement.style.setProperty('--animation-duration', '0.2s');
    }

    if (this.browserInfo.name === 'Firefox') {
      // Optimize for Firefox's rendering engine
      document.documentElement.style.setProperty('--scroll-behavior', 'auto');
    }

    if (this.browserInfo.name === 'Edge') {
      // Edge-specific optimizations
      document.documentElement.style.setProperty('--transform-style', 'flat');
    }
  }

  /**
   * Get browser information
   */
  getBrowserInfo(): BrowserInfo {
    return { ...this.browserInfo };
  }

  /**
   * Get applied compatibility fixes
   */
  getAppliedFixes(): string[] {
    return Array.from(this.appliedFixes);
  }

  /**
   * Test browser capabilities
   */
  runCompatibilityTests(): Record<string, boolean> {
    const tests = {
      'Canvas 2D': this.testCanvas2D(),
      'WebGL': this.browserInfo.features.webgl,
      'WebGL2': this.browserInfo.features.webgl2,
      'WebP': this.browserInfo.features.webp,
      'AVIF': this.browserInfo.features.avif,
      'IndexedDB': this.browserInfo.features.indexeddb,
      'Service Worker': this.browserInfo.features.serviceworker,
      'Media Recorder': this.browserInfo.features.mediarecorder,
      'WebRTC': this.browserInfo.features.webrtc,
      'Intersection Observer': this.browserInfo.features.intersectionobserver,
      'Resize Observer': this.browserInfo.features.resizeobserver,
      'Offscreen Canvas': this.browserInfo.features.offscreencanvas,
      'WebAssembly': this.browserInfo.features.webassembly
    };

    return tests;
  }

  /**
   * Test Canvas 2D support
   */
  private testCanvas2D(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('2d');
    } catch (e) {
      return false;
    }
  }
}

// Export singleton instance
export const browserCompatibilityService = BrowserCompatibilityService.getInstance();

// Utility functions
export const getBrowserInfo = () => browserCompatibilityService.getBrowserInfo();
export const getOptimalImageFormat = () => browserCompatibilityService.getOptimalImageFormat();
export const runCompatibilityTests = () => browserCompatibilityService.runCompatibilityTests();
