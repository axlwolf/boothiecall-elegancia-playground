/**
 * Service Worker for BoothieCall Elegancia Playground
 * Provides offline functionality and asset caching
 */

// Enhanced development mode detection
const isDevelopment = (() => {
  // Check multiple indicators for development mode
  const hostname = location.hostname;
  const port = location.port;
  const protocol = location.protocol;
  
  // Development indicators
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isDevPort = port === '5173' || port === '3000' || port === '8080' || port === '8081';
  const isFileProtocol = protocol === 'file:';
  const hasDevQuery = location.search.includes('dev=true');
  
  // Check for Vite dev server specific patterns
  const isViteDevServer = hostname === 'localhost' && (port === '5173' || port === '4173');
  
  return isLocalhost || isDevPort || isFileProtocol || hasDevQuery || isViteDevServer;
})();

// Development mode service worker with improved error handling
if (isDevelopment) {
  console.log('🔧 Development mode detected - service worker will be minimal');
  
  // Install immediately with error handling
  self.addEventListener('install', (event) => {
    console.log('SW: Installing in dev mode (minimal functionality)');
    try {
      self.skipWaiting();
    } catch (error) {
      console.warn('SW: Skip waiting failed in dev mode:', error);
    }
  });
  
  // Activate with improved error handling
  self.addEventListener('activate', (event) => {
    console.log('SW: Activating in dev mode (minimal functionality)');
    event.waitUntil(
      (async () => {
        try {
          // Only claim clients if not already claimed to avoid InvalidStateError
          const clients = await self.clients.matchAll();
          if (clients.length === 0) {
            await self.clients.claim();
            console.log('SW: Clients claimed successfully in dev mode');
          } else {
            console.log('SW: Clients already claimed, skipping claim in dev mode');
          }
        } catch (error) {
          console.warn('SW: Client claim failed in dev mode (this is usually safe to ignore):', error);
        }
      })()
    );
  });
  
  // Minimal fetch handling - only log for debugging
  self.addEventListener('fetch', (event) => {
    // In development, let all requests pass through normally
    // Only log for debugging if needed
    if (event.request.url.includes('debug-sw')) {
      console.log('SW: Dev mode fetch (pass-through):', event.request.url);
    }
  });
  
  // Add development message handlers
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'DEV_CLEANUP') {
      console.log('SW: Development cleanup requested');
      event.ports[0].postMessage({ success: true, message: 'Development cleanup completed' });
    } else if (event.data && event.data.type === 'DEV_PING') {
      console.log('SW: Development ping received');
      event.ports[0].postMessage({ success: true, message: 'Service worker is responsive', timestamp: Date.now() });
    }
  });
  
  console.log('✅ Service worker active in development mode (minimal functionality)');
} else {

const CACHE_NAME = 'boothiecall-elegancia-v1.0.3-fixed';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Core icons that should always be available
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/maskable-icon-192x192.png',
  '/icons/maskable-icon-512x512.png'
];

// Runtime cache patterns
const RUNTIME_CACHE_PATTERNS = [
  // Images
  { pattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i, strategy: 'CacheFirst' },
  // Fonts
  { pattern: /\.(?:woff|woff2|ttf|otf)$/i, strategy: 'CacheFirst' },
  // API calls
  { pattern: /^https:\/\/api\./, strategy: 'NetworkFirst' },
  // Templates and assets
  { pattern: /\/assets\//, strategy: 'CacheFirst' },
  // Other resources
  { pattern: /\.(?:js|css)$/i, strategy: 'StaleWhileRevalidate' }
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Caching static assets...');
        
        // Cache assets individually to handle failures gracefully
        const cachePromises = STATIC_ASSETS.map(async (asset) => {
          try {
            await cache.add(asset);
            console.log(`Cached: ${asset}`);
          } catch (error) {
            console.warn(`Failed to cache ${asset}:`, error.message);
            // Don't fail the entire installation for missing assets
          }
        });
        
        await Promise.allSettled(cachePromises);
        console.log('Static asset caching completed');
        
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to open cache:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  
  event.waitUntil(
    // Clean up old caches only
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * Fetch event - handle network requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle other requests based on patterns
  for (const { pattern, strategy } of RUNTIME_CACHE_PATTERNS) {
    if (pattern.test(url.pathname) || pattern.test(url.href)) {
      event.respondWith(handleRequestSafely(request, strategy));
      return;
    }
  }
  
  // Default: network first
  event.respondWith(handleRequestSafely(request, 'NetworkFirst'));
});

/**
 * Handle navigation requests (page loads)
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, cache and return
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
    
  } catch (error) {
    console.log('Network failed, trying cache...');
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    console.log('Serving offline page');
    return caches.match(OFFLINE_URL);
  }
}

/**
 * Handle requests with different caching strategies (with error handling)
 */
async function handleRequestSafely(request, strategy) {
  try {
    return await handleRequest(request, strategy);
  } catch (error) {
    console.warn('Request failed:', request.url, error.message);
    
    // Return fallback responses for different resource types
    if (request.url.includes('.css')) {
      return new Response('/* Fallback CSS */', {
        headers: { 'Content-Type': 'text/css' },
        status: 200
      });
    }
    
    if (request.url.includes('.js')) {
      return new Response('// Fallback JS', {
        headers: { 'Content-Type': 'application/javascript' },
        status: 200
      });
    }
    
    if (request.url.includes('icons/') || request.url.includes('.png') || request.url.includes('.jpg')) {
      // Return a simple 1x1 transparent PNG for missing images
      const fallbackImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      return fetch(fallbackImage);
    }
    
    // For other requests, return a generic error response
    return new Response('Resource not available', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

/**
 * Handle requests with different caching strategies
 */
async function handleRequest(request, strategy) {
  switch (strategy) {
    case 'CacheFirst':
      return cacheFirst(request);
    case 'NetworkFirst':
      return networkFirst(request);
    case 'StaleWhileRevalidate':
      return staleWhileRevalidate(request);
    default:
      return fetch(request);
  }
}

/**
 * Cache First strategy - check cache first, fallback to network
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    throw error;
  }
}

/**
 * Network First strategy - try network first, fallback to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Don't throw error, just fall through to cache check
    console.log('Network response not ok:', networkResponse.status, 'for:', request.url);
    
  } catch (error) {
    console.log('Network first fallback to cache for:', request.url);
  }
  
  // Always try cache as fallback
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Return fallback responses for different resource types
  if (request.url.includes('.css')) {
    return new Response('/* Fallback CSS */', {
      headers: { 'Content-Type': 'text/css' },
      status: 200
    });
  }
  
  if (request.url.includes('.js')) {
    return new Response('// Fallback JS', {
      headers: { 'Content-Type': 'application/javascript' },
      status: 200
    });
  }
  
  if (request.url.includes('icons/') || request.url.includes('.png') || request.url.includes('.jpg')) {
    // Return a simple 1x1 transparent PNG for missing images
    const fallbackImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    return fetch(fallbackImage);
  }
  
  // Generic fallback
  return new Response('Resource not available', {
    status: 404,
    statusText: 'Not Found'
  });
}

/**
 * Stale While Revalidate strategy - return cache immediately, update in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return networkResponsePromise;
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'photo-session-sync') {
    event.waitUntil(syncPhotoSessions());
  }
});

/**
 * Sync photo sessions when back online
 */
async function syncPhotoSessions() {
  try {
    // Get offline sessions from IndexedDB
    const offlineSessions = await getOfflinePhotoSessions();
    
    if (offlineSessions.length === 0) {
      console.log('No offline sessions to sync');
      return;
    }
    
    console.log(`Syncing ${offlineSessions.length} offline sessions...`);
    
    // Sync each session
    for (const session of offlineSessions) {
      try {
        await syncSingleSession(session);
        await markSessionAsSynced(session.id);
        console.log(`Synced session: ${session.id}`);
      } catch (error) {
        console.error(`Failed to sync session ${session.id}:`, error);
      }
    }
    
    console.log('Photo session sync completed');
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

/**
 * Get offline photo sessions (placeholder - would integrate with IndexedDB)
 */
async function getOfflinePhotoSessions() {
  // This would integrate with the actual IndexedDB storage
  return [];
}

/**
 * Sync a single session to the server
 */
async function syncSingleSession(session) {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(session)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Mark session as synced in IndexedDB
 */
async function markSessionAsSynced(sessionId) {
  // This would update the session in IndexedDB
  console.log(`Marked session ${sessionId} as synced`);
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'New features available in BoothieCall Elegancia!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('BoothieCall Elegancia', options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Message handling for communication with main thread
 */
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('Service Worker loaded successfully');

} // End of production mode block
