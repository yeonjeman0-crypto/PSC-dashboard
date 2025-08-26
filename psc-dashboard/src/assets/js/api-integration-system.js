/**
 * PSC Dashboard - RESTful API Integration System
 * SystemIntegrator_PSC API Architecture Implementation
 * Version: 1.0.0 - Production Ready
 */

class APIIntegrationSystem {
    constructor() {
        this.baseURL = '/api/v1';
        this.endpoints = new Map();
        this.cache = new Map();
        this.rateLimiter = new Map();
        this.retryConfig = {
            maxRetries: 3,
            backoffMultiplier: 2,
            initialDelay: 1000
        };
        
        this.initializeAPISystem();
    }
    
    /**
     * Initialize API system with all endpoints and configuration
     */
    initializeAPISystem() {
        this.defineEndpoints();
        this.setupAuthentication();
        this.setupRateLimiting();
        this.setupErrorHandling();
        
        console.log('🌐 APIIntegrationSystem initialized with camelCase responses');
    }
    
    /**
     * Define all RESTful API endpoints following best practices
     */
    defineEndpoints() {
        const endpoints = {
            // === VESSEL ENDPOINTS ===
            vessels: {
                getAll: { method: 'GET', path: '/vessels', cache: 300 },
                getById: { method: 'GET', path: '/vessels/:id', cache: 600 },
                create: { method: 'POST', path: '/vessels', rateLimited: true },
                update: { method: 'PUT', path: '/vessels/:id', rateLimited: true },
                delete: { method: 'DELETE', path: '/vessels/:id', rateLimited: true },
                getRiskProfile: { method: 'GET', path: '/vessels/:id/risk', cache: 300 },
                getInspectionHistory: { method: 'GET', path: '/vessels/:id/inspections', cache: 300 }
            },
            
            // === INSPECTION ENDPOINTS ===
            inspections: {
                getAll: { method: 'GET', path: '/inspections', cache: 180 },
                getById: { method: 'GET', path: '/inspections/:id', cache: 600 },
                create: { method: 'POST', path: '/inspections', rateLimited: true },
                update: { method: 'PUT', path: '/inspections/:id', rateLimited: true },
                getByVessel: { method: 'GET', path: '/inspections/vessel/:vesselId', cache: 300 },
                getByPort: { method: 'GET', path: '/inspections/port/:portCode', cache: 300 },
                getStatistics: { method: 'GET', path: '/inspections/statistics', cache: 300 },
                getTrends: { method: 'GET', path: '/inspections/trends', cache: 600 }
            },
            
            // === DEFICIENCY ENDPOINTS ===
            deficiencies: {
                getAll: { method: 'GET', path: '/deficiencies', cache: 300 },
                getById: { method: 'GET', path: '/deficiencies/:id', cache: 600 },
                getByCode: { method: 'GET', path: '/deficiencies/code/:code', cache: 600 },
                getTopCodes: { method: 'GET', path: '/deficiencies/top-codes', cache: 600 },
                getCategoryBreakdown: { method: 'GET', path: '/deficiencies/categories', cache: 600 },
                getByVessel: { method: 'GET', path: '/deficiencies/vessel/:vesselId', cache: 300 }
            },
            
            // === RISK ASSESSMENT ENDPOINTS ===
            risk: {
                calculateVesselRisk: { method: 'POST', path: '/risk/vessel', cache: 180 },
                getFleetRisk: { method: 'GET', path: '/risk/fleet', cache: 300 },
                getRiskTrends: { method: 'GET', path: '/risk/trends', cache: 600 },
                getRiskFactors: { method: 'GET', path: '/risk/factors', cache: 600 },
                updateRiskModel: { method: 'PUT', path: '/risk/model', rateLimited: true }
            },
            
            // === PORT & GEOGRAPHY ENDPOINTS ===
            ports: {
                getAll: { method: 'GET', path: '/ports', cache: 3600 },
                getById: { method: 'GET', path: '/ports/:id', cache: 3600 },
                getByRegion: { method: 'GET', path: '/ports/region/:region', cache: 1800 },
                getStatistics: { method: 'GET', path: '/ports/statistics', cache: 600 },
                getPerformanceMetrics: { method: 'GET', path: '/ports/performance', cache: 600 }
            },
            
            // === MOU COMPLIANCE ENDPOINTS ===
            compliance: {
                getMouCompliance: { method: 'GET', path: '/compliance/mou/:mouCode', cache: 600 },
                getComplianceReport: { method: 'GET', path: '/compliance/report', cache: 1800 },
                getComplianceHistory: { method: 'GET', path: '/compliance/history/:vesselId', cache: 600 },
                generateReport: { method: 'POST', path: '/compliance/generate-report', rateLimited: true }
            },
            
            // === ANALYTICS & REPORTING ENDPOINTS ===
            analytics: {
                getKpis: { method: 'GET', path: '/analytics/kpis', cache: 300 },
                getChartData: { method: 'GET', path: '/analytics/charts/:chartType', cache: 300 },
                getReportData: { method: 'GET', path: '/analytics/reports/:reportType', cache: 600 },
                getComparativeAnalysis: { method: 'POST', path: '/analytics/compare', cache: 300 },
                exportData: { method: 'POST', path: '/analytics/export', rateLimited: true }
            }
        };
        
        // Register all endpoints
        Object.entries(endpoints).forEach(([category, categoryEndpoints]) => {
            Object.entries(categoryEndpoints).forEach(([name, config]) => {
                this.endpoints.set(`${category}.${name}`, {
                    ...config,
                    fullPath: `${this.baseURL}${config.path}`,
                    category,
                    name
                });
            });
        });
        
        console.log(`📋 Registered ${this.endpoints.size} API endpoints`);
    }
    
    /**
     * Set up authentication system
     */
    setupAuthentication() {
        this.auth = {
            token: localStorage.getItem('psc-auth-token'),
            refreshToken: localStorage.getItem('psc-refresh-token'),
            tokenExpiry: localStorage.getItem('psc-token-expiry'),
            
            isAuthenticated() {
                return this.token && this.tokenExpiry && Date.now() < parseInt(this.tokenExpiry);
            },
            
            getHeaders() {
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                };
                
                if (this.isAuthenticated()) {
                    headers.Authorization = `Bearer ${this.token}`;
                }
                
                return headers;
            }
        };
    }
    
    /**
     * Set up rate limiting to prevent API abuse
     */
    setupRateLimiting() {
        this.rateLimits = {
            default: { requests: 100, windowMs: 60000 }, // 100 requests per minute
            create: { requests: 10, windowMs: 60000 },   // 10 creates per minute
            update: { requests: 20, windowMs: 60000 },   // 20 updates per minute
            delete: { requests: 5, windowMs: 60000 }     // 5 deletes per minute
        };
    }
    
    /**
     * Set up comprehensive error handling
     */
    setupErrorHandling() {
        this.errorHandlers = {
            400: (error) => ({ message: 'Bad Request - Invalid data provided', details: error }),
            401: (error) => ({ message: 'Unauthorized - Please log in again', details: error }),
            403: (error) => ({ message: 'Forbidden - Insufficient permissions', details: error }),
            404: (error) => ({ message: 'Resource not found', details: error }),
            409: (error) => ({ message: 'Conflict - Resource already exists', details: error }),
            422: (error) => ({ message: 'Validation Error', details: error }),
            429: (error) => ({ message: 'Rate limit exceeded - Please wait before trying again', details: error }),
            500: (error) => ({ message: 'Internal Server Error - Please try again later', details: error }),
            502: (error) => ({ message: 'Bad Gateway - Service temporarily unavailable', details: error }),
            503: (error) => ({ message: 'Service Unavailable - Maintenance in progress', details: error })
        };
    }
    
    /**
     * Make API request with full error handling and caching
     */
    async makeRequest(endpointKey, params = {}, options = {}) {
        const endpoint = this.endpoints.get(endpointKey);
        if (!endpoint) {
            throw new Error(`Endpoint ${endpointKey} not found`);
        }
        
        try {
            // Check rate limit
            if (endpoint.rateLimited && !this.checkRateLimit(endpointKey)) {
                throw new Error('Rate limit exceeded');
            }
            
            // Build URL with parameters
            const url = this.buildURL(endpoint, params);
            const cacheKey = this.getCacheKey(url, options);
            
            // Check cache for GET requests
            if (endpoint.method === 'GET' && endpoint.cache) {
                const cached = this.getCachedResponse(cacheKey, endpoint.cache);
                if (cached) {
                    return cached;
                }
            }
            
            // Prepare request configuration
            const requestConfig = {
                method: endpoint.method,
                headers: {
                    ...this.auth.getHeaders(),
                    ...options.headers
                }
            };
            
            // Add body for POST/PUT requests
            if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && options.data) {
                requestConfig.body = JSON.stringify(options.data);
            }
            
            // Execute request with retry logic
            const response = await this.executeWithRetry(url, requestConfig);
            
            // Process response
            const result = await this.processResponse(response);
            
            // Cache successful GET responses
            if (endpoint.method === 'GET' && endpoint.cache && result.success) {
                this.setCachedResponse(cacheKey, result, endpoint.cache);
            }
            
            return result;
            
        } catch (error) {
            console.error(`API request failed for ${endpointKey}:`, error);
            throw this.processError(error);
        }
    }
    
    /**
     * Build URL with path parameters and query strings
     */
    buildURL(endpoint, params = {}) {
        let url = endpoint.fullPath;
        
        // Replace path parameters
        Object.entries(params).forEach(([key, value]) => {
            if (url.includes(`:${key}`)) {
                url = url.replace(`:${key}`, encodeURIComponent(value));
                delete params[key];
            }
        });
        
        // Add query parameters for GET requests
        const queryParams = Object.entries(params)
            .filter(([key, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        
        if (queryParams && endpoint.method === 'GET') {
            url += (url.includes('?') ? '&' : '?') + queryParams;
        }
        
        return url;
    }
    
    /**
     * Execute request with retry logic
     */
    async executeWithRetry(url, config, attempt = 1) {
        try {
            const response = await fetch(url, config);
            
            // Check if we should retry (5xx errors or network issues)
            if (response.status >= 500 && attempt < this.retryConfig.maxRetries) {
                const delay = this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
                console.warn(`Request failed (${response.status}), retrying in ${delay}ms... (attempt ${attempt})`);
                
                await this.delay(delay);
                return this.executeWithRetry(url, config, attempt + 1);
            }
            
            return response;
            
        } catch (error) {
            if (attempt < this.retryConfig.maxRetries) {
                const delay = this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
                console.warn(`Request failed, retrying in ${delay}ms... (attempt ${attempt})`);
                
                await this.delay(delay);
                return this.executeWithRetry(url, config, attempt + 1);
            }
            
            throw error;
        }
    }
    
    /**
     * Process API response and convert to camelCase
     */
    async processResponse(response) {
        const result = {
            success: response.ok,
            status: response.status,
            statusText: response.statusText,
            timestamp: Date.now()
        };
        
        try {
            if (response.headers.get('content-type')?.includes('application/json')) {
                const data = await response.json();
                result.data = this.convertToCamelCase(data);
            } else {
                result.data = await response.text();
            }
        } catch (error) {
            result.parseError = true;
            result.data = null;
        }
        
        if (!response.ok) {
            result.error = this.errorHandlers[response.status] 
                ? this.errorHandlers[response.status](result.data)
                : { message: 'Unknown error occurred', details: result.data };
        }
        
        return result;
    }
    
    /**
     * Convert response data keys to camelCase
     */
    convertToCamelCase(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => this.convertToCamelCase(item));
        }
        
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        const camelCaseObj = {};
        Object.entries(obj).forEach(([key, value]) => {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            camelCaseObj[camelKey] = this.convertToCamelCase(value);
        });
        
        return camelCaseObj;
    }
    
    /**
     * Process errors and provide meaningful messages
     */
    processError(error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return {
                success: false,
                error: {
                    message: 'Network error - Please check your connection',
                    type: 'network',
                    details: error.message
                }
            };
        }
        
        if (error.message === 'Rate limit exceeded') {
            return {
                success: false,
                error: {
                    message: 'Too many requests - Please wait before trying again',
                    type: 'rate_limit',
                    details: error.message
                }
            };
        }
        
        return {
            success: false,
            error: {
                message: error.message || 'An unexpected error occurred',
                type: 'unknown',
                details: error
            }
        };
    }
    
    /**
     * Check rate limit for endpoint
     */
    checkRateLimit(endpointKey) {
        const endpoint = this.endpoints.get(endpointKey);
        const limitType = endpoint.method.toLowerCase() === 'get' ? 'default' : endpoint.method.toLowerCase();
        const limits = this.rateLimits[limitType] || this.rateLimits.default;
        
        const now = Date.now();
        const key = `${endpointKey}-${Math.floor(now / limits.windowMs)}`;
        
        const current = this.rateLimiter.get(key) || 0;
        if (current >= limits.requests) {
            return false;
        }
        
        this.rateLimiter.set(key, current + 1);
        return true;
    }
    
    /**
     * Cache management functions
     */
    getCacheKey(url, options) {
        return `${url}-${JSON.stringify(options)}`;
    }
    
    getCachedResponse(cacheKey, ttlSeconds) {
        const cached = this.cache.get(cacheKey);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > ttlSeconds * 1000) {
            this.cache.delete(cacheKey);
            return null;
        }
        
        cached.fromCache = true;
        return cached;
    }
    
    setCachedResponse(cacheKey, response, ttlSeconds) {
        this.cache.set(cacheKey, {
            ...response,
            timestamp: Date.now(),
            ttl: ttlSeconds
        });
        
        // Cleanup old cache entries periodically
        if (this.cache.size > 100) {
            this.cleanupCache();
        }
    }
    
    /**
     * Clean up expired cache entries
     */
    cleanupCache() {
        const now = Date.now();
        const toDelete = [];
        
        this.cache.forEach((value, key) => {
            if (now - value.timestamp > value.ttl * 1000) {
                toDelete.push(key);
            }
        });
        
        toDelete.forEach(key => this.cache.delete(key));
        console.log(`🧹 Cleaned up ${toDelete.length} expired cache entries`);
    }
    
    /**
     * Utility function for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ==================== PUBLIC API METHODS ====================
    
    /**
     * VESSEL API METHODS
     */
    async getAllVessels(filters = {}) {
        return this.makeRequest('vessels.getAll', filters);
    }
    
    async getVesselById(vesselId) {
        return this.makeRequest('vessels.getById', { id: vesselId });
    }
    
    async getVesselRisk(vesselId) {
        return this.makeRequest('vessels.getRiskProfile', { id: vesselId });
    }
    
    async getVesselInspections(vesselId, filters = {}) {
        return this.makeRequest('vessels.getInspectionHistory', { id: vesselId, ...filters });
    }
    
    /**
     * INSPECTION API METHODS
     */
    async getAllInspections(filters = {}) {
        return this.makeRequest('inspections.getAll', filters);
    }
    
    async getInspectionById(inspectionId) {
        return this.makeRequest('inspections.getById', { id: inspectionId });
    }
    
    async getInspectionsByVessel(vesselId, filters = {}) {
        return this.makeRequest('inspections.getByVessel', { vesselId, ...filters });
    }
    
    async getInspectionsByPort(portCode, filters = {}) {
        return this.makeRequest('inspections.getByPort', { portCode, ...filters });
    }
    
    async getInspectionStatistics(filters = {}) {
        return this.makeRequest('inspections.getStatistics', filters);
    }
    
    async getInspectionTrends(filters = {}) {
        return this.makeRequest('inspections.getTrends', filters);
    }
    
    /**
     * DEFICIENCY API METHODS
     */
    async getAllDeficiencies(filters = {}) {
        return this.makeRequest('deficiencies.getAll', filters);
    }
    
    async getDeficiencyByCode(code) {
        return this.makeRequest('deficiencies.getByCode', { code });
    }
    
    async getTopDeficiencyCodes(limit = 10) {
        return this.makeRequest('deficiencies.getTopCodes', { limit });
    }
    
    async getDeficiencyCategories() {
        return this.makeRequest('deficiencies.getCategoryBreakdown');
    }
    
    /**
     * RISK ASSESSMENT API METHODS
     */
    async calculateVesselRisk(vesselData) {
        return this.makeRequest('risk.calculateVesselRisk', {}, { data: vesselData });
    }
    
    async getFleetRisk(filters = {}) {
        return this.makeRequest('risk.getFleetRisk', filters);
    }
    
    async getRiskTrends(filters = {}) {
        return this.makeRequest('risk.getRiskTrends', filters);
    }
    
    async getRiskFactors() {
        return this.makeRequest('risk.getRiskFactors');
    }
    
    /**
     * PORT & GEOGRAPHY API METHODS
     */
    async getAllPorts(filters = {}) {
        return this.makeRequest('ports.getAll', filters);
    }
    
    async getPortById(portId) {
        return this.makeRequest('ports.getById', { id: portId });
    }
    
    async getPortsByRegion(region) {
        return this.makeRequest('ports.getByRegion', { region });
    }
    
    async getPortStatistics(filters = {}) {
        return this.makeRequest('ports.getStatistics', filters);
    }
    
    async getPortPerformance(filters = {}) {
        return this.makeRequest('ports.getPerformanceMetrics', filters);
    }
    
    /**
     * MOU COMPLIANCE API METHODS
     */
    async getMouCompliance(mouCode, filters = {}) {
        return this.makeRequest('compliance.getMouCompliance', { mouCode, ...filters });
    }
    
    async getComplianceReport(filters = {}) {
        return this.makeRequest('compliance.getComplianceReport', filters);
    }
    
    async getComplianceHistory(vesselId) {
        return this.makeRequest('compliance.getComplianceHistory', { vesselId });
    }
    
    async generateComplianceReport(reportConfig) {
        return this.makeRequest('compliance.generateReport', {}, { data: reportConfig });
    }
    
    /**
     * ANALYTICS API METHODS
     */
    async getKpis(filters = {}) {
        return this.makeRequest('analytics.getKpis', filters);
    }
    
    async getChartData(chartType, filters = {}) {
        return this.makeRequest('analytics.getChartData', { chartType, ...filters });
    }
    
    async getReportData(reportType, filters = {}) {
        return this.makeRequest('analytics.getReportData', { reportType, ...filters });
    }
    
    async getComparativeAnalysis(comparisonConfig) {
        return this.makeRequest('analytics.getComparativeAnalysis', {}, { data: comparisonConfig });
    }
    
    async exportData(exportConfig) {
        return this.makeRequest('analytics.exportData', {}, { data: exportConfig });
    }
    
    /**
     * Get system health status
     */
    getSystemHealth() {
        return {
            totalEndpoints: this.endpoints.size,
            authenticatedRequests: this.auth.isAuthenticated(),
            cacheSize: this.cache.size,
            rateLimiterSize: this.rateLimiter.size,
            timestamp: Date.now()
        };
    }
    
    /**
     * Clear all caches
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ API cache cleared');
    }
    
    /**
     * Reset rate limiters
     */
    resetRateLimiters() {
        this.rateLimiter.clear();
        console.log('🔄 Rate limiters reset');
    }
}

// Initialize and export API system
const apiIntegrationSystem = new APIIntegrationSystem();

// Export for global access
window.PSC_API = apiIntegrationSystem;

// Legacy compatibility
window.apiIntegrationSystem = apiIntegrationSystem;

console.log('🌐 PSC Dashboard API Integration System ready - RESTful endpoints with camelCase responses');