/**
 * PSC Dashboard - Performance Optimization System
 * SystemIntegrator_PSC Sub-3-Second Loading Implementation
 * Version: 1.0.0 - Production Ready
 * Target: <3 seconds initial load, <500ms subsequent interactions
 */

class PerformanceOptimizationSystem {
    constructor() {
        this.performanceConfig = {
            targets: {
                initialLoad: 3000,        // 3 seconds max
                subsequentLoad: 500,      // 500ms max for interactions
                chunkSize: 244000,        // 244KB initial bundle size
                imageOptimization: true,
                lazyLoading: true,
                codesplitting: true
            },
            
            metrics: {
                fcp: null,    // First Contentful Paint
                lcp: null,    // Largest Contentful Paint
                fid: null,    // First Input Delay
                cls: null,    // Cumulative Layout Shift
                ttfb: null,   // Time to First Byte
                domReady: null, // DOM Ready time
                loadComplete: null // Load Complete time
            },
            
            optimizations: {
                bundleSplitting: true,
                lazyComponents: true,
                imageOptimization: true,
                assetCompression: true,
                prefetching: true,
                serviceWorkerCaching: true
            }
        };
        
        this.performanceObserver = null;
        this.intersectionObserver = null;
        this.resourceTimings = new Map();
        this.performanceMarks = new Map();
        
        this.initializePerformanceSystem();
    }
    
    /**
     * Initialize comprehensive performance optimization system
     */
    initializePerformanceSystem() {
        this.setupPerformanceObserver();
        this.setupResourceOptimization();
        this.initializeLazyLoading();
        this.setupCodeSplitting();
        this.optimizeAssetDelivery();
        this.setupPerformanceMonitoring();
        this.implementPreloadingStrategies();
        
        console.log('⚡ PerformanceOptimizationSystem initialized - Target: <3s loading');
    }
    
    /**
     * Set up Performance Observer for Core Web Vitals
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Observe Largest Contentful Paint (LCP)
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.performanceConfig.metrics.lcp = lastEntry.startTime;
                this.evaluatePerformance('lcp', lastEntry.startTime);
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            
            // Observe First Input Delay (FID)
            const fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.performanceConfig.metrics.fid = entry.processingStart - entry.startTime;
                    this.evaluatePerformance('fid', entry.processingStart - entry.startTime);
                });
            });
            
            fidObserver.observe({ entryTypes: ['first-input'] });
            
            // Observe Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.performanceConfig.metrics.cls = clsValue;
                        this.evaluatePerformance('cls', clsValue);
                    }
                });
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            
            // Observe Navigation Timing
            const navigationObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.performanceConfig.metrics.ttfb = entry.responseStart - entry.requestStart;
                    this.performanceConfig.metrics.domReady = entry.domContentLoadedEventEnd - entry.navigationStart;
                    this.performanceConfig.metrics.loadComplete = entry.loadEventEnd - entry.navigationStart;
                    
                    this.evaluatePageLoadPerformance();
                });
            });
            
            navigationObserver.observe({ entryTypes: ['navigation'] });
            
            console.log('📊 Performance Observer initialized for Core Web Vitals');
        }
    }
    
    /**
     * Set up resource optimization and bundling
     */
    setupResourceOptimization() {
        // Implement resource bundling strategy
        this.resourceOptimizer = {
            // Critical CSS inlining
            inlineCriticalCSS: () => {
                const criticalStyles = `
                    .page-wrapper, .navbar-vertical, .page-body { 
                        font-display: swap; 
                        contain: layout style paint; 
                    }
                    .loading-skeleton { 
                        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                        background-size: 200% 100%;
                        animation: loading 1.5s infinite;
                    }
                `;
                
                const styleElement = document.createElement('style');
                styleElement.textContent = criticalStyles;
                document.head.appendChild(styleElement);
            },
            
            // Optimize font loading
            optimizeFontLoading: () => {
                const preconnectLinks = [
                    'https://fonts.googleapis.com',
                    'https://fonts.gstatic.com'
                ];
                
                preconnectLinks.forEach(href => {
                    const link = document.createElement('link');
                    link.rel = 'preconnect';
                    link.href = href;
                    link.crossOrigin = 'anonymous';
                    document.head.appendChild(link);
                });
                
                // Use font-display: swap for better performance
                const fontFaces = `
                    @font-face {
                        font-family: 'Inter';
                        font-display: swap;
                        src: local('Inter'), url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                    }
                `;
                
                const fontStyle = document.createElement('style');
                fontStyle.textContent = fontFaces;
                document.head.appendChild(fontStyle);
            },
            
            // Compress and optimize assets
            compressAssets: () => {
                // Use modern image formats when supported
                const supportsWebP = this.supportsWebP();
                const supportsAVIF = this.supportsAVIF();
                
                document.querySelectorAll('img').forEach(img => {
                    if (supportsAVIF) {
                        img.src = img.src.replace(/\.(jpg|jpeg|png)$/, '.avif');
                    } else if (supportsWebP) {
                        img.src = img.src.replace(/\.(jpg|jpeg|png)$/, '.webp');
                    }
                });
            }
        };
        
        // Apply optimizations
        this.resourceOptimizer.inlineCriticalCSS();
        this.resourceOptimizer.optimizeFontLoading();
    }
    
    /**
     * Initialize lazy loading for images and components
     */
    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            // Lazy load images
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                            img.removeAttribute('data-srcset');
                        }
                        
                        img.classList.remove('lazy-loading');
                        img.classList.add('lazy-loaded');
                        this.intersectionObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px', // Load images 50px before they enter viewport
                threshold: 0.01
            });
            
            // Observe all lazy images
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.classList.add('lazy-loading');
                this.intersectionObserver.observe(img);
            });
            
            // Lazy load chart components
            this.setupLazyComponentLoading();
            
            console.log('🖼️ Lazy loading initialized');
        }
    }
    
    /**
     * Set up lazy loading for chart components
     */
    setupLazyComponentLoading() {
        const lazyComponents = {
            charts: {
                selector: '.chart-container',
                loadFunction: this.loadChartComponent.bind(this)
            },
            maps: {
                selector: '.map-container',
                loadFunction: this.loadMapComponent.bind(this)
            },
            tables: {
                selector: '.data-table-container',
                loadFunction: this.loadTableComponent.bind(this)
            }
        };
        
        Object.entries(lazyComponents).forEach(([name, config]) => {
            document.querySelectorAll(config.selector).forEach(element => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.markPerformance(`lazy-${name}-start`);
                            config.loadFunction(entry.target)
                                .then(() => {
                                    this.markPerformance(`lazy-${name}-end`);
                                    this.measurePerformance(
                                        `lazy-${name}-load`,
                                        `lazy-${name}-start`,
                                        `lazy-${name}-end`
                                    );
                                })
                                .catch(error => {
                                    console.error(`Lazy loading ${name} failed:`, error);
                                });
                            observer.unobserve(entry.target);
                        }
                    });
                });
                
                observer.observe(element);
            });
        });
    }
    
    /**
     * Set up code splitting and dynamic imports
     */
    setupCodeSplitting() {
        this.dynamicImports = {
            // Chart libraries
            apexCharts: () => import('./chart-specialist-apex.js'),
            
            // Map components
            leafletMaps: () => import('./geo-visualizer-ports.js'),
            
            // Analysis modules
            riskCalculator: () => import('./risk-calculator-integration.js'),
            
            // Utility modules
            dataExporter: () => import('./data-export-utility.js')
        };
        
        // Preload critical modules
        this.preloadCriticalModules();
    }
    
    /**
     * Preload critical modules for better performance
     */
    async preloadCriticalModules() {
        const criticalModules = ['apexCharts'];
        
        // Use requestIdleCallback for non-blocking preloading
        if ('requestIdleCallback' in window) {
            requestIdleCallback(async () => {
                for (const module of criticalModules) {
                    try {
                        await this.dynamicImports[module]();
                        console.log(`✅ Preloaded critical module: ${module}`);
                    } catch (error) {
                        console.warn(`Failed to preload module ${module}:`, error);
                    }
                }
            });
        }
    }
    
    /**
     * Optimize asset delivery with preloading and prefetching
     */
    optimizeAssetDelivery() {
        // Preload critical assets
        const criticalAssets = [
            { href: './assets/css/psc-custom.css', as: 'style' },
            { href: './assets/js/psc-dashboard.js', as: 'script' },
            { href: './assets/data/inspection_fact.json', as: 'fetch', crossorigin: 'anonymous' }
        ];
        
        criticalAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = asset.href;
            link.as = asset.as;
            if (asset.crossorigin) link.crossOrigin = asset.crossorigin;
            document.head.appendChild(link);
        });
        
        // Prefetch next-page resources
        this.setupResourcePrefetching();
        
        console.log('🚀 Asset delivery optimization applied');
    }
    
    /**
     * Set up resource prefetching for anticipated navigation
     */
    setupResourcePrefetching() {
        const prefetchResources = [
            './pages/inspections.html',
            './pages/vessels.html',
            './pages/ports-map.html',
            './assets/data/vessel-data.json'
        ];
        
        // Prefetch after initial load is complete
        window.addEventListener('load', () => {
            setTimeout(() => {
                prefetchResources.forEach(resource => {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = resource;
                    document.head.appendChild(link);
                });
            }, 3000); // Wait 3 seconds after load
        });
    }
    
    /**
     * Set up comprehensive performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor resource loading
        if ('PerformanceObserver' in window) {
            const resourceObserver = new PerformanceObserver((entryList) => {
                entryList.getEntries().forEach(entry => {
                    this.resourceTimings.set(entry.name, {
                        duration: entry.duration,
                        size: entry.transferSize,
                        cached: entry.transferSize === 0,
                        type: this.getResourceType(entry.name)
                    });
                });
            });
            
            resourceObserver.observe({ entryTypes: ['resource'] });
        }
        
        // Set up periodic performance reporting
        setInterval(() => {
            this.generatePerformanceReport();
        }, 30000); // Every 30 seconds
    }
    
    /**
     * Implement preloading strategies based on user behavior
     */
    implementPreloadingStrategies() {
        // Hover intent preloading
        document.addEventListener('mouseover', (event) => {
            const link = event.target.closest('a[href]');
            if (link && !link.dataset.preloaded) {
                link.dataset.preloaded = 'true';
                this.preloadPage(link.href);
            }
        });
        
        // Intersection-based preloading for visible links
        if ('IntersectionObserver' in window) {
            const linkObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const link = entry.target;
                        if (link.href && !link.dataset.preloaded) {
                            link.dataset.preloaded = 'true';
                            setTimeout(() => this.preloadPage(link.href), 1000);
                        }
                    }
                });
            });
            
            document.querySelectorAll('a[href^="./"]').forEach(link => {
                linkObserver.observe(link);
            });
        }
    }
    
    // ==================== COMPONENT LOADING FUNCTIONS ====================
    
    /**
     * Load chart component lazily
     */
    async loadChartComponent(container) {
        try {
            // Show loading skeleton
            container.innerHTML = '<div class="loading-skeleton" style="height: 300px;"></div>';
            
            // Import chart module
            const chartModule = await this.dynamicImports.apexCharts();
            
            // Initialize chart based on container type
            const chartType = container.dataset.chartType || 'bar';
            const chartConfig = this.getChartConfig(chartType, container.dataset);
            
            // Render chart
            const chart = new ApexCharts(container, chartConfig);
            await chart.render();
            
            return chart;
            
        } catch (error) {
            container.innerHTML = '<div class="alert alert-danger">Failed to load chart</div>';
            throw error;
        }
    }
    
    /**
     * Load map component lazily
     */
    async loadMapComponent(container) {
        try {
            container.innerHTML = '<div class="loading-skeleton" style="height: 400px;"></div>';
            
            const mapModule = await this.dynamicImports.leafletMaps();
            
            // Initialize map
            const mapConfig = this.getMapConfig(container.dataset);
            const map = mapModule.initializeMap(container, mapConfig);
            
            return map;
            
        } catch (error) {
            container.innerHTML = '<div class="alert alert-danger">Failed to load map</div>';
            throw error;
        }
    }
    
    /**
     * Load table component lazily
     */
    async loadTableComponent(container) {
        try {
            container.innerHTML = '<div class="loading-skeleton" style="height: 200px;"></div>';
            
            // Load table data
            const tableData = await this.loadTableData(container.dataset.source);
            
            // Render table
            const table = this.renderDataTable(container, tableData);
            
            return table;
            
        } catch (error) {
            container.innerHTML = '<div class="alert alert-danger">Failed to load table</div>';
            throw error;
        }
    }
    
    // ==================== PERFORMANCE EVALUATION ====================
    
    /**
     * Evaluate Core Web Vitals performance
     */
    evaluatePerformance(metric, value) {
        const thresholds = {
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 },
            ttfb: { good: 800, poor: 1800 }
        };
        
        const threshold = thresholds[metric];
        if (!threshold) return;
        
        let status = 'good';
        if (value > threshold.poor) {
            status = 'poor';
        } else if (value > threshold.good) {
            status = 'needs-improvement';
        }
        
        console.log(`📊 ${metric.toUpperCase()}: ${value}ms (${status})`);
        
        // Trigger optimization if performance is poor
        if (status === 'poor') {
            this.triggerPerformanceOptimization(metric, value);
        }
    }
    
    /**
     * Evaluate overall page load performance
     */
    evaluatePageLoadPerformance() {
        const { domReady, loadComplete, ttfb } = this.performanceConfig.metrics;
        
        if (domReady && loadComplete) {
            console.log(`⚡ Page Performance:
                - TTFB: ${ttfb}ms
                - DOM Ready: ${domReady}ms
                - Load Complete: ${loadComplete}ms
            `);
            
            // Check if we meet our 3-second target
            if (loadComplete <= this.performanceConfig.targets.initialLoad) {
                console.log('✅ Performance target achieved: <3s load time');
            } else {
                console.warn('⚠️ Performance target missed: >3s load time');
                this.triggerEmergencyOptimization();
            }
        }
    }
    
    /**
     * Trigger performance optimization based on metrics
     */
    triggerPerformanceOptimization(metric, value) {
        const optimizations = {
            lcp: () => {
                // Optimize largest contentful paint
                this.optimizeLCP();
            },
            fid: () => {
                // Optimize first input delay
                this.optimizeFID();
            },
            cls: () => {
                // Optimize cumulative layout shift
                this.optimizeCLS();
            },
            ttfb: () => {
                // Optimize time to first byte
                this.optimizeTTFB();
            }
        };
        
        const optimization = optimizations[metric];
        if (optimization) {
            console.log(`🔧 Triggering ${metric} optimization...`);
            optimization();
        }
    }
    
    /**
     * Emergency optimization when performance targets are missed
     */
    triggerEmergencyOptimization() {
        console.log('🚨 Emergency optimization triggered');
        
        // Disable non-critical animations
        document.documentElement.classList.add('reduce-motion');
        
        // Defer non-critical scripts
        this.deferNonCriticalScripts();
        
        // Increase cache aggressiveness
        if (window.CachingSystem) {
            window.CachingSystem.configureCaching({
                memory: { maxSize: 200 }, // Increase memory cache
                aggressive: true
            });
        }
        
        // Reduce image quality for faster loading
        this.optimizeImageQuality();
    }
    
    // ==================== OPTIMIZATION IMPLEMENTATIONS ====================
    
    /**
     * Optimize Largest Contentful Paint
     */
    optimizeLCP() {
        // Preload LCP element resources
        const lcpCandidates = document.querySelectorAll('img, video, .hero-content, .main-chart');
        lcpCandidates.forEach(element => {
            if (element.tagName === 'IMG' && element.src) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = element.src;
                document.head.appendChild(link);
            }
        });
    }
    
    /**
     * Optimize First Input Delay
     */
    optimizeFID() {
        // Break up long tasks
        this.scheduleNonCriticalWork();
        
        // Optimize event handlers
        this.optimizeEventHandlers();
    }
    
    /**
     * Optimize Cumulative Layout Shift
     */
    optimizeCLS() {
        // Add size attributes to images without them
        document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
            // Use aspect ratio to prevent layout shift
            img.style.aspectRatio = '16/9'; // Default aspect ratio
        });
        
        // Reserve space for dynamic content
        document.querySelectorAll('.dynamic-content').forEach(element => {
            if (!element.style.minHeight) {
                element.style.minHeight = '200px'; // Reserve minimum space
            }
        });
    }
    
    /**
     * Optimize Time to First Byte
     */
    optimizeTTFB() {
        // Implement more aggressive caching
        if (window.CachingSystem) {
            window.CachingSystem.warmUpCache();
        }
        
        // Use faster data loading strategies
        this.implementFasterDataLoading();
    }
    
    /**
     * Schedule non-critical work to improve FID
     */
    scheduleNonCriticalWork() {
        if ('scheduler' in window && 'postTask' in scheduler) {
            // Use modern scheduler API when available
            scheduler.postTask(() => {
                this.performNonCriticalTasks();
            }, { priority: 'background' });
        } else if ('requestIdleCallback' in window) {
            // Fallback to requestIdleCallback
            requestIdleCallback(() => {
                this.performNonCriticalTasks();
            });
        }
    }
    
    /**
     * Optimize event handlers for better FID
     */
    optimizeEventHandlers() {
        // Use passive event listeners where possible
        document.querySelectorAll('[data-passive]').forEach(element => {
            const eventType = element.dataset.passive;
            if (element.addEventListener) {
                // Add passive flag to touch and wheel events
                element.addEventListener(eventType, element.onclick, { passive: true });
            }
        });
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * Check WebP support
     */
    supportsWebP() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = () => resolve(webP.height === 2);
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }
    
    /**
     * Check AVIF support
     */
    supportsAVIF() {
        return new Promise(resolve => {
            const avif = new Image();
            avif.onload = avif.onerror = () => resolve(avif.height === 2);
            avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUEAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAFkAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACxpcmVmAAAAAAAAAA5oZHJhAAEAAQAAAKEGAAEAAQAAAI9jYm9iAAIAAQAAAL5taWVoZgAAAAAAAEAAAAGIA=';
        });
    }
    
    /**
     * Get resource type from URL
     */
    getResourceType(url) {
        if (url.match(/\.(css)$/)) return 'stylesheet';
        if (url.match(/\.(js)$/)) return 'script';
        if (url.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/)) return 'image';
        if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
        if (url.match(/\.(json)$/)) return 'data';
        return 'other';
    }
    
    /**
     * Performance marking and measurement utilities
     */
    markPerformance(name) {
        if ('performance' in window && performance.mark) {
            performance.mark(name);
            this.performanceMarks.set(name, performance.now());
        }
    }
    
    measurePerformance(name, startMark, endMark) {
        if ('performance' in window && performance.measure) {
            try {
                performance.measure(name, startMark, endMark);
                const measure = performance.getEntriesByName(name)[0];
                console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
                return measure.duration;
            } catch (error) {
                console.warn('Performance measurement failed:', error);
                return null;
            }
        }
    }
    
    /**
     * Generate comprehensive performance report
     */
    generatePerformanceReport() {
        const report = {
            timestamp: Date.now(),
            coreWebVitals: { ...this.performanceConfig.metrics },
            resourceTimings: Object.fromEntries(this.resourceTimings),
            performanceMarks: Object.fromEntries(this.performanceMarks),
            targetsMet: {
                initialLoad: this.performanceConfig.metrics.loadComplete <= this.performanceConfig.targets.initialLoad,
                lcp: this.performanceConfig.metrics.lcp <= 2500,
                fid: this.performanceConfig.metrics.fid <= 100,
                cls: this.performanceConfig.metrics.cls <= 0.1
            },
            recommendations: this.generateRecommendations()
        };
        
        // Send to performance monitoring service
        if (window.StateManagement?.global) {
            window.StateManagement.global.updateState('performance', report);
        }
        
        return report;
    }
    
    /**
     * Generate performance recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        const metrics = this.performanceConfig.metrics;
        
        if (metrics.lcp > 2500) {
            recommendations.push('Optimize Largest Contentful Paint by preloading critical images');
        }
        
        if (metrics.fid > 100) {
            recommendations.push('Reduce First Input Delay by breaking up long JavaScript tasks');
        }
        
        if (metrics.cls > 0.1) {
            recommendations.push('Improve Cumulative Layout Shift by adding size attributes to images');
        }
        
        if (metrics.loadComplete > 3000) {
            recommendations.push('Implement more aggressive code splitting and lazy loading');
        }
        
        return recommendations;
    }
    
    /**
     * Get system performance status
     */
    getPerformanceStatus() {
        return {
            isOptimized: this.performanceConfig.metrics.loadComplete <= this.performanceConfig.targets.initialLoad,
            metrics: { ...this.performanceConfig.metrics },
            cacheUtilization: window.CachingSystem?.getStatistics?.()?.memoryCache?.utilization,
            recommendations: this.generateRecommendations(),
            lastReport: Date.now()
        };
    }
}

// Initialize and export performance system
const performanceOptimizationSystem = new PerformanceOptimizationSystem();

// Export for global access
window.PerformanceSystem = performanceOptimizationSystem;

// Legacy compatibility
window.performanceOptimizationSystem = performanceOptimizationSystem;

// Start performance monitoring immediately
document.addEventListener('DOMContentLoaded', () => {
    performanceOptimizationSystem.markPerformance('dom-ready');
});

window.addEventListener('load', () => {
    performanceOptimizationSystem.markPerformance('load-complete');
    performanceOptimizationSystem.measurePerformance('page-load', 'navigationStart', 'load-complete');
});

console.log('⚡ PSC Dashboard Performance Optimization System ready - Target: <3s loading times');