import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);