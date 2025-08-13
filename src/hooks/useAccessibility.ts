import { useEffect, useCallback, useState } from 'react';

export interface AccessibilitySettings {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;
  focusVisible: boolean;
}

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    keyboardNavigation: true,
    screenReaderMode: false,
    focusVisible: true
  });

  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    // Detect user preferences from system
    const mediaQueries = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)')
    };

    // Set initial values based on system preferences
    setSettings(prev => ({
      ...prev,
      reduceMotion: mediaQueries.reduceMotion.matches,
      highContrast: mediaQueries.highContrast.matches
    }));

    // Listen for changes in media queries
    const handleReduceMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reduceMotion: e.matches }));
    };

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    };

    mediaQueries.reduceMotion.addEventListener('change', handleReduceMotionChange);
    mediaQueries.highContrast.addEventListener('change', handleHighContrastChange);

    return () => {
      mediaQueries.reduceMotion.removeEventListener('change', handleReduceMotionChange);
      mediaQueries.highContrast.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  useEffect(() => {
    // Detect keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    // Apply accessibility classes to document
    const body = document.body;
    const root = document.documentElement;

    // Reduce motion
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Screen reader mode
    if (settings.screenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }

  }, [settings]);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const announceToScreenReader = useCallback((message: string) => {
    // Create a live region for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const getAccessibleProps = useCallback((element: string) => {
    const baseProps: Record<string, any> = {};

    switch (element) {
      case 'button':
        return {
          ...baseProps,
          role: 'button',
          tabIndex: 0,
          'aria-describedby': undefined,
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              (e.target as HTMLElement).click();
            }
          }
        };
      
      case 'link':
        return {
          ...baseProps,
          role: 'link',
          tabIndex: 0
        };
        
      case 'navigation':
        return {
          ...baseProps,
          role: 'navigation',
          'aria-label': 'Main navigation'
        };
        
      case 'main':
        return {
          ...baseProps,
          role: 'main',
          'aria-label': 'Main content'
        };
        
      case 'dialog':
        return {
          ...baseProps,
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': undefined,
          'aria-describedby': undefined
        };
        
      default:
        return baseProps;
    }
  }, []);

  const skipToContent = useCallback(() => {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      announceToScreenReader('Skipped to main content');
    }
  }, [announceToScreenReader]);

  return {
    settings,
    updateSetting,
    isKeyboardUser,
    announceToScreenReader,
    getAccessibleProps,
    skipToContent
  };
};