/**
 * React hook for browser compatibility detection and management
 */

import { useState, useEffect } from 'react';
import { 
  browserCompatibilityService, 
  type BrowserInfo 
} from '@/lib/browserCompatibility';

export const useBrowserCompatibility = () => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [appliedFixes, setAppliedFixes] = useState<string[]>([]);
  const [compatibilityTests, setCompatibilityTests] = useState<Record<string, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize browser compatibility service
    const initializeCompatibility = async () => {
      try {
        // Apply optimizations
        browserCompatibilityService.applyOptimizations();
        
        // Get browser information
        const info = browserCompatibilityService.getBrowserInfo();
        setBrowserInfo(info);
        
        // Get applied fixes
        const fixes = browserCompatibilityService.getAppliedFixes();
        setAppliedFixes(fixes);
        
        // Run compatibility tests
        const tests = browserCompatibilityService.runCompatibilityTests();
        setCompatibilityTests(tests);
        
        setIsInitialized(true);
        
        console.log('Browser Compatibility initialized:', {
          browser: `${info.name} ${info.version}`,
          platform: info.platform,
          appliedFixes: fixes.length,
          passedTests: Object.values(tests).filter(Boolean).length
        });
        
      } catch (error) {
        console.error('Failed to initialize browser compatibility:', error);
        setIsInitialized(true); // Still mark as initialized to prevent infinite loading
      }
    };

    initializeCompatibility();
  }, []);

  return {
    browserInfo,
    appliedFixes,
    compatibilityTests,
    isInitialized,
    // Utility functions
    getOptimalImageFormat: () => browserCompatibilityService.getOptimalImageFormat(),
    getBrowserClasses: () => browserCompatibilityService.getBrowserClasses(),
    // Browser checks
    isMobile: browserInfo?.isMobile ?? false,
    isTablet: browserInfo?.isTablet ?? false,
    isDesktop: browserInfo?.isDesktop ?? false,
    isSafari: browserInfo?.name === 'Safari',
    isFirefox: browserInfo?.name === 'Firefox',
    isChrome: browserInfo?.name === 'Chrome',
    isEdge: browserInfo?.name === 'Edge',
    // Feature checks
    supportsWebP: browserInfo?.features.webp ?? false,
    supportsAVIF: browserInfo?.features.avif ?? false,
    supportsWebGL: browserInfo?.features.webgl ?? false,
    supportsIndexedDB: browserInfo?.features.indexeddb ?? false,
    supportsServiceWorker: browserInfo?.features.serviceworker ?? false,
    supportsMediaRecorder: browserInfo?.features.mediarecorder ?? false,
    supportsIntersectionObserver: browserInfo?.features.intersectionobserver ?? false
  };
};

/**
 * Hook for conditional rendering based on browser capabilities
 */
export const useFeatureSupport = (feature: keyof BrowserInfo['features']) => {
  const { browserInfo, isInitialized } = useBrowserCompatibility();
  
  return {
    isSupported: browserInfo?.features[feature] ?? false,
    isLoading: !isInitialized
  };
};

/**
 * Hook for browser-specific styling
 */
export const useBrowserStyles = () => {
  const { browserInfo, isInitialized } = useBrowserCompatibility();
  
  const getStyles = () => {
    if (!browserInfo) return {};
    
    const styles: Record<string, any> = {};
    
    // Safari-specific styles
    if (browserInfo.name === 'Safari') {
      styles['--webkit-appearance'] = 'none';
      styles['--webkit-tap-highlight-color'] = 'transparent';
      
      if (browserInfo.isMobile) {
        styles['--touch-action'] = 'manipulation';
        styles['--webkit-overflow-scrolling'] = 'touch';
      }
    }
    
    // Firefox-specific styles
    if (browserInfo.name === 'Firefox') {
      styles['scrollbar-width'] = 'thin';
      styles['scrollbar-color'] = '#D8AE48 #1a1a1a';
    }
    
    // Chrome/Edge-specific styles
    if (browserInfo.name === 'Chrome' || browserInfo.name === 'Edge') {
      styles['--webkit-scrollbar-width'] = '8px';
      styles['--webkit-scrollbar-track-background'] = '#1a1a1a';
      styles['--webkit-scrollbar-thumb-background'] = '#D8AE48';
    }
    
    return styles;
  };
  
  return {
    styles: getStyles(),
    classes: browserInfo ? browserCompatibilityService.getBrowserClasses() : [],
    isLoading: !isInitialized
  };
};

/**
 * Hook for responsive design based on device type
 */
export const useDeviceType = () => {
  const { browserInfo, isInitialized } = useBrowserCompatibility();
  
  return {
    deviceType: browserInfo?.isMobile ? 'mobile' : browserInfo?.isTablet ? 'tablet' : 'desktop',
    isMobile: browserInfo?.isMobile ?? false,
    isTablet: browserInfo?.isTablet ?? false,
    isDesktop: browserInfo?.isDesktop ?? false,
    isLoading: !isInitialized
  };
};

/**
 * Hook for image format optimization
 */
export const useOptimalImageFormat = () => {
  const { browserInfo, isInitialized } = useBrowserCompatibility();
  
  const getOptimalFormat = (fallback: 'jpeg' | 'png' = 'jpeg') => {
    if (!browserInfo) return fallback;
    return browserCompatibilityService.getOptimalImageFormat();
  };
  
  const getImageSrc = (basePath: string, extension?: string) => {
    if (!browserInfo) return `${basePath}.${extension || 'jpg'}`;
    
    const format = browserCompatibilityService.getOptimalImageFormat();
    return `${basePath}.${format}`;
  };
  
  return {
    optimalFormat: getOptimalFormat(),
    getImageSrc,
    supportsWebP: browserInfo?.features.webp ?? false,
    supportsAVIF: browserInfo?.features.avif ?? false,
    isLoading: !isInitialized
  };
};
