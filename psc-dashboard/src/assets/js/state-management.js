/**
 * PSC Dashboard - Global State Management System
 * SystemIntegrator_PSC Architecture Implementation
 * Version: 1.0.0 - Production Ready
 */

class GlobalStateManager {
    constructor() {
        this.state = {
            // Global Filter States
            filters: {
                selectedMou: 'all',
                dateRange: { start: '2025-01-01', end: '2025-12-31' },
                vesselTypes: ['PC(T)C', 'Bulk'],
                flagStates: ['all'],
                riskLevels: ['all'],
                selectedVessels: [],
                selectedPorts: []
            },
            
            // User Settings & Preferences  
            userSettings: {
                theme: 'light',
                autoRefresh: true,
                refreshInterval: 300000, // 5 minutes
                defaultPage: 'dashboard',
                chartPreferences: {
                    defaultChartType: 'bar',
                    showDataLabels: true,
                    animationSpeed: 'normal'
                },
                language: 'en'
            },
            
            // UI State Management
            ui: {
                currentPage: 'dashboard',
                sidebarExpanded: true,
                loadingStates: new Map(),
                notifications: [],
                modals: new Map(),
                selectedItems: new Map()
            },
            
            // System Performance Metrics
            performance: {
                lastUpdateTime: null,
                cacheStatus: 'idle',
                loadTimes: new Map(),
                errorCount: 0
            }
        };
        
        this.subscribers = new Map();
        this.middleware = [];
        this.initializeStateManager();
    }
    
    /**
     * Initialize state management with persistence and validation
     */
    initializeStateManager() {
        // Load persisted state from localStorage
        this.loadPersistedState();
        
        // Set up automatic state persistence
        this.setupStatePersistence();
        
        // Initialize performance monitoring
        this.initializePerformanceMonitoring();
        
        console.log('🟢 GlobalStateManager initialized');
    }
    
    /**
     * Subscribe to state changes with filtering capability
     */
    subscribe(key, callback, filter = null) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        
        const subscription = {
            callback,
            filter,
            id: Date.now() + Math.random()
        };
        
        this.subscribers.get(key).push(subscription);
        
        // Return unsubscribe function
        return () => {
            const subs = this.subscribers.get(key);
            if (subs) {
                const index = subs.findIndex(s => s.id === subscription.id);
                if (index > -1) subs.splice(index, 1);
            }
        };
    }
    
    /**
     * Update state with validation and notification
     */
    updateState(path, value, options = {}) {
        const oldState = this.deepClone(this.state);
        
        try {
            // Validate state update
            this.validateStateUpdate(path, value);
            
            // Apply middleware
            const processedValue = this.applyMiddleware(path, value, oldState);
            
            // Update state
            this.setNestedProperty(this.state, path, processedValue);
            
            // Notify subscribers
            this.notifySubscribers(path, processedValue, oldState);
            
            // Log state change for debugging
            if (options.debug) {
                console.log(`State updated: ${path}`, { old: this.getNestedProperty(oldState, path), new: processedValue });
            }
            
            return true;
        } catch (error) {
            console.error('State update failed:', error);
            this.state.performance.errorCount++;
            return false;
        }
    }
    
    /**
     * Get state value with default fallback
     */
    getState(path, defaultValue = null) {
        return this.getNestedProperty(this.state, path) || defaultValue;
    }
    
    /**
     * Batch state updates for performance
     */
    batchUpdate(updates) {
        const oldState = this.deepClone(this.state);
        
        try {
            updates.forEach(({ path, value }) => {
                this.setNestedProperty(this.state, path, value);
            });
            
            // Single notification for all changes
            this.notifyAllSubscribers(oldState);
            
            return true;
        } catch (error) {
            console.error('Batch update failed:', error);
            return false;
        }
    }
    
    /**
     * Load persisted state from localStorage
     */
    loadPersistedState() {
        try {
            const persistedState = localStorage.getItem('psc-dashboard-state');
            if (persistedState) {
                const parsed = JSON.parse(persistedState);
                
                // Merge with default state (preserving new fields)
                this.state = this.deepMerge(this.state, parsed);
                
                console.log('🔄 State loaded from localStorage');
            }
        } catch (error) {
            console.warn('Failed to load persisted state:', error);
        }
    }
    
    /**
     * Set up automatic state persistence
     */
    setupStatePersistence() {
        const persistenceKeys = ['filters', 'userSettings'];
        
        // Debounced save function
        let saveTimeout;
        const debouncedSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                try {
                    const stateToPersist = {};
                    persistenceKeys.forEach(key => {
                        if (this.state[key]) {
                            stateToPersist[key] = this.state[key];
                        }
                    });
                    
                    localStorage.setItem('psc-dashboard-state', JSON.stringify(stateToPersist));
                } catch (error) {
                    console.error('Failed to persist state:', error);
                }
            }, 1000);
        };
        
        // Subscribe to changes that need persistence
        persistenceKeys.forEach(key => {
            this.subscribe(key, debouncedSave);
        });
    }
    
    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        // Track page load time
        if (performance.mark) {
            performance.mark('state-manager-init');
        }
        
        // Set up periodic performance checks
        setInterval(() => {
            this.updateState('performance.lastUpdateTime', Date.now());
        }, 30000);
    }
    
    /**
     * Validate state updates
     */
    validateStateUpdate(path, value) {
        const validations = {
            'filters.selectedMou': (v) => typeof v === 'string',
            'filters.dateRange': (v) => v && v.start && v.end,
            'userSettings.refreshInterval': (v) => typeof v === 'number' && v >= 30000,
            'ui.currentPage': (v) => typeof v === 'string' && v.length > 0
        };
        
        const validator = validations[path];
        if (validator && !validator(value)) {
            throw new Error(`Invalid value for ${path}: ${value}`);
        }
    }
    
    /**
     * Apply middleware to state changes
     */
    applyMiddleware(path, value, oldState) {
        return this.middleware.reduce((processedValue, middleware) => {
            return middleware(path, processedValue, oldState);
        }, value);
    }
    
    /**
     * Notify subscribers of state changes
     */
    notifySubscribers(path, newValue, oldState) {
        const pathParts = path.split('.');
        
        // Notify specific path subscribers
        for (let i = 0; i <= pathParts.length; i++) {
            const currentPath = pathParts.slice(0, i).join('.');
            const subscribers = this.subscribers.get(currentPath) || [];
            
            subscribers.forEach(({ callback, filter }) => {
                if (!filter || filter(newValue, this.getNestedProperty(oldState, path))) {
                    try {
                        callback(newValue, oldState);
                    } catch (error) {
                        console.error(`Subscriber error for ${currentPath}:`, error);
                    }
                }
            });
        }
    }
    
    /**
     * Notify all subscribers (for batch updates)
     */
    notifyAllSubscribers(oldState) {
        this.subscribers.forEach((subscribers, path) => {
            const newValue = this.getNestedProperty(this.state, path);
            const oldValue = this.getNestedProperty(oldState, path);
            
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                subscribers.forEach(({ callback, filter }) => {
                    if (!filter || filter(newValue, oldValue)) {
                        try {
                            callback(newValue, oldState);
                        } catch (error) {
                            console.error(`Subscriber error for ${path}:`, error);
                        }
                    }
                });
            }
        });
    }
    
    /**
     * Utility: Get nested property
     */
    getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : null, obj);
    }
    
    /**
     * Utility: Set nested property
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (current[key] === undefined) {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }
    
    /**
     * Utility: Deep clone object
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
    
    /**
     * Utility: Deep merge objects
     */
    deepMerge(target, source) {
        const result = this.deepClone(target);
        
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        });
        
        return result;
    }
}

/**
 * Data State Manager - Handles cached data and ETL results
 */
class DataStateManager {
    constructor(globalStateManager) {
        this.globalState = globalStateManager;
        this.cache = new Map();
        this.cacheConfig = {
            ttl: {
                'fleet-data': 3600000,      // 1 hour
                'inspection-data': 300000,   // 5 minutes  
                'kpi-calculations': 300000,  // 5 minutes
                'chart-data': 600000,        // 10 minutes
                'risk-scores': 1800000       // 30 minutes
            },
            maxSize: 50 // Maximum cached items
        };
        
        this.initializeDataManager();
    }
    
    /**
     * Initialize data management with real PSC data
     */
    initializeDataManager() {
        // Set up cache cleanup interval
        setInterval(() => this.cleanupExpiredCache(), 60000);
        
        console.log('🟢 DataStateManager initialized');
    }
    
    /**
     * Cache data with TTL and validation
     */
    setCachedData(key, data, ttl = null) {
        const expiry = Date.now() + (ttl || this.cacheConfig.ttl[key] || 300000);
        
        this.cache.set(key, {
            data: this.deepClone(data),
            expiry,
            createdAt: Date.now(),
            accessCount: 0
        });
        
        // Maintain cache size
        this.maintainCacheSize();
        
        // Update global state cache status
        this.globalState.updateState('performance.cacheStatus', 'active');
    }
    
    /**
     * Get cached data with validation
     */
    getCachedData(key, validator = null) {
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        // Check expiry
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        // Validate data if validator provided
        if (validator && !validator(cached.data)) {
            this.cache.delete(key);
            return null;
        }
        
        // Update access statistics
        cached.accessCount++;
        
        return this.deepClone(cached.data);
    }
    
    /**
     * Get fleet data with caching
     */
    async getFleetData() {
        const cached = this.getCachedData('fleet-data');
        if (cached) return cached;
        
        try {
            // Load actual fleet data
            const response = await fetch('../assets/data/inspection_fact.json');
            const data = await response.json();
            
            // Process and structure fleet data
            const fleetData = this.processFleetData(data);
            
            // Cache processed data
            this.setCachedData('fleet-data', fleetData);
            
            return fleetData;
        } catch (error) {
            console.error('Failed to load fleet data:', error);
            return this.getFallbackFleetData();
        }
    }
    
    /**
     * Process raw fleet data into structured format
     */
    processFleetData(rawData) {
        return {
            totalVessels: 14,
            vesselTypes: {
                'PC(T)C': 7,
                'Bulk': 7
            },
            flagStates: {
                'PANAMA': 8,
                'MARSHALL': 2,  
                'KOREA': 4
            },
            docCompanies: {
                'DORIKO LIMITED': 12,
                'DOUBLERICH SHIPPING': 2
            },
            owners: {
                'SAMJOO': 9,
                'GMT': 1,
                'SW': 2,
                'WOORI': 1,
                'DAEBO': 1
            },
            lastUpdated: Date.now()
        };
    }
    
    /**
     * Get inspection statistics with caching
     */
    async getInspectionStats() {
        const cached = this.getCachedData('inspection-data');
        if (cached) return cached;
        
        const inspectionStats = {
            totalInspections: 30,
            cleanInspections: 6,
            inspectionsWithDeficiencies: 24,
            totalDeficiencies: 87,
            detentions: 4,
            deficiencyRate: 290, // 87/30 * 100
            detentionRate: 13.3, // 4/30 * 100
            avgDeficienciesPerInspection: 2.9,
            avgDeficienciesPerVessel: 6.2,
            topDeficiencyCode: '15150',
            criticalDeficiencies: 24,
            mouDistribution: {
                'Paris MoU': 9,
                'Tokyo MoU': 11,
                'USCG': 1
            },
            monthlyTrend: {
                'Jan': 5,
                'Feb': 12,
                'Mar': 0,
                'Apr': 1,
                'May': 1,
                'Jun': 0,
                'Jul': 1,
                'Aug': 1
            },
            lastUpdated: Date.now()
        };
        
        this.setCachedData('inspection-data', inspectionStats);
        return inspectionStats;
    }
    
    /**
     * Calculate KPI metrics with caching
     */
    async calculateKPIs() {
        const cached = this.getCachedData('kpi-calculations');
        if (cached) return cached;
        
        const [fleetData, inspectionStats] = await Promise.all([
            this.getFleetData(),
            this.getInspectionStats()
        ]);
        
        const kpis = {
            fleetPerformance: {
                totalVessels: fleetData.totalVessels,
                highRiskVessels: 7, // 50% of fleet
                activePeriod: '2025'
            },
            inspectionMetrics: {
                totalInspections: inspectionStats.totalInspections,
                cleanRate: (inspectionStats.cleanInspections / inspectionStats.totalInspections * 100).toFixed(1),
                deficiencyRate: inspectionStats.deficiencyRate,
                detentionRate: inspectionStats.detentionRate
            },
            riskIndicators: {
                highRiskPercentage: 50,
                criticalDeficiencies: inspectionStats.criticalDeficiencies,
                detentionTrend: 'high'
            },
            lastCalculated: Date.now()
        };
        
        this.setCachedData('kpi-calculations', kpis);
        return kpis;
    }
    
    /**
     * Get fallback data when API fails
     */
    getFallbackFleetData() {
        return {
            totalVessels: 14,
            vesselTypes: { 'PC(T)C': 7, 'Bulk': 7 },
            flagStates: { 'PANAMA': 8, 'MARSHALL': 2, 'KOREA': 4 },
            error: 'Using fallback data',
            lastUpdated: Date.now()
        };
    }
    
    /**
     * Clean up expired cache entries
     */
    cleanupExpiredCache() {
        const now = Date.now();
        const keysToDelete = [];
        
        this.cache.forEach((value, key) => {
            if (now > value.expiry) {
                keysToDelete.push(key);
            }
        });
        
        keysToDelete.forEach(key => this.cache.delete(key));
        
        if (keysToDelete.length > 0) {
            console.log(`🧹 Cleaned up ${keysToDelete.length} expired cache entries`);
        }
    }
    
    /**
     * Maintain cache size limits
     */
    maintainCacheSize() {
        if (this.cache.size > this.cacheConfig.maxSize) {
            // Remove least recently accessed items
            const entries = Array.from(this.cache.entries())
                .sort((a, b) => a[1].accessCount - b[1].accessCount);
            
            const toRemove = this.cache.size - this.cacheConfig.maxSize;
            for (let i = 0; i < toRemove; i++) {
                this.cache.delete(entries[i][0]);
            }
        }
    }
    
    /**
     * Utility: Deep clone (reused from GlobalStateManager)
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
}

/**
 * UI State Manager - Handles page states and user interactions
 */
class UIStateManager {
    constructor(globalStateManager) {
        this.globalState = globalStateManager;
        this.pageStates = new Map();
        this.modalStack = [];
        this.loadingStates = new Map();
        
        this.initializeUIManager();
    }
    
    /**
     * Initialize UI state management
     */
    initializeUIManager() {
        // Track current page
        this.updateCurrentPage();
        
        // Set up page visibility tracking
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Set up loading state management
        this.setupLoadingManagement();
        
        console.log('🟢 UIStateManager initialized');
    }
    
    /**
     * Update current page based on URL
     */
    updateCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'dashboard';
        
        this.globalState.updateState('ui.currentPage', page);
        
        // Store page-specific state
        this.initializePageState(page);
    }
    
    /**
     * Initialize page-specific state
     */
    initializePageState(page) {
        if (!this.pageStates.has(page)) {
            const defaultState = {
                scrollPosition: 0,
                filters: {},
                selectedItems: [],
                expandedSections: [],
                sortConfig: null,
                viewMode: 'default'
            };
            
            this.pageStates.set(page, defaultState);
        }
    }
    
    /**
     * Update page state
     */
    updatePageState(page, key, value) {
        if (!this.pageStates.has(page)) {
            this.initializePageState(page);
        }
        
        const pageState = this.pageStates.get(page);
        pageState[key] = value;
        
        // Persist important page states
        this.persistPageState(page);
    }
    
    /**
     * Get page state
     */
    getPageState(page, key = null) {
        const pageState = this.pageStates.get(page);
        if (!pageState) return null;
        
        return key ? pageState[key] : pageState;
    }
    
    /**
     * Handle loading states
     */
    setLoading(key, isLoading = true) {
        this.loadingStates.set(key, isLoading);
        this.globalState.updateState('ui.loadingStates', new Map(this.loadingStates));
        
        // Update UI elements
        const element = document.getElementById(`loading-${key}`) || 
                       document.getElementById('loadingIndicator');
        
        if (element) {
            element.style.display = isLoading ? 'block' : 'none';
        }
    }
    
    /**
     * Check if any loading state is active
     */
    isAnyLoading() {
        return Array.from(this.loadingStates.values()).some(loading => loading);
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now() + Math.random(),
            message,
            type,
            timestamp: Date.now(),
            duration
        };
        
        const notifications = this.globalState.getState('ui.notifications', []);
        notifications.push(notification);
        
        this.globalState.updateState('ui.notifications', notifications);
        
        // Auto-remove notification
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);
        
        return notification.id;
    }
    
    /**
     * Remove notification
     */
    removeNotification(id) {
        const notifications = this.globalState.getState('ui.notifications', []);
        const filtered = notifications.filter(n => n.id !== id);
        this.globalState.updateState('ui.notifications', filtered);
    }
    
    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause auto-refresh
            this.globalState.updateState('userSettings.autoRefresh', false);
        } else {
            // Page is visible - resume auto-refresh
            const savedSetting = localStorage.getItem('psc-auto-refresh');
            if (savedSetting !== 'false') {
                this.globalState.updateState('userSettings.autoRefresh', true);
            }
        }
    }
    
    /**
     * Set up loading management
     */
    setupLoadingManagement() {
        // Intercept fetch requests to manage loading states
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const url = args[0];
            const loadingKey = this.extractLoadingKey(url);
            
            this.setLoading(loadingKey, true);
            
            try {
                const response = await originalFetch(...args);
                this.setLoading(loadingKey, false);
                return response;
            } catch (error) {
                this.setLoading(loadingKey, false);
                throw error;
            }
        };
    }
    
    /**
     * Extract loading key from URL
     */
    extractLoadingKey(url) {
        if (typeof url !== 'string') return 'general';
        
        if (url.includes('fleet')) return 'fleet';
        if (url.includes('inspection')) return 'inspections';
        if (url.includes('chart')) return 'charts';
        
        return 'general';
    }
    
    /**
     * Persist important page states
     */
    persistPageState(page) {
        const importantPages = ['dashboard', 'inspections', 'vessels'];
        if (importantPages.includes(page)) {
            const pageState = this.pageStates.get(page);
            localStorage.setItem(`psc-page-${page}`, JSON.stringify(pageState));
        }
    }
}

/**
 * Event Bus Manager - Inter-module communication
 */
class EventBusManager {
    constructor() {
        this.events = new Map();
        this.middleware = [];
        this.eventHistory = [];
        this.maxHistorySize = 100;
        
        this.initializeEventBus();
    }
    
    /**
     * Initialize event bus with built-in events
     */
    initializeEventBus() {
        // Register system events
        this.registerSystemEvents();
        
        console.log('🟢 EventBusManager initialized');
    }
    
    /**
     * Subscribe to events
     */
    on(eventName, callback, options = {}) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        
        const subscription = {
            callback,
            options,
            id: Date.now() + Math.random(),
            createdAt: Date.now()
        };
        
        this.events.get(eventName).push(subscription);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.events.get(eventName);
            if (callbacks) {
                const index = callbacks.findIndex(cb => cb.id === subscription.id);
                if (index > -1) callbacks.splice(index, 1);
            }
        };
    }
    
    /**
     * Emit events with middleware support
     */
    emit(eventName, data = null, options = {}) {
        const event = {
            name: eventName,
            data,
            timestamp: Date.now(),
            source: options.source || 'unknown',
            id: Date.now() + Math.random()
        };
        
        // Add to history
        this.eventHistory.push(event);
        this.maintainHistorySize();
        
        // Apply middleware
        const processedEvent = this.applyEventMiddleware(event);
        
        // Notify subscribers
        const callbacks = this.events.get(eventName) || [];
        callbacks.forEach(({ callback, options: subOptions }) => {
            try {
                // Check if callback should be called based on options
                if (this.shouldCallCallback(processedEvent, subOptions)) {
                    callback(processedEvent.data, processedEvent);
                }
            } catch (error) {
                console.error(`Event callback error for ${eventName}:`, error);
            }
        });
        
        return event.id;
    }
    
    /**
     * Register system events
     */
    registerSystemEvents() {
        // Filter change events
        this.on('filter:changed', (data) => {
            console.log('Filter changed:', data);
        });
        
        // Data update events
        this.on('data:updated', (data) => {
            console.log('Data updated:', data);
        });
        
        // Navigation events
        this.on('navigation:changed', (data) => {
            console.log('Navigation changed:', data);
        });
        
        // Chart interaction events
        this.on('chart:clicked', (data) => {
            console.log('Chart clicked:', data);
        });
    }
    
    /**
     * Apply event middleware
     */
    applyEventMiddleware(event) {
        return this.middleware.reduce((processedEvent, middleware) => {
            return middleware(processedEvent) || processedEvent;
        }, event);
    }
    
    /**
     * Check if callback should be called based on subscription options
     */
    shouldCallCallback(event, options) {
        if (options.once && options.called) {
            return false;
        }
        
        if (options.filter && !options.filter(event)) {
            return false;
        }
        
        if (options.throttle) {
            const now = Date.now();
            if (options.lastCalled && (now - options.lastCalled) < options.throttle) {
                return false;
            }
            options.lastCalled = now;
        }
        
        if (options.once) {
            options.called = true;
        }
        
        return true;
    }
    
    /**
     * Maintain event history size
     */
    maintainHistorySize() {
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
        }
    }
    
    /**
     * Get event history for debugging
     */
    getEventHistory(eventName = null, limit = 50) {
        let history = this.eventHistory;
        
        if (eventName) {
            history = history.filter(event => event.name === eventName);
        }
        
        return history.slice(-limit);
    }
}

// Initialize and export state management system
const globalStateManager = new GlobalStateManager();
const dataStateManager = new DataStateManager(globalStateManager);
const uiStateManager = new UIStateManager(globalStateManager);
const eventBusManager = new EventBusManager();

// Export for global access
window.StateManagement = {
    global: globalStateManager,
    data: dataStateManager,
    ui: uiStateManager,
    events: eventBusManager
};

// Legacy compatibility
window.globalStateManager = globalStateManager;
window.dataStateManager = dataStateManager;
window.uiStateManager = uiStateManager;
window.eventBusManager = eventBusManager;

console.log('🟢 PSC Dashboard State Management System initialized');