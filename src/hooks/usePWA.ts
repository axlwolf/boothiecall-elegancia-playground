/**
 * React hooks for PWA functionality
 * Provides easy access to PWA features in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  pwaService, 
  PWACapabilities, 
  PWAUpdateInfo, 
  PWANotificationOptions, 
  PWAShareData 
} from '../lib/pwaService';

export interface PWAState {
  isSupported: boolean;
  capabilities: PWACapabilities;
  isInstalling: boolean;
  updateInfo: PWAUpdateInfo;
  isOnline: boolean;
}

/**
 * Main PWA hook - provides comprehensive PWA state and actions
 */
export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isSupported: pwaService.isSupported(),
    capabilities: pwaService.getCapabilities(),
    isInstalling: false,
    updateInfo: { available: false, waiting: null, installing: null },
    isOnline: navigator.onLine
  });

  // Update capabilities when they change
  const updateCapabilities = useCallback(() => {
    setState(prev => ({
      ...prev,
      capabilities: pwaService.getCapabilities()
    }));
  }, []);

  // Handle update availability
  const handleUpdateAvailable = useCallback((updateInfo: PWAUpdateInfo) => {
    setState(prev => ({
      ...prev,
      updateInfo
    }));
  }, []);

  // Handle online/offline status
  const handleOnlineStatus = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOnline: navigator.onLine
    }));
  }, []);

  useEffect(() => {
    // Subscribe to PWA events
    const unsubscribeUpdate = pwaService.onUpdateAvailable(handleUpdateAvailable);
    const unsubscribeInstall = pwaService.onInstallAvailable(updateCapabilities);

    // Subscribe to online/offline events
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Initial capability check
    updateCapabilities();

    return () => {
      unsubscribeUpdate();
      unsubscribeInstall();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [handleUpdateAvailable, updateCapabilities, handleOnlineStatus]);

  // Install PWA
  const install = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isInstalling: true }));
    
    try {
      const result = await pwaService.promptInstall();
      updateCapabilities();
      return result;
    } finally {
      setState(prev => ({ ...prev, isInstalling: false }));
    }
  }, [updateCapabilities]);

  // Apply update
  const applyUpdate = useCallback(async (): Promise<void> => {
    await pwaService.applyUpdate();
  }, []);

  // Show notification
  const showNotification = useCallback(async (options: PWANotificationOptions): Promise<void> => {
    await pwaService.showNotification(options);
  }, []);

  // Share content
  const share = useCallback(async (data: PWAShareData): Promise<boolean> => {
    return await pwaService.share(data);
  }, []);

  // Cache URLs
  const cacheUrls = useCallback(async (urls: string[]): Promise<void> => {
    await pwaService.cacheUrls(urls);
  }, []);

  return {
    ...state,
    install,
    applyUpdate,
    showNotification,
    share,
    cacheUrls
  };
};

/**
 * Hook for PWA installation functionality
 */
export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const capabilities = pwaService.getCapabilities();
    setCanInstall(capabilities.isInstallable);
    setIsInstalled(capabilities.isInstalled);

    const unsubscribe = pwaService.onInstallAvailable((installable) => {
      setCanInstall(installable);
      if (!installable) {
        setIsInstalled(true);
      }
    });

    return unsubscribe;
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!canInstall) return false;

    setIsInstalling(true);
    try {
      const result = await pwaService.promptInstall();
      if (result) {
        setCanInstall(false);
        setIsInstalled(true);
      }
      return result;
    } finally {
      setIsInstalling(false);
    }
  }, [canInstall]);

  const getInstallInstructions = useCallback((): string[] => {
    if (pwaService.isIOS()) {
      return pwaService.getIOSInstallInstructions();
    }
    return ['Click the install button when prompted'];
  }, []);

  return {
    canInstall,
    isInstalling,
    isInstalled,
    isMobile: pwaService.isMobile(),
    isIOS: pwaService.isIOS(),
    install,
    getInstallInstructions
  };
};

/**
 * Hook for PWA update functionality
 */
export const usePWAUpdate = () => {
  const [updateInfo, setUpdateInfo] = useState<PWAUpdateInfo>({
    available: false,
    waiting: null,
    installing: null
  });
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const unsubscribe = pwaService.onUpdateAvailable(setUpdateInfo);
    return unsubscribe;
  }, []);

  const applyUpdate = useCallback(async (): Promise<void> => {
    if (!updateInfo.available) return;

    setIsApplying(true);
    try {
      await pwaService.applyUpdate();
    } finally {
      setIsApplying(false);
    }
  }, [updateInfo.available]);

  const getVersion = useCallback(async (): Promise<string> => {
    return await pwaService.getVersion();
  }, []);

  return {
    updateAvailable: updateInfo.available,
    isApplying,
    applyUpdate,
    getVersion
  };
};

/**
 * Hook for PWA notifications
 */
export const usePWANotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const capabilities = pwaService.getCapabilities();
    setIsSupported(capabilities.supportsNotifications);
    
    if (capabilities.supportsNotifications) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const result = await pwaService.requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  const showNotification = useCallback(async (options: PWANotificationOptions): Promise<void> => {
    await pwaService.showNotification(options);
  }, []);

  return {
    isSupported,
    permission,
    canNotify: permission === 'granted',
    requestPermission,
    showNotification
  };
};

/**
 * Hook for PWA sharing functionality
 */
export const usePWAShare = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const capabilities = pwaService.getCapabilities();
    setIsSupported(capabilities.supportsShare);
  }, []);

  const share = useCallback(async (data: PWAShareData): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Web Share API not supported');
      return false;
    }
    return await pwaService.share(data);
  }, [isSupported]);

  const canShare = useCallback((data: PWAShareData): boolean => {
    if (!isSupported) return false;
    return 'canShare' in navigator ? navigator.canShare(data) : true;
  }, [isSupported]);

  return {
    isSupported,
    share,
    canShare
  };
};

/**
 * Hook for online/offline status
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Hook for PWA background sync
 */
export const usePWABackgroundSync = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const capabilities = pwaService.getCapabilities();
    setIsSupported(capabilities.supportsBackgroundSync);
  }, []);

  const registerSync = useCallback(async (tag: string): Promise<void> => {
    if (!isSupported) {
      console.warn('Background Sync not supported');
      return;
    }
    await pwaService.registerBackgroundSync(tag);
  }, [isSupported]);

  return {
    isSupported,
    registerSync
  };
};

/**
 * Hook for PWA caching
 */
export const usePWACache = () => {
  const cacheUrls = useCallback(async (urls: string[]): Promise<void> => {
    await pwaService.cacheUrls(urls);
  }, []);

  const cachePhotos = useCallback(async (photoUrls: string[]): Promise<void> => {
    await cacheUrls(photoUrls);
  }, [cacheUrls]);

  const cacheTemplates = useCallback(async (templateUrls: string[]): Promise<void> => {
    await cacheUrls(templateUrls);
  }, [cacheUrls]);

  return {
    cacheUrls,
    cachePhotos,
    cacheTemplates
  };
};

/**
 * Hook for PWA standalone mode detection
 */
export const usePWAStandalone = () => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as unknown as { standalone?: boolean }).standalone ||
                        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };

    checkStandalone();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = () => checkStandalone();
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return isStandalone;
};
