/**
 * PSC Dashboard - Service Worker
 * SystemIntegrator_PSC Caching & Performance Service Worker
 * Version: 1.0.0 - Production Ready
 */

const CACHE_NAME = 'psc-dashboard-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only'
};

// Resource categories with their caching strategies
const RESOURCE_CACHE_CONFIG = {
    // Static assets - Cache first for performance
    static: {
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        patterns: [
            /\.(?:css|js|woff|woff2|ttf|eot)$/,
            /\/assets\//,
            /\/src\/assets\//,
            /tabler.*\.css$/,
            /apexcharts.*\.js$/
        ],
        maxAge: 604800000 // 7 days
    },
    
    // Images - Cache first with longer TTL
    images: {
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        patterns: [
            /\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico)$/,
            /\/images\//,
            /\/img\//
        ],
        maxAge: 2592000000 // 30 days
    },
    
    // HTML pages - Stale while revalidate for balance
    pages: {
        strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
        patterns: [
            /\.html$/,
            /\/pages\//,
            /^\/$/ // Root path
        ],
        maxAge: 86400000 // 1 day
    },
    
    // API calls - Network first for freshness
    api: {
        strategy: CACHE_STRATEGIES.NETWORK_FIRST,
        patterns: [
            /\/api\//,
            /\.json$/,
            /\/data\//
        ],
        maxAge: 300000, // 5 minutes
        networkTimeout: 3000
    },
    
    // Critical data - Network first with short cache
    critical: {
        strategy: CACHE_STRATEGIES.NETWORK_FIRST,
        patterns: [
            /inspection.*\.json$/,
            /fleet.*\.json$/,
            /kpi.*\.json$/
        ],
        maxAge: 180000, // 3 minutes
        networkTimeout: 2000
    }
};

// Install event - Cache essential resources
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching essential resources...');
                
                // Essential resources to cache immediately
                const essentialResources = [
                    // Core HTML pages
                    './',
                    './index.html',
                    './src/pages/dashboard.html',
                    './src/pages/inspections.html',
                    './src/pages/vessels.html',
                    './src/pages/ports-map.html',
                    
                    // Critical CSS
                    './src/assets/css/psc-custom.css',
                    'https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css',
                    
                    // Critical JavaScript
                    './src/assets/js/state-management.js',
                    './src/assets/js/api-integration-system.js',
                    './src/assets/js/caching-strategy-system.js',
                    './src/assets/js/performance-optimization-system.js',
                    './src/assets/js/system-integration-core.js',
                    './src/assets/js/module-integration.js',
                    
                    // Essential data
                    './src/assets/data/inspection_fact.json',
                    
                    // Third-party libraries
                    'https://cdn.jsdelivr.net/npm/apexcharts@3.44.0/dist/apexcharts.min.js'
                ];
                
                return cache.addAll(essentialResources);
            })
            .then(() => {
                console.log('✅ Essential resources cached');
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker installation failed:', error);
            })
    );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName.startsWith('psc-dashboard-')) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Old caches cleaned up');
                // Take control of all clients immediately
                return self.clients.claim();
            })
    );
});

// Fetch event - Handle all network requests
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and chrome-extension requests
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    const url = new URL(event.request.url);
    
    // Determine cache strategy based on resource type
    const cacheConfig = getCacheConfig(url);
    
    if (!cacheConfig) {
        // No caching strategy defined, use network only
        return;
    }
    
    event.respondWith(
        handleRequest(event.request, cacheConfig)
            .catch((error) => {
                console.error('Fetch handler error:', error);
                
                // Return offline fallback if available
                return getOfflineFallback(url);
            })
    );
});

/**
 * Determine cache configuration for a URL
 */
function getCacheConfig(url) {
    const pathname = url.pathname;
    const fullUrl = url.href;
    
    // Check each resource category
    for (const [category, config] of Object.entries(RESOURCE_CACHE_CONFIG)) {
        if (config.patterns.some(pattern => pattern.test(pathname) || pattern.test(fullUrl))) {
            return { ...config, category };
        }
    }
    
    return null;
}

/**
 * Handle request based on cache strategy
 */
async function handleRequest(request, cacheConfig) {
    switch (cacheConfig.strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            return cacheFirst(request, cacheConfig);
        
        case CACHE_STRATEGIES.NETWORK_FIRST:
            return networkFirst(request, cacheConfig);
        
        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return staleWhileRevalidate(request, cacheConfig);
        
        case CACHE_STRATEGIES.CACHE_ONLY:
            return cacheOnly(request, cacheConfig);
        
        case CACHE_STRATEGIES.NETWORK_ONLY:
            return networkOnly(request);
        
        default:
            return fetch(request);
    }
}

/**
 * Cache First strategy - Check cache first, fallback to network
 */
async function cacheFirst(request, cacheConfig) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, cacheConfig.maxAge)) {
        // Add cache hit header for debugging
        const response = cachedResponse.clone();
        response.headers.set('X-Cache-Status', 'HIT');
        return response;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const responseToCache = networkResponse.clone();
            responseToCache.headers.set('X-Cache-Timestamp', Date.now().toString());
            cache.put(request, responseToCache);
            
            networkResponse.headers.set('X-Cache-Status', 'MISS');
            return networkResponse;
        }
        
        // Return cached response even if expired if network fails
        return cachedResponse || networkResponse;
        
    } catch (error) {
        console.error('Network request failed:', error);
        
        // Return cached response if network fails
        if (cachedResponse) {
            cachedResponse.headers.set('X-Cache-Status', 'STALE');
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Network First strategy - Try network first, fallback to cache
 */
async function networkFirst(request, cacheConfig) {
    const cache = await caches.open(CACHE_NAME);
    
    try {
        // Create a timeout promise
        const networkPromise = fetch(request);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Network timeout')), cacheConfig.networkTimeout || 5000);
        });
        
        const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const responseToCache = networkResponse.clone();
            responseToCache.headers.set('X-Cache-Timestamp', Date.now().toString());
            cache.put(request, responseToCache);
            
            networkResponse.headers.set('X-Cache-Status', 'NETWORK');
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
        
    } catch (error) {
        console.warn('Network request failed, falling back to cache:', error.message);
        
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            cachedResponse.headers.set('X-Cache-Status', 'FALLBACK');
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Stale While Revalidate strategy - Return cache immediately, update in background
 */
async function staleWhileRevalidate(request, cacheConfig) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Always attempt to fetch from network in background
    const networkResponsePromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                const responseToCache = response.clone();
                responseToCache.headers.set('X-Cache-Timestamp', Date.now().toString());
                cache.put(request, responseToCache);
            }
            return response;
        })
        .catch((error) => {
            console.warn('Background network request failed:', error);
        });
    
    if (cachedResponse) {
        // Return cached response immediately
        cachedResponse.headers.set('X-Cache-Status', 'SWR-CACHED');
        
        // Don't wait for network response
        networkResponsePromise.catch(() => {});
        
        return cachedResponse;
    }
    
    // No cached response, wait for network
    try {
        const networkResponse = await networkResponsePromise;
        networkResponse.headers.set('X-Cache-Status', 'SWR-NETWORK');
        return networkResponse;
    } catch (error) {
        throw error;
    }
}

/**
 * Cache Only strategy - Only return cached responses
 */
async function cacheOnly(request, cacheConfig) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        cachedResponse.headers.set('X-Cache-Status', 'CACHE-ONLY');
        return cachedResponse;
    }
    
    throw new Error('No cached response available');
}

/**
 * Network Only strategy - Always fetch from network
 */
async function networkOnly(request) {
    const response = await fetch(request);
    response.headers.set('X-Cache-Status', 'NETWORK-ONLY');
    return response;
}

/**
 * Check if cached response is expired
 */
function isExpired(response, maxAge) {
    if (!maxAge) return false;
    
    const timestamp = response.headers.get('X-Cache-Timestamp');
    if (!timestamp) return true;
    
    return (Date.now() - parseInt(timestamp)) > maxAge;
}

/**
 * Get offline fallback response
 */
async function getOfflineFallback(url) {
    const cache = await caches.open(CACHE_NAME);
    
    // Try to return a cached version of the requested resource
    const cachedResponse = await cache.match(url.href);
    if (cachedResponse) {
        cachedResponse.headers.set('X-Cache-Status', 'OFFLINE-FALLBACK');
        return cachedResponse;
    }
    
    // Return offline page for HTML requests
    if (url.pathname.endsWith('.html') || url.pathname === '/') {
        const offlinePage = await cache.match('./offline.html');
        if (offlinePage) {
            return offlinePage;
        }
    }
    
    // Return generic offline response
    return new Response(
        JSON.stringify({
            error: 'Offline',
            message: 'This resource is not available offline',
            timestamp: new Date().toISOString()
        }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json',
                'X-Cache-Status': 'OFFLINE'
            }
        }
    );
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

/**
 * Handle background synchronization
 */
async function handleBackgroundSync() {
    try {
        console.log('🔄 Performing background sync...');
        
        // Update critical data when online
        const criticalResources = [
            './src/assets/data/inspection_fact.json'
        ];
        
        const cache = await caches.open(CACHE_NAME);
        
        for (const resource of criticalResources) {
            try {
                const response = await fetch(resource);
                if (response.ok) {
                    const responseToCache = response.clone();
                    responseToCache.headers.set('X-Cache-Timestamp', Date.now().toString());
                    await cache.put(resource, responseToCache);
                    console.log(`✅ Updated ${resource} in background`);
                }
            } catch (error) {
                console.warn(`Failed to update ${resource} in background:`, error);
            }
        }
        
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'PSC Dashboard', {
                body: data.body || 'New update available',
                icon: './src/assets/img/psc-icon-192.png',
                badge: './src/assets/img/psc-badge-72.png',
                tag: 'psc-notification',
                data: data.data || {}
            })
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || './')
    );
});

// Performance monitoring
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_CACHE_STATS') {
        getCacheStats().then((stats) => {
            event.ports[0].postMessage({
                type: 'CACHE_STATS',
                stats
            });
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearCache().then((success) => {
            event.ports[0].postMessage({
                type: 'CACHE_CLEARED',
                success
            });
        });
    }
});

/**
 * Get cache statistics
 */
async function getCacheStats() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        
        const stats = {
            totalCached: keys.length,
            cacheSize: 0,
            categories: {}
        };
        
        // Estimate cache size and categorize
        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const size = parseInt(response.headers.get('content-length') || '0');
                stats.cacheSize += size;
                
                const config = getCacheConfig(new URL(request.url));
                const category = config?.category || 'other';
                
                if (!stats.categories[category]) {
                    stats.categories[category] = { count: 0, size: 0 };
                }
                
                stats.categories[category].count++;
                stats.categories[category].size += size;
            }
        }
        
        return stats;
        
    } catch (error) {
        console.error('Failed to get cache stats:', error);
        return { error: error.message };
    }
}

/**
 * Clear cache
 */
async function clearCache() {
    try {
        const deleted = await caches.delete(CACHE_NAME);
        console.log('🗑️ Cache cleared:', deleted);
        return deleted;
    } catch (error) {
        console.error('Failed to clear cache:', error);
        return false;
    }
}

console.log('🔧 PSC Dashboard Service Worker loaded - Multi-tier caching active');