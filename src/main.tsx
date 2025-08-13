import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { swCleanup } from './lib/swCleanup'
import { performanceMonitor } from './lib/performanceMonitor'

// Handle service worker based on environment
if (typeof window !== 'undefined') {
  if (import.meta.env.PROD) {
    // Only enable PWA in production
    import('./lib/pwaService').then(() => {
      console.log('PWA service initialized');
    });
  } else {
    // In development, clean up any existing service workers
    console.log('Development mode - cleaning up service workers');
    swCleanup.startDevelopmentMonitoring();
  }
}

createRoot(document.getElementById("root")!).render(<App />);