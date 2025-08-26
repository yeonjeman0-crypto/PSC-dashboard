/**
 * PSC Dashboard - Multi-Tier Caching Strategy System
 * SystemIntegrator_PSC Performance Optimization Implementation
 * Version: 1.0.0 - Production Ready
 * Target: Sub-3-second loading times
 */

class CachingStrategySystem {
    constructor() {
        this.cacheConfig = {
            // Browser Cache Configuration
            browser: {
                enabled: true,
                ttl: {
                    static: 604800000,    // 7 days for static assets
                    dynamic: 300000,      // 5 minutes for dynamic data
                    images: 2592000000,   // 30 days for images
                    api: 180000           // 3 minutes for API responses
                }
            },
            
            // Memory Cache Configuration (L1 Cache)
            memory: {
                enabled: true,
                maxSize: 100,         // Max 100 items
                ttl: {
                    kpis: 300000,         // 5 minutes
                    charts: 600000,       // 10 minutes
                    fleet: 1800000,       // 30 minutes
                    inspections: 300000,  // 5 minutes
                    ports: 3600000        // 1 hour (static-ish data)
                }
            },
            
            // Service Worker Cache (L2 Cache)
            serviceWorker: {
                enabled: 'serviceWorker' in navigator,
                cacheName: 'psc-dashboard-v1.0.0',
                strategies: {
                    static: 'CacheFirst',      // CSS, JS, Images
                    api: 'NetworkFirst',       // API calls
                    pages: 'StaleWhileRevalidate' // HTML pages
                }
            },
            
            // CDN Integration
            cdn: {
                enabled: true,
                baseURL: 'https://cdn.psc-dashboard.com',
                paths: {
                    assets: '/assets',
                    images: '/images',
                    fonts: '/fonts'
                }
            }
        };
        
        this.memoryCache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalRequests: 0
        };
        
        this.initializeCachingSystem();
    }
    
    /**
     * Initialize multi-tier caching system
     */
    initializeCachingSystem() {
        this.setupMemoryCache();
        this.initializeServiceWorker();
        this.setupBrowserCacheHeaders();
        this.setupPerformanceMonitoring();
        this.startCacheCleanupScheduler();
        
        console.log('⚡ CachingStrategySystem initialized - Multi-tier caching active');
    }
    
    /**
     * Set up memory cache (L1 Cache)
     */
    setupMemoryCache() {
        // Enhanced memory cache with LRU eviction
        this.memoryCache = new Map();
        this.accessOrder = new Map(); // Track access order for LRU
        
        console.log('💾 Memory cache (L1) initialized');
    }
    
    /**
     * Initialize Service Worker for L2 caching
     */
    initializeServiceWorker() {
        if (!this.cacheConfig.serviceWorker.enabled) {
            console.warn('⚠️ Service Worker not supported');
            return;
        }
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('🔧 Service Worker registered:', registration);
                    this.serviceWorkerRegistration = registration;
                })
                .catch(error => {
                    console.error('Service Worker registration failed:', error);
                });
        }
    }
    
    /**
     * Set up browser cache headers
     */
    setupBrowserCacheHeaders() {
        // Intercept fetch to add appropriate cache headers
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options = {}) => {
            const headers = { ...options.headers };
            
            // Determine cache strategy based on URL
            if (this.isStaticAsset(url)) {
                headers['Cache-Control'] = 'public, max-age=604800'; // 7 days
            } else if (this.isAPIEndpoint(url)) {
                headers['Cache-Control'] = 'private, max-age=180'; // 3 minutes
            }
            
            return originalFetch(url, { ...options, headers });
        };
    }
    
    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
        this.performanceMetrics = {
            cacheHitRate: 0,
            averageResponseTime: 0,
            totalDataTransferred: 0,
            bandwidthSaved: 0
        };
        
        // Update metrics every minute
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 60000);
    }
    
    /**
     * Start cache cleanup scheduler
     */
    startCacheCleanupScheduler() {
        // Clean expired entries every 5 minutes
        setInterval(() => {
            this.cleanupExpiredEntries();
        }, 300000);
        
        // Deep cleanup every hour
        setInterval(() => {
            this.performDeepCleanup();
        }, 3600000);
    }
    
    // ==================== CACHE OPERATIONS ====================
    
    /**
     * Get data from cache with multi-tier lookup
     */
    async get(key, options = {}) {
        this.cacheStats.totalRequests++;
        
        try {
            // L1: Check memory cache first
            const memoryResult = this.getFromMemoryCache(key);
            if (memoryResult) {
                this.cacheStats.hits++;
                return { data: memoryResult, source: 'memory', hit: true };
            }
            
            // L2: Check Service Worker cache
            const swResult = await this.getFromServiceWorkerCache(key);
            if (swResult) {
                this.cacheStats.hits++;
                // Store in memory cache for faster future access
                this.setInMemoryCache(key, swResult, options.ttl);
                return { data: swResult, source: 'serviceWorker', hit: true };
            }
            
            // L3: Check browser cache (handled by browser automatically)
            // This would be handled by the browser's native caching mechanism
            
            this.cacheStats.misses++;
            return { data: null, source: null, hit: false };
            
        } catch (error) {
            console.error('Cache get operation failed:', error);
            this.cacheStats.misses++;
            return { data: null, source: null, hit: false, error };
        }
    }
    
    /**
     * Set data in appropriate cache tiers
     */
    async set(key, data, options = {}) {
        try {
            const ttl = options.ttl || this.determineTTL(key);
            const size = this.estimateDataSize(data);
            
            // Always store in memory cache (L1) for fastest access
            this.setInMemoryCache(key, data, ttl);
            
            // Store in Service Worker cache (L2) for persistence
            if (this.shouldUseServiceWorkerCache(key, size)) {
                await this.setInServiceWorkerCache(key, data, ttl);
            }
            
            // Browser cache (L3) is handled by fetch interceptor
            
            return { success: true, cached: true };
            
        } catch (error) {
            console.error('Cache set operation failed:', error);
            return { success: false, error };
        }
    }
    
    /**
     * Invalidate cache entry across all tiers
     */
    async invalidate(key) {
        try {
            // Remove from memory cache
            this.memoryCache.delete(key);
            this.accessOrder.delete(key);
            
            // Remove from Service Worker cache
            await this.removeFromServiceWorkerCache(key);
            
            return { success: true, invalidated: true };
            
        } catch (error) {
            console.error('Cache invalidation failed:', error);
            return { success: false, error };
        }
    }
    
    /**
     * Clear all caches
     */
    async clearAll() {
        try {
            // Clear memory cache
            this.memoryCache.clear();
            this.accessOrder.clear();
            
            // Clear Service Worker cache
            await this.clearServiceWorkerCache();
            
            console.log('🗑️ All caches cleared');
            return { success: true };
            
        } catch (error) {
            console.error('Cache clear operation failed:', error);
            return { success: false, error };
        }
    }
    
    // ==================== MEMORY CACHE OPERATIONS ====================
    
    /**
     * Get from memory cache with LRU tracking
     */
    getFromMemoryCache(key) {
        if (!this.memoryCache.has(key)) {
            return null;
        }
        
        const entry = this.memoryCache.get(key);
        
        // Check expiration
        if (Date.now() > entry.expiry) {
            this.memoryCache.delete(key);
            this.accessOrder.delete(key);
            return null;
        }
        
        // Update access order for LRU
        this.accessOrder.set(key, Date.now());
        
        return entry.data;
    }
    
    /**
     * Set in memory cache with LRU eviction
     */
    setInMemoryCache(key, data, ttl) {
        // Check if cache is full and evict LRU if necessary
        if (this.memoryCache.size >= this.cacheConfig.memory.maxSize) {
            this.evictLRU();
        }
        
        const expiry = Date.now() + (ttl || this.cacheConfig.memory.ttl.kpis);
        
        this.memoryCache.set(key, {
            data: this.deepClone(data),
            expiry,
            createdAt: Date.now(),
            size: this.estimateDataSize(data)
        });
        
        this.accessOrder.set(key, Date.now());
    }
    
    /**
     * Evict least recently used entries
     */
    evictLRU() {
        // Find least recently accessed entry
        let oldestKey = null;
        let oldestTime = Date.now();
        
        this.accessOrder.forEach((time, key) => {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        });
        
        if (oldestKey) {
            this.memoryCache.delete(oldestKey);
            this.accessOrder.delete(oldestKey);
            this.cacheStats.evictions++;
        }
    }
    
    // ==================== SERVICE WORKER CACHE OPERATIONS ====================
    
    /**
     * Get from Service Worker cache
     */
    async getFromServiceWorkerCache(key) {
        if (!this.cacheConfig.serviceWorker.enabled) {
            return null;
        }
        
        try {
            const cache = await caches.open(this.cacheConfig.serviceWorker.cacheName);
            const response = await cache.match(key);
            
            if (response) {
                return await response.json();
            }
            
            return null;
            
        } catch (error) {
            console.error('Service Worker cache get failed:', error);
            return null;
        }
    }
    
    /**
     * Set in Service Worker cache
     */
    async setInServiceWorkerCache(key, data, ttl) {
        if (!this.cacheConfig.serviceWorker.enabled) {
            return;
        }
        
        try {
            const cache = await caches.open(this.cacheConfig.serviceWorker.cacheName);
            
            const response = new Response(JSON.stringify({
                data,
                expiry: Date.now() + ttl,
                cached: Date.now()
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': `max-age=${Math.floor(ttl / 1000)}`
                }
            });
            
            await cache.put(key, response);
            
        } catch (error) {
            console.error('Service Worker cache set failed:', error);
        }
    }
    
    /**
     * Remove from Service Worker cache
     */
    async removeFromServiceWorkerCache(key) {
        if (!this.cacheConfig.serviceWorker.enabled) {
            return;
        }
        
        try {
            const cache = await caches.open(this.cacheConfig.serviceWorker.cacheName);
            await cache.delete(key);
            
        } catch (error) {
            console.error('Service Worker cache delete failed:', error);
        }
    }
    
    /**
     * Clear Service Worker cache
     */
    async clearServiceWorkerCache() {
        if (!this.cacheConfig.serviceWorker.enabled) {
            return;
        }
        
        try {
            await caches.delete(this.cacheConfig.serviceWorker.cacheName);
            
        } catch (error) {
            console.error('Service Worker cache clear failed:', error);
        }
    }
    
    // ==================== CACHE STRATEGY HELPERS ====================
    
    /**
     * Determine appropriate TTL for data type
     */
    determineTTL(key) {
        if (key.includes('kpi')) return this.cacheConfig.memory.ttl.kpis;
        if (key.includes('chart')) return this.cacheConfig.memory.ttl.charts;
        if (key.includes('fleet')) return this.cacheConfig.memory.ttl.fleet;
        if (key.includes('inspection')) return this.cacheConfig.memory.ttl.inspections;
        if (key.includes('port')) return this.cacheConfig.memory.ttl.ports;
        
        return this.cacheConfig.memory.ttl.kpis; // Default
    }
    
    /**
     * Estimate data size for cache management
     */
    estimateDataSize(data) {
        try {
            return JSON.stringify(data).length;
        } catch (error) {
            return 1000; // Default estimate
        }
    }
    
    /**
     * Determine if data should use Service Worker cache
     */
    shouldUseServiceWorkerCache(key, size) {
        // Don't cache very large objects in Service Worker
        if (size > 1048576) return false; // 1MB limit
        
        // Cache static and semi-static data in Service Worker
        return key.includes('fleet') || 
               key.includes('port') || 
               key.includes('reference') ||
               key.includes('static');
    }
    
    /**
     * Check if URL is a static asset
     */
    isStaticAsset(url) {
        return /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i.test(url);
    }
    
    /**
     * Check if URL is an API endpoint
     */
    isAPIEndpoint(url) {
        return url.includes('/api/') || url.includes('api.');
    }
    
    // ==================== CACHE MANAGEMENT ====================
    
    /**
     * Clean up expired entries across all cache tiers
     */
    cleanupExpiredEntries() {
        const now = Date.now();
        const expiredKeys = [];
        
        // Check memory cache for expired entries
        this.memoryCache.forEach((entry, key) => {
            if (now > entry.expiry) {
                expiredKeys.push(key);
            }
        });
        
        // Remove expired entries
        expiredKeys.forEach(key => {
            this.memoryCache.delete(key);
            this.accessOrder.delete(key);
        });
        
        if (expiredKeys.length > 0) {
            console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
        }
    }
    
    /**
     * Perform deep cleanup and optimization
     */
    async performDeepCleanup() {
        try {
            // Memory cache optimization
            this.optimizeMemoryCache();
            
            // Service Worker cache cleanup
            await this.optimizeServiceWorkerCache();
            
            // Update performance metrics
            this.updatePerformanceMetrics();
            
            console.log('🔧 Deep cache cleanup completed');
            
        } catch (error) {
            console.error('Deep cleanup failed:', error);
        }
    }
    
    /**
     * Optimize memory cache by removing least valuable entries
     */
    optimizeMemoryCache() {
        const cacheEntries = Array.from(this.memoryCache.entries());
        
        // Sort by access frequency and size efficiency
        cacheEntries.sort((a, b) => {
            const aScore = this.calculateCacheScore(a[0], a[1]);
            const bScore = this.calculateCacheScore(b[0], b[1]);
            return bScore - aScore; // Higher score first
        });
        
        // Keep only top 80% of cache entries
        const keepCount = Math.floor(cacheEntries.length * 0.8);
        const toRemove = cacheEntries.slice(keepCount);
        
        toRemove.forEach(([key]) => {
            this.memoryCache.delete(key);
            this.accessOrder.delete(key);
        });
        
        this.cacheStats.evictions += toRemove.length;
    }
    
    /**
     * Calculate cache score for optimization
     */
    calculateCacheScore(key, entry) {
        const accessTime = this.accessOrder.get(key) || 0;
        const age = Date.now() - entry.createdAt;
        const sizeScore = 1000 / (entry.size || 1000); // Prefer smaller entries
        const accessScore = (Date.now() - accessTime) / 1000; // Recently accessed is better
        const typeScore = this.getTypeScore(key); // Some data types are more valuable
        
        return (sizeScore * 0.3) + (accessScore * 0.4) + (typeScore * 0.3);
    }
    
    /**
     * Get type score for different data types
     */
    getTypeScore(key) {
        if (key.includes('kpi')) return 10;      // KPIs are high value
        if (key.includes('chart')) return 8;     // Chart data is valuable
        if (key.includes('fleet')) return 6;     // Fleet data is moderately valuable
        if (key.includes('reference')) return 9; // Reference data is very valuable
        
        return 5; // Default score
    }
    
    /**
     * Optimize Service Worker cache
     */
    async optimizeServiceWorkerCache() {
        if (!this.cacheConfig.serviceWorker.enabled) {
            return;
        }
        
        try {
            const cache = await caches.open(this.cacheConfig.serviceWorker.cacheName);
            const requests = await cache.keys();
            
            const now = Date.now();
            const toDelete = [];
            
            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const data = await response.json();
                    if (data.expiry && now > data.expiry) {
                        toDelete.push(request);
                    }
                }
            }
            
            // Delete expired entries
            await Promise.all(toDelete.map(request => cache.delete(request)));
            
            if (toDelete.length > 0) {
                console.log(`🧹 Removed ${toDelete.length} expired Service Worker cache entries`);
            }
            
        } catch (error) {
            console.error('Service Worker cache optimization failed:', error);
        }
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        if (this.cacheStats.totalRequests > 0) {
            this.performanceMetrics.cacheHitRate = 
                (this.cacheStats.hits / this.cacheStats.totalRequests * 100).toFixed(2);
        }
        
        // Estimate bandwidth saved (rough calculation)
        const avgDataSize = 10240; // 10KB average response
        this.performanceMetrics.bandwidthSaved = 
            (this.cacheStats.hits * avgDataSize / 1024 / 1024).toFixed(2); // MB saved
    }
    
    /**
     * Deep clone utility
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            return cloned;
        }
    }
    
    // ==================== PUBLIC API ====================
    
    /**
     * Get cache statistics and performance metrics
     */
    getStatistics() {
        return {
            cacheStats: { ...this.cacheStats },
            performanceMetrics: { ...this.performanceMetrics },
            memoryCache: {
                size: this.memoryCache.size,
                maxSize: this.cacheConfig.memory.maxSize,
                utilization: ((this.memoryCache.size / this.cacheConfig.memory.maxSize) * 100).toFixed(2) + '%'
            },
            configuration: {
                memory: this.cacheConfig.memory.enabled,
                serviceWorker: this.cacheConfig.serviceWorker.enabled,
                browser: this.cacheConfig.browser.enabled
            },
            timestamp: Date.now()
        };
    }
    
    /**
     * Warm up cache with essential data
     */
    async warmUpCache() {
        console.log('🔥 Warming up cache with essential data...');
        
        try {
            // Warm up with KPI data
            if (window.StateManagement?.data?.calculateKPIs) {
                const kpis = await window.StateManagement.data.calculateKPIs();
                await this.set('kpis-warmup', kpis);
            }
            
            // Warm up with fleet data
            if (window.StateManagement?.data?.getFleetData) {
                const fleetData = await window.StateManagement.data.getFleetData();
                await this.set('fleet-warmup', fleetData);
            }
            
            console.log('✅ Cache warm-up completed');
            
        } catch (error) {
            console.error('Cache warm-up failed:', error);
        }
    }
    
    /**
     * Configure cache settings
     */
    configureCaching(newConfig) {
        this.cacheConfig = { ...this.cacheConfig, ...newConfig };
        console.log('⚙️ Cache configuration updated');
    }
    
    /**
     * Get cache health status
     */
    getHealthStatus() {
        const hitRate = this.performanceMetrics.cacheHitRate;
        const memoryUtilization = (this.memoryCache.size / this.cacheConfig.memory.maxSize) * 100;
        
        let status = 'healthy';
        const issues = [];
        
        if (hitRate < 50) {
            status = 'warning';
            issues.push('Low cache hit rate');
        }
        
        if (memoryUtilization > 90) {
            status = 'warning';
            issues.push('High memory cache utilization');
        }
        
        if (this.cacheStats.evictions > this.cacheStats.hits) {
            status = 'critical';
            issues.push('Excessive cache evictions');
        }
        
        return { status, issues, timestamp: Date.now() };
    }
}

// Initialize and export caching system
const cachingStrategySystem = new CachingStrategySystem();

// Export for global access
window.CachingSystem = cachingStrategySystem;

// Legacy compatibility
window.cachingStrategySystem = cachingStrategySystem;

// Auto-warm cache on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        cachingStrategySystem.warmUpCache();
    }, 2000); // Wait 2 seconds after page load
});

console.log('⚡ PSC Dashboard Caching Strategy System ready - Multi-tier caching for sub-3-second performance');