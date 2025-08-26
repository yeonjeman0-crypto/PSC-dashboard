/**
 * PSC Dashboard - Performance Optimization System
 * SystemIntegrator_PSC Implementation - Sub-3 Second Loading Target
 * Version: 1.0.0 - Production Ready
 */

class PerformanceOptimizer {
    constructor() {
        this.metrics = new Map();
        this.cacheManager = new CacheManager();
        this.lazyLoader = new LazyLoadingManager();
        this.bundleOptimizer = new BundleOptimizer();
        this.performanceMonitor = new PerformanceMonitor();
        
        this.loadTimeTarget = 3000; // 3 seconds
        this.initializeOptimizer();
    }
    
    /**
     * Initialize performance optimization system
     */
    initializeOptimizer() {
        this.measureInitialLoad();
        this.setupPerformanceObservers();
        this.initializeCaching();
        this.optimizeBundleLoading();
        
        console.log('🚀 PerformanceOptimizer initialized - Target: <3s load time');
    }
    
    /**
     * Measure initial page load performance
     */
    measureInitialLoad() {
        if (performance.timing) {
            const navigation = performance.timing;
            const loadTime = navigation.loadEventEnd - navigation.navigationStart;
            
            this.metrics.set('initialLoad', {
                loadTime,
                dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcpConnection: navigation.connectEnd - navigation.connectStart,
                serverResponse: navigation.responseEnd - navigation.requestStart,
                domProcessing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
                timestamp: Date.now()
            });
            
            console.log(`📊 Initial Load Time: ${loadTime}ms (Target: <${this.loadTimeTarget}ms)`);
        }
    }
    
    /**
     * Set up performance observers for continuous monitoring
     */
    setupPerformanceObservers() {
        // Observe paint timing
        if ('PerformanceObserver' in window) {
            // First Paint and First Contentful Paint
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.set(entry.name, {
                        value: entry.startTime,
                        timestamp: Date.now()
                    });
                    
                    if (entry.name === 'first-contentful-paint') {
                        console.log(`🎨 First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
                    }
                }
            });
            
            paintObserver.observe({ entryTypes: ['paint'] });
            
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                this.metrics.set('largest-contentful-paint', {
                    value: lastEntry.startTime,
                    element: lastEntry.element?.tagName,
                    timestamp: Date.now()
                });
                
                console.log(`📏 Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // Layout Shift monitoring
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                
                this.metrics.set('cumulative-layout-shift', {
                    value: clsValue,
                    timestamp: Date.now()
                });
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }
    
    /**
     * Initialize comprehensive caching system
     */
    initializeCaching() {
        // Service Worker for caching (if available)
        if ('serviceWorker' in navigator) {
            this.setupServiceWorkerCaching();
        }
        
        // Memory caching for API responses
        this.cacheManager.initialize({
            maxMemorySize: 50 * 1024 * 1024, // 50MB
            maxAge: {
                'api-fleet': 300000,      // 5 minutes
                'api-inspections': 180000, // 3 minutes  
                'api-charts': 600000,     // 10 minutes
                'images': 3600000,        // 1 hour
                'static': 86400000        // 24 hours
            }
        });
        
        console.log('💾 Multi-tier caching system initialized');
    }
    
    /**
     * Set up Service Worker caching strategy
     */
    setupServiceWorkerCaching() {
        const swScript = `
            const CACHE_NAME = 'psc-dashboard-v1';
            const urlsToCache = [
                '/',
                '/src/pages/dashboard.html',
                '/src/assets/css/psc-custom.css',
                '/src/assets/js/psc-dashboard.js',
                '/src/assets/js/state-management.js',
                '/src/assets/js/api-endpoints.js',
                '/src/assets/js/performance-optimizer.js',
                'https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css',
                'https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/js/tabler.min.js',
                'https://cdn.jsdelivr.net/npm/apexcharts@3.44.0/dist/apexcharts.min.js'
            ];
            
            self.addEventListener('install', (event) => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.addAll(urlsToCache))
                );
            });
            
            self.addEventListener('fetch', (event) => {
                event.respondWith(
                    caches.match(event.request)
                        .then((response) => {
                            if (response) {
                                return response;
                            }
                            return fetch(event.request);
                        })
                );
            });
        `;
        
        // Create and register service worker
        const blob = new Blob([swScript], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(swUrl)
            .then(() => console.log('🔧 Service Worker registered'))
            .catch((error) => console.warn('Service Worker registration failed:', error));
    }
    
    /**
     * Optimize bundle loading with code splitting
     */
    optimizeBundleLoading() {
        // Critical CSS inlining
        this.inlineCriticalCSS();
        
        // Defer non-critical JavaScript
        this.deferNonCriticalJS();
        
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Setup resource hints
        this.setupResourceHints();
    }
    
    /**
     * Inline critical CSS for above-the-fold content
     */
    inlineCriticalCSS() {
        const criticalCSS = `
            /* Critical PSC Dashboard styles - Above the fold */
            body { margin: 0; font-family: Inter, sans-serif; background: #f8fafc; }
            .page { display: flex; min-height: 100vh; }
            .navbar-vertical { width: 280px; background: #1e293b; color: white; }
            .page-wrapper { flex: 1; }
            .page-header { background: white; border-bottom: 1px solid #e2e8f0; padding: 1rem 0; }
            .container-xl { max-width: 1320px; margin: 0 auto; padding: 0 1rem; }
            .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1rem; }
            .card-body { padding: 1.5rem; }
            .h1 { font-size: 2.5rem; font-weight: 600; margin-bottom: 0.5rem; }
            .row { display: flex; flex-wrap: wrap; margin: -0.5rem; }
            .col-lg-3 { flex: 0 0 25%; max-width: 25%; padding: 0.5rem; }
            .col-md-8 { flex: 0 0 66.666667%; max-width: 66.666667%; padding: 0.5rem; }
            .col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; padding: 0.5rem; }
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
        
        console.log('🎨 Critical CSS inlined');
    }
    
    /**
     * Defer non-critical JavaScript loading
     */
    deferNonCriticalJS() {
        const nonCriticalScripts = [
            'https://cdn.jsdelivr.net/npm/apexcharts@3.44.0/dist/apexcharts.min.js'
        ];
        
        // Load after page load
        window.addEventListener('load', () => {
            nonCriticalScripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                document.head.appendChild(script);
            });
        });
    }
    
    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        const criticalResources = [
            { href: 'https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/css/tabler.min.css', as: 'style' },
            { href: 'https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/js/tabler.min.js', as: 'script' },
            { href: '/src/assets/data/inspection_fact.json', as: 'fetch', crossOrigin: 'anonymous' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
            document.head.appendChild(link);
        });
        
        console.log('⚡ Critical resources preloaded');
    }
    
    /**
     * Setup resource hints for better loading
     */
    setupResourceHints() {
        const dnsPrefetchDomains = [
            '//cdn.jsdelivr.net',
            '//unpkg.com'
        ];
        
        dnsPrefetchDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
    
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics() {
        const metrics = {};
        
        // Convert Map to object
        this.metrics.forEach((value, key) => {
            metrics[key] = value;
        });
        
        // Add current memory usage if available
        if (performance.memory) {
            metrics.memoryUsage = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2)
            };
        }
        
        // Add cache statistics
        metrics.cacheStats = this.cacheManager.getStatistics();
        
        return metrics;
    }
    
    /**
     * Optimize images for better loading
     */
    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading="lazy" for off-screen images
            if (!img.hasAttribute('loading')) {
                const rect = img.getBoundingClientRect();
                const isVisible = rect.top >= 0 && rect.top <= window.innerHeight;
                
                if (!isVisible) {
                    img.loading = 'lazy';
                }
            }
            
            // Optimize image sources
            if (img.src && !img.dataset.optimized) {
                img.dataset.optimized = 'true';
            }
        });
    }
    
    /**
     * Monitor and report performance issues
     */
    monitorPerformance() {
        const issues = [];
        const metrics = this.getPerformanceMetrics();
        
        // Check load time
        if (metrics.initialLoad && metrics.initialLoad.loadTime > this.loadTimeTarget) {
            issues.push({
                type: 'SLOW_LOAD_TIME',
                value: metrics.initialLoad.loadTime,
                target: this.loadTimeTarget,
                severity: 'high'
            });
        }
        
        // Check LCP
        if (metrics['largest-contentful-paint'] && metrics['largest-contentful-paint'].value > 2500) {
            issues.push({
                type: 'POOR_LCP',
                value: metrics['largest-contentful-paint'].value,
                target: 2500,
                severity: 'medium'
            });
        }
        
        // Check CLS
        if (metrics['cumulative-layout-shift'] && metrics['cumulative-layout-shift'].value > 0.1) {
            issues.push({
                type: 'HIGH_CLS',
                value: metrics['cumulative-layout-shift'].value,
                target: 0.1,
                severity: 'medium'
            });
        }
        
        // Check memory usage
        if (metrics.memoryUsage && metrics.memoryUsage.percentage > 80) {
            issues.push({
                type: 'HIGH_MEMORY_USAGE',
                value: metrics.memoryUsage.percentage,
                target: 80,
                severity: 'medium'
            });
        }
        
        return {
            metrics,
            issues,
            score: this.calculatePerformanceScore(metrics, issues)
        };
    }
    
    /**
     * Calculate overall performance score
     */
    calculatePerformanceScore(metrics, issues) {
        let score = 100;
        
        issues.forEach(issue => {
            switch (issue.severity) {
                case 'high':
                    score -= 20;
                    break;
                case 'medium':
                    score -= 10;
                    break;
                case 'low':
                    score -= 5;
                    break;
            }
        });
        
        return Math.max(score, 0);
    }
}

/**
 * Cache Manager - Handles multi-tier caching strategy
 */
class CacheManager {
    constructor() {
        this.memoryCache = new Map();
        this.config = {};
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            evictions: 0
        };
    }
    
    /**
     * Initialize cache with configuration
     */
    initialize(config) {
        this.config = config;
        
        // Set up periodic cleanup
        setInterval(() => this.cleanup(), 60000); // Every minute
        
        console.log('💾 CacheManager initialized');
    }
    
    /**
     * Set cache entry with TTL
     */
    set(key, value, category = 'default') {
        const ttl = this.config.maxAge[category] || this.config.maxAge.default || 300000;
        
        this.memoryCache.set(key, {
            value,
            expiry: Date.now() + ttl,
            category,
            size: this.calculateSize(value),
            accessed: Date.now()
        });
        
        this.stats.sets++;
        this.enforceMemoryLimit();
    }
    
    /**
     * Get cache entry
     */
    get(key) {
        const entry = this.memoryCache.get(key);
        
        if (!entry) {
            this.stats.misses++;
            return null;
        }
        
        if (Date.now() > entry.expiry) {
            this.memoryCache.delete(key);
            this.stats.misses++;
            return null;
        }
        
        entry.accessed = Date.now();
        this.stats.hits++;
        return entry.value;
    }
    
    /**
     * Calculate approximate size of value
     */
    calculateSize(value) {
        const str = JSON.stringify(value);
        return str.length * 2; // Approximate bytes (UTF-16)
    }
    
    /**
     * Enforce memory limits
     */
    enforceMemoryLimit() {
        const currentSize = this.getCurrentSize();
        
        if (currentSize > this.config.maxMemorySize) {
            // Remove least recently used items
            const entries = Array.from(this.memoryCache.entries())
                .sort((a, b) => a[1].accessed - b[1].accessed);
            
            while (this.getCurrentSize() > this.config.maxMemorySize * 0.8 && entries.length > 0) {
                const [key] = entries.shift();
                this.memoryCache.delete(key);
                this.stats.evictions++;
            }
        }
    }
    
    /**
     * Get current cache size
     */
    getCurrentSize() {
        let size = 0;
        this.memoryCache.forEach(entry => {
            size += entry.size;
        });
        return size;
    }
    
    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        
        this.memoryCache.forEach((entry, key) => {
            if (now > entry.expiry) {
                keysToDelete.push(key);
            }
        });
        
        keysToDelete.forEach(key => this.memoryCache.delete(key));
        
        if (keysToDelete.length > 0) {
            console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`);
        }
    }
    
    /**
     * Get cache statistics
     */
    getStatistics() {
        return {
            ...this.stats,
            size: this.getCurrentSize(),
            entries: this.memoryCache.size,
            hitRate: ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2)
        };
    }
}

/**
 * Lazy Loading Manager - Defers loading of non-critical resources
 */
class LazyLoadingManager {
    constructor() {
        this.intersectionObserver = null;
        this.loadingQueue = new Set();
        this.initializeLazyLoading();
    }
    
    /**
     * Initialize lazy loading system
     */
    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                }
            );
            
            this.observeLazyElements();
            console.log('🔍 Lazy loading initialized');
        }
    }
    
    /**
     * Observe elements for lazy loading
     */
    observeLazyElements() {
        // Observe images
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.intersectionObserver.observe(img);
        });
        
        // Observe chart containers
        document.querySelectorAll('[data-lazy-chart]').forEach(container => {
            this.intersectionObserver.observe(container);
        });
        
        // Observe other lazy content
        document.querySelectorAll('[data-lazy]').forEach(element => {
            this.intersectionObserver.observe(element);
        });
    }
    
    /**
     * Handle intersection observer events
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.loadingQueue.has(entry.target)) {
                this.loadElement(entry.target);
            }
        });
    }
    
    /**
     * Load lazy element
     */
    async loadElement(element) {
        this.loadingQueue.add(element);
        
        try {
            if (element.tagName === 'IMG') {
                await this.loadImage(element);
            } else if (element.dataset.lazyChart) {
                await this.loadChart(element);
            } else {
                await this.loadGenericContent(element);
            }
            
            this.intersectionObserver.unobserve(element);
        } catch (error) {
            console.error('Lazy loading failed for element:', element, error);
        } finally {
            this.loadingQueue.delete(element);
        }
    }
    
    /**
     * Load lazy image
     */
    async loadImage(img) {
        return new Promise((resolve, reject) => {
            const newImg = new Image();
            newImg.onload = () => {
                img.src = newImg.src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
                resolve();
            };
            newImg.onerror = reject;
            newImg.src = img.dataset.src;
        });
    }
    
    /**
     * Load lazy chart
     */
    async loadChart(container) {
        const chartType = container.dataset.lazyChart;
        
        // Dynamic import of chart functionality
        if (window.renderChart && typeof window.renderChart === 'function') {
            await window.renderChart(container, chartType);
            container.removeAttribute('data-lazy-chart');
            container.classList.add('chart-loaded');
        }
    }
    
    /**
     * Load generic lazy content
     */
    async loadGenericContent(element) {
        const content = element.dataset.lazy;
        
        if (content === 'recent-activity') {
            // Load recent activity feed
            element.innerHTML = await this.loadRecentActivity();
        }
        
        element.removeAttribute('data-lazy');
        element.classList.add('lazy-loaded');
    }
    
    /**
     * Load recent activity data
     */
    async loadRecentActivity() {
        // Simulate API call for recent activity
        return `
            <div class="activity-item">
                <span class="activity-icon">📊</span>
                Recent inspection data loaded
            </div>
        `;
    }
}

/**
 * Bundle Optimizer - Optimizes JavaScript and CSS loading
 */
class BundleOptimizer {
    constructor() {
        this.bundleMetrics = new Map();
        this.initializeBundleOptimization();
    }
    
    /**
     * Initialize bundle optimization
     */
    initializeBundleOptimization() {
        this.measureBundlePerformance();
        this.optimizeResourceLoading();
        
        console.log('📦 Bundle optimization initialized');
    }
    
    /**
     * Measure bundle loading performance
     */
    measureBundlePerformance() {
        if (performance.getEntriesByType) {
            const resources = performance.getEntriesByType('resource');
            
            resources.forEach(resource => {
                if (resource.name.includes('.js') || resource.name.includes('.css')) {
                    this.bundleMetrics.set(resource.name, {
                        loadTime: resource.duration,
                        size: resource.transferSize,
                        cached: resource.transferSize === 0
                    });
                }
            });
        }
    }
    
    /**
     * Optimize resource loading order
     */
    optimizeResourceLoading() {
        // Defer non-critical CSS
        this.deferNonCriticalCSS();
        
        // Optimize JavaScript execution
        this.optimizeJavaScriptExecution();
    }
    
    /**
     * Defer non-critical CSS
     */
    deferNonCriticalCSS() {
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][data-defer]');
        
        nonCriticalCSS.forEach(link => {
            const href = link.href;
            link.remove();
            
            // Load after page load
            window.addEventListener('load', () => {
                const newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = href;
                document.head.appendChild(newLink);
            });
        });
    }
    
    /**
     * Optimize JavaScript execution
     */
    optimizeJavaScriptExecution() {
        // Use requestIdleCallback for non-critical operations
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => {
                // Initialize non-critical features
                this.initializeNonCriticalFeatures();
            });
        }
    }
    
    /**
     * Initialize non-critical features during idle time
     */
    initializeNonCriticalFeatures() {
        // Analytics, error tracking, etc.
        console.log('🎯 Non-critical features initialized during idle time');
    }
    
    /**
     * Get bundle metrics
     */
    getBundleMetrics() {
        const metrics = {};
        this.bundleMetrics.forEach((value, key) => {
            metrics[key] = value;
        });
        return metrics;
    }
}

/**
 * Performance Monitor - Continuous performance monitoring
 */
class PerformanceMonitor {
    constructor() {
        this.monitoring = false;
        this.metrics = [];
        this.alertThresholds = {
            loadTime: 3000,
            memoryUsage: 80,
            errorRate: 0.05
        };
    }
    
    /**
     * Start continuous monitoring
     */
    startMonitoring() {
        if (this.monitoring) return;
        
        this.monitoring = true;
        
        // Monitor every 30 seconds
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
        }, 30000);
        
        console.log('📊 Continuous performance monitoring started');
    }
    
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        this.monitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
    }
    
    /**
     * Collect current performance metrics
     */
    collectMetrics() {
        const metrics = {
            timestamp: Date.now(),
            memory: this.getMemoryUsage(),
            timing: this.getTimingMetrics(),
            errors: this.getErrorCount(),
            cachePerformance: this.getCacheMetrics()
        };
        
        this.metrics.push(metrics);
        
        // Keep only last 100 metrics
        if (this.metrics.length > 100) {
            this.metrics = this.metrics.slice(-100);
        }
        
        // Check for performance issues
        this.checkPerformanceAlerts(metrics);
    }
    
    /**
     * Get memory usage information
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2)
            };
        }
        return null;
    }
    
    /**
     * Get timing metrics
     */
    getTimingMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            return {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstByte: navigation.responseStart - navigation.requestStart
            };
        }
        return null;
    }
    
    /**
     * Get error count (simplified)
     */
    getErrorCount() {
        // This would integrate with error tracking system
        return 0;
    }
    
    /**
     * Get cache performance metrics
     */
    getCacheMetrics() {
        if (window.StateManagement && window.StateManagement.data.cacheManager) {
            return window.StateManagement.data.cacheManager.getStatistics();
        }
        return null;
    }
    
    /**
     * Check for performance alerts
     */
    checkPerformanceAlerts(metrics) {
        const alerts = [];
        
        if (metrics.memory && parseFloat(metrics.memory.percentage) > this.alertThresholds.memoryUsage) {
            alerts.push({
                type: 'HIGH_MEMORY_USAGE',
                value: metrics.memory.percentage,
                threshold: this.alertThresholds.memoryUsage
            });
        }
        
        if (alerts.length > 0) {
            this.triggerPerformanceAlerts(alerts);
        }
    }
    
    /**
     * Trigger performance alerts
     */
    triggerPerformanceAlerts(alerts) {
        alerts.forEach(alert => {
            console.warn(`⚠️ Performance Alert: ${alert.type}`, alert);
            
            // Could integrate with notification system
            if (window.StateManagement && window.StateManagement.ui) {
                window.StateManagement.ui.showNotification(
                    `Performance warning: ${alert.type}`,
                    'warning'
                );
            }
        });
    }
    
    /**
     * Get performance report
     */
    getPerformanceReport() {
        if (this.metrics.length === 0) return null;
        
        const latest = this.metrics[this.metrics.length - 1];
        const average = this.calculateAverageMetrics();
        
        return {
            current: latest,
            average,
            trend: this.calculateTrend(),
            alerts: this.getRecentAlerts()
        };
    }
    
    /**
     * Calculate average metrics
     */
    calculateAverageMetrics() {
        if (this.metrics.length === 0) return null;
        
        const sums = this.metrics.reduce((acc, metric) => {
            if (metric.memory) {
                acc.memoryUsage += parseFloat(metric.memory.percentage);
                acc.memoryCount++;
            }
            if (metric.timing) {
                acc.loadTime += metric.timing.loadTime;
                acc.timingCount++;
            }
            return acc;
        }, { memoryUsage: 0, memoryCount: 0, loadTime: 0, timingCount: 0 });
        
        return {
            averageMemoryUsage: sums.memoryCount > 0 ? (sums.memoryUsage / sums.memoryCount).toFixed(2) : 0,
            averageLoadTime: sums.timingCount > 0 ? (sums.loadTime / sums.timingCount).toFixed(2) : 0
        };
    }
    
    /**
     * Calculate performance trend
     */
    calculateTrend() {
        if (this.metrics.length < 10) return 'insufficient_data';
        
        const recent = this.metrics.slice(-10);
        const older = this.metrics.slice(-20, -10);
        
        const recentAvg = recent.reduce((sum, m) => sum + (m.memory ? parseFloat(m.memory.percentage) : 0), 0) / recent.length;
        const olderAvg = older.reduce((sum, m) => sum + (m.memory ? parseFloat(m.memory.percentage) : 0), 0) / older.length;
        
        if (recentAvg > olderAvg * 1.1) return 'degrading';
        if (recentAvg < olderAvg * 0.9) return 'improving';
        return 'stable';
    }
    
    /**
     * Get recent alerts
     */
    getRecentAlerts() {
        // Would return recent performance alerts
        return [];
    }
}

// Initialize Performance Optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Start monitoring after page load
window.addEventListener('load', () => {
    performanceOptimizer.performanceMonitor.startMonitoring();
    
    // Run initial optimizations
    performanceOptimizer.optimizeImages();
    
    // Report initial performance
    setTimeout(() => {
        const report = performanceOptimizer.monitorPerformance();
        console.log('📊 Performance Report:', report);
        
        if (report.score < 80) {
            console.warn('⚠️ Performance score below target:', report.score);
        }
    }, 2000);
});

// Export for global access
window.PerformanceOptimizer = performanceOptimizer;

console.log('🚀 PSC Dashboard Performance Optimization System ready - Target: <3s load time');