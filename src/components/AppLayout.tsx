import { ReactNode } from 'react';
import AccessibilitySettings from './AccessibilitySettings';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Gallery Background */}
      <div className="gallery-background" />
      
      {/* Accessibility Settings - Floating Button */}
      <div className="fixed top-4 right-4 z-50">
        <AccessibilitySettings />
      </div>
      
      {/* Main Content */}
      <main id="main-content" className="relative z-10" role="main" aria-label="Main application content">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;