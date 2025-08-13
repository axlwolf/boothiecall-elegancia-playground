import React, { useState, useEffect } from 'react';
import AccessibilitySettings from './AccessibilitySettings';
import PerformanceDashboard from './PerformanceDashboard';
import { useBrowserCompatibility, useBrowserStyles } from '@/hooks/useBrowserCompatibility';
import { usePWAStandalone } from '../hooks/usePWA';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { PWAUpdateToast } from './PWAUpdatePrompt';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  
  // Browser compatibility hooks
  const { browserInfo, appliedFixes, compatibilityTests, isInitialized } = useBrowserCompatibility();
  const { styles: browserStyles, classes: browserClasses } = useBrowserStyles();
  const isStandalone = usePWAStandalone();
  
  // Apply browser-specific classes to document
  useEffect(() => {
    if (browserClasses.length > 0) {
      document.documentElement.classList.add(...browserClasses);
      
      // Apply browser-specific styles
      Object.entries(browserStyles).forEach(([property, value]) => {
        document.documentElement.style.setProperty(property, value);
      });
      
      console.log('Browser compatibility applied:', {
        browser: browserInfo ? `${browserInfo.name} ${browserInfo.version}` : 'Unknown',
        classes: browserClasses.length,
        fixes: appliedFixes.length
      });
    }
  }, [browserClasses, browserStyles, browserInfo, appliedFixes]);
  
  useEffect(() => {
    // Apply browser-specific classes to body
    const classes = [...browserClasses];
    if (isStandalone) {
      classes.push('pwa-standalone');
    }
    document.body.className = `${document.body.className} ${classes.join(' ')}`.trim();
    
    // Apply CSS custom properties
    Object.entries(browserStyles).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
    
    // PWA-specific styles
    if (isStandalone) {
      document.documentElement.style.setProperty('--pwa-safe-area-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--pwa-safe-area-bottom', 'env(safe-area-inset-bottom)');
    }
    
    console.log('App layout initialized:', {
      browser: browserInfo ? `${browserInfo.name} ${browserInfo.version}` : 'Unknown',
      fixes: appliedFixes.length,
      features: Object.keys(compatibilityTests).filter(key => compatibilityTests[key]),
      standalone: isStandalone
    });
  }, [browserClasses, browserStyles, browserInfo, appliedFixes, compatibilityTests, isStandalone]);
  
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Gallery Background */}
      <div className="gallery-background" />
      
      {/* Accessibility Settings - Floating Button */}
      <div className="fixed top-4 right-4 z-50">
        <AccessibilitySettings />
      </div>
      
      {/* Performance Dashboard */}
      <PerformanceDashboard 
        isVisible={showPerformanceDashboard}
        onToggle={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
      />
      
      {/* Main Content */}
      <main id="main-content" className="relative z-10" role="main" aria-label="Main application content">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;