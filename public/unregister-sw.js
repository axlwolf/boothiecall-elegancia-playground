/**
 * Script to unregister service worker and clear caches
 * Run this in browser console to clean up PWA state
 */

async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        console.log('Unregistering service worker:', registration.scope);
        await registration.unregister();
      }
      
      console.log('All service workers unregistered');
    } catch (error) {
      console.error('Error unregistering service workers:', error);
    }
  }
}

async function clearCaches() {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        console.log('Deleting cache:', cacheName);
        await caches.delete(cacheName);
      }
      
      console.log('All caches cleared');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }
}

async function cleanupPWA() {
  console.log('Starting PWA cleanup...');
  
  await unregisterServiceWorker();
  await clearCaches();
  
  console.log('PWA cleanup complete. Please refresh the page.');
  
  // Force reload to ensure clean state
  window.location.reload();
}

// Auto-run cleanup
cleanupPWA();
