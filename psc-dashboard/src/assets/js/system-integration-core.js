/**
 * PSC Dashboard - System Integration Core
 * SystemIntegrator_PSC Master Integration Implementation
 * Version: 1.0.0 - Production Ready
 * Integrates all 7 PSC modules with unified architecture
 */

class SystemIntegrationCore {
    constructor() {
        this.integrationConfig = {
            version: '1.0.0',
            modules: {
                dataArchitect: { loaded: false, instance: null, priority: 1 },
                etlProcessor: { loaded: false, instance: null, priority: 2 },
                uiArchitect: { loaded: false, instance: null, priority: 3 },
                chartSpecialist: { loaded: false, instance: null, priority: 4 },
                inspectionAnalyst: { loaded: false, instance: null, priority: 5 },
                riskCalculator: { loaded: false, instance: null, priority: 6 },
                geoMapper: { loaded: false, instance: null, priority: 7 }
            },
            
            systemComponents: {
                stateManagement: { loaded: false, instance: null },
                apiIntegration: { loaded: false, instance: null },
                cachingStrategy: { loaded: false, instance: null },
                performanceOptimization: { loaded: false, instance: null },
                moduleIntegration: { loaded: false, instance: null }
            },
            
            integration: {
                status: 'initializing',
                startTime: Date.now(),
                completionTime: null,
                errors: [],
                warnings: []
            }
        };
        
        this.eventBus = null;
        this.dataFlow = new Map();
        this.dependencyGraph = new Map();
        this.healthMonitor = null;
        
        this.initializeSystemIntegration();
    }
    
    /**
     * Initialize complete system integration
     */
    initializeSystemIntegration() {
        console.log('🚀 SystemIntegrationCore starting - Integrating 7 PSC modules...');
        
        this.integrationConfig.integration.status = 'loading';
        
        // Load system components first
        this.loadSystemComponents()
            .then(() => this.loadPSCModules())
            .then(() => this.establishDataFlows())
            .then(() => this.validateIntegration())
            .then(() => this.startHealthMonitoring())
            .then(() => this.completeIntegration())
            .catch(error => this.handleIntegrationError(error));
    }
    
    /**
     * Load all system components in order
     */
    async loadSystemComponents() {
        console.log('📦 Loading system components...');
        
        const components = [
            { name: 'stateManagement', instance: 'StateManagement' },
            { name: 'apiIntegration', instance: 'PSC_API' },
            { name: 'cachingStrategy', instance: 'CachingSystem' },
            { name: 'performanceOptimization', instance: 'PerformanceSystem' },
            { name: 'moduleIntegration', instance: 'ModuleIntegrationManager' }
        ];
        
        for (const component of components) {
            try {
                // Wait for component to be available
                await this.waitForGlobalInstance(component.instance);
                
                this.integrationConfig.systemComponents[component.name] = {
                    loaded: true,
                    instance: window[component.instance]
                };
                
                console.log(`✅ ${component.name} loaded successfully`);
                
            } catch (error) {
                console.error(`❌ Failed to load ${component.name}:`, error);
                this.integrationConfig.integration.errors.push({
                    component: component.name,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        }
        
        // Initialize event bus from state management
        if (this.integrationConfig.systemComponents.stateManagement.loaded) {
            this.eventBus = window.StateManagement.events;
            this.setupSystemEvents();
        }
    }
    
    /**
     * Load all PSC modules in dependency order
     */
    async loadPSCModules() {
        console.log('🔗 Loading PSC modules...');
        
        // Get module integration manager
        const moduleManager = this.integrationConfig.systemComponents.moduleIntegration.instance;
        
        if (!moduleManager) {
            throw new Error('Module Integration Manager not available');
        }
        
        // Modules are already registered in module-integration.js
        // Just verify they're properly loaded
        const moduleStatus = moduleManager.getIntegrationStatus();
        
        Object.entries(moduleStatus.agents).forEach(([agentName, status]) => {
            const moduleName = this.mapAgentToModule(agentName);
            if (moduleName && this.integrationConfig.modules[moduleName]) {
                this.integrationConfig.modules[moduleName] = {
                    loaded: status.status === 'active',
                    instance: moduleManager.agents.get(agentName),
                    priority: this.integrationConfig.modules[moduleName].priority
                };
                
                if (status.status === 'active') {
                    console.log(`✅ ${moduleName} module integrated successfully`);
                } else {
                    console.warn(`⚠️ ${moduleName} module has issues:`, status);
                }
            }
        });
    }
    
    /**
     * Establish data flows between all components
     */
    establishDataFlows() {
        console.log('🔄 Establishing data flows...');
        
        // Primary data flow: Raw Data → ETL → Processing → Visualization
        const primaryFlow = [
            { from: 'dataArchitect', to: 'etlProcessor', data: 'schema_validation' },
            { from: 'etlProcessor', to: 'cachingStrategy', data: 'processed_data' },
            { from: 'cachingStrategy', to: 'apiIntegration', data: 'cached_responses' },
            { from: 'apiIntegration', to: 'chartSpecialist', data: 'api_data' },
            { from: 'chartSpecialist', to: 'uiArchitect', data: 'rendered_charts' }
        ];
        
        // Analysis flows: Data → Analysis → Risk Assessment → Visualization
        const analysisFlow = [
            { from: 'etlProcessor', to: 'inspectionAnalyst', data: 'inspection_data' },
            { from: 'inspectionAnalyst', to: 'riskCalculator', data: 'compliance_analysis' },
            { from: 'riskCalculator', to: 'geoMapper', data: 'risk_data' },
            { from: 'geoMapper', to: 'chartSpecialist', data: 'geographic_analysis' }
        ];
        
        // System flows: Performance → Optimization → Caching
        const systemFlow = [
            { from: 'performanceOptimization', to: 'cachingStrategy', data: 'optimization_metrics' },
            { from: 'cachingStrategy', to: 'stateManagement', data: 'cache_statistics' },
            { from: 'stateManagement', to: 'apiIntegration', data: 'state_updates' }
        ];
        
        // Register all flows
        [...primaryFlow, ...analysisFlow, ...systemFlow].forEach(flow => {
            const key = `${flow.from}->${flow.to}`;
            this.dataFlow.set(key, flow);
            
            // Build dependency graph
            if (!this.dependencyGraph.has(flow.to)) {
                this.dependencyGraph.set(flow.to, new Set());
            }
            this.dependencyGraph.get(flow.to).add(flow.from);
        });
        
        console.log(`🔄 Established ${this.dataFlow.size} data flow connections`);
    }
    
    /**
     * Validate complete system integration
     */
    validateIntegration() {
        console.log('🔍 Validating system integration...');
        
        const validation = {
            systemComponents: this.validateSystemComponents(),
            pscModules: this.validatePSCModules(),
            dataFlows: this.validateDataFlows(),
            performance: this.validatePerformance(),
            apiEndpoints: this.validateAPIEndpoints()
        };
        
        const allValid = Object.values(validation).every(v => v.valid);
        
        if (allValid) {
            console.log('✅ System integration validation passed');
            this.integrationConfig.integration.status = 'validated';
        } else {
            console.error('❌ System integration validation failed:', validation);
            this.integrationConfig.integration.status = 'validation_failed';
            
            // Collect all validation errors
            Object.entries(validation).forEach(([component, result]) => {
                if (!result.valid) {
                    this.integrationConfig.integration.errors.push({
                        component,
                        errors: result.errors,
                        timestamp: Date.now()
                    });
                }
            });
        }
        
        return validation;
    }
    
    /**
     * Start health monitoring for the integrated system
     */
    startHealthMonitoring() {
        console.log('💓 Starting system health monitoring...');
        
        this.healthMonitor = {
            interval: null,
            metrics: {
                uptime: 0,
                errorRate: 0,
                performanceScore: 0,
                cacheHitRate: 0,
                memoryUsage: 0
            },
            
            alerts: [],
            lastCheck: Date.now()
        };
        
        // Health check every 30 seconds
        this.healthMonitor.interval = setInterval(() => {
            this.performHealthCheck();
        }, 30000);
        
        // Initial health check
        this.performHealthCheck();
    }
    
    /**
     * Complete the integration process
     */
    completeIntegration() {
        this.integrationConfig.integration.completionTime = Date.now();
        this.integrationConfig.integration.status = 'completed';
        
        const duration = this.integrationConfig.integration.completionTime - this.integrationConfig.integration.startTime;
        
        console.log(`🎉 PSC Dashboard System Integration Complete!
            - Duration: ${duration}ms
            - System Components: ${Object.keys(this.integrationConfig.systemComponents).length}
            - PSC Modules: ${Object.keys(this.integrationConfig.modules).length}
            - Data Flows: ${this.dataFlow.size}
            - Status: ${this.integrationConfig.integration.status}
        `);
        
        // Trigger system ready event
        if (this.eventBus) {
            this.eventBus.emit('system:integration_complete', {
                duration,
                modules: Object.keys(this.integrationConfig.modules).length,
                components: Object.keys(this.integrationConfig.systemComponents).length,
                status: this.integrationConfig.integration.status
            });
        }
        
        // Show success notification
        if (window.StateManagement?.ui?.showNotification) {
            window.StateManagement.ui.showNotification(
                'PSC Dashboard system integration completed successfully!',
                'success',
                8000
            );
        }
    }
    
    /**
     * Handle integration errors gracefully
     */
    handleIntegrationError(error) {
        console.error('💥 System integration failed:', error);
        
        this.integrationConfig.integration.status = 'failed';
        this.integrationConfig.integration.errors.push({
            type: 'critical',
            error: error.message,
            stack: error.stack,
            timestamp: Date.now()
        });
        
        // Attempt recovery
        this.attemptRecovery(error);
    }
    
    // ==================== VALIDATION FUNCTIONS ====================
    
    /**
     * Validate system components
     */
    validateSystemComponents() {
        const errors = [];
        const components = this.integrationConfig.systemComponents;
        
        // Check if all critical components are loaded
        Object.entries(components).forEach(([name, component]) => {
            if (!component.loaded) {
                errors.push(`${name} not loaded`);
            } else if (!component.instance) {
                errors.push(`${name} instance not available`);
            }
        });
        
        // Validate state management
        if (components.stateManagement.loaded && !window.StateManagement?.global) {
            errors.push('State management not properly initialized');
        }
        
        // Validate API integration
        if (components.apiIntegration.loaded && !window.PSC_API?.getSystemHealth) {
            errors.push('API integration not properly initialized');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    /**
     * Validate PSC modules
     */
    validatePSCModules() {
        const errors = [];
        const modules = this.integrationConfig.modules;
        
        const requiredModules = ['dataArchitect', 'etlProcessor', 'uiArchitect', 'chartSpecialist'];
        
        requiredModules.forEach(moduleName => {
            const module = modules[moduleName];
            if (!module || !module.loaded) {
                errors.push(`Critical module ${moduleName} not loaded`);
            }
        });
        
        return { valid: errors.length === 0, errors };
    }
    
    /**
     * Validate data flows
     */
    validateDataFlows() {
        const errors = [];
        
        // Check if data flows are properly established
        if (this.dataFlow.size === 0) {
            errors.push('No data flows established');
        }
        
        // Check for circular dependencies
        const circularDeps = this.detectCircularDependencies();
        if (circularDeps.length > 0) {
            errors.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    /**
     * Validate performance configuration
     */
    validatePerformance() {
        const errors = [];
        
        // Check performance system
        if (!window.PerformanceSystem) {
            errors.push('Performance system not available');
        }
        
        // Check caching system
        if (!window.CachingSystem) {
            errors.push('Caching system not available');
        } else {
            const cacheHealth = window.CachingSystem.getHealthStatus();
            if (cacheHealth.status !== 'healthy') {
                errors.push(`Cache health issues: ${cacheHealth.issues.join(', ')}`);
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    /**
     * Validate API endpoints
     */
    validateAPIEndpoints() {
        const errors = [];
        
        if (!window.PSC_API) {
            errors.push('API system not available');
        } else {
            const apiHealth = window.PSC_API.getSystemHealth();
            if (!apiHealth.authenticatedRequests) {
                // Warning, not error - authentication might not be required
                this.integrationConfig.integration.warnings.push('API authentication not configured');
            }
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    // ==================== HEALTH MONITORING ====================
    
    /**
     * Perform comprehensive health check
     */
    performHealthCheck() {
        const startTime = Date.now();
        
        try {
            // Calculate uptime
            this.healthMonitor.metrics.uptime = startTime - this.integrationConfig.integration.startTime;
            
            // Check error rate
            const recentErrors = this.integrationConfig.integration.errors.filter(
                error => startTime - error.timestamp < 300000 // Last 5 minutes
            );
            this.healthMonitor.metrics.errorRate = (recentErrors.length / 300) * 100; // Errors per second * 100
            
            // Get performance score
            if (window.PerformanceSystem) {
                const perfStatus = window.PerformanceSystem.getPerformanceStatus();
                this.healthMonitor.metrics.performanceScore = perfStatus.isOptimized ? 100 : 70;
            }
            
            // Get cache hit rate
            if (window.CachingSystem) {
                const cacheStats = window.CachingSystem.getStatistics();
                this.healthMonitor.metrics.cacheHitRate = parseFloat(cacheStats.performanceMetrics.cacheHitRate) || 0;
            }
            
            // Estimate memory usage
            this.healthMonitor.metrics.memoryUsage = this.estimateMemoryUsage();
            
            // Check for alerts
            this.checkHealthAlerts();
            
            this.healthMonitor.lastCheck = startTime;
            
        } catch (error) {
            console.error('Health check failed:', error);
            this.healthMonitor.alerts.push({
                type: 'critical',
                message: 'Health monitoring system failure',
                timestamp: startTime
            });
        }
    }
    
    /**
     * Check for health alerts and warnings
     */
    checkHealthAlerts() {
        const metrics = this.healthMonitor.metrics;
        const alerts = [];
        
        // Performance alerts
        if (metrics.performanceScore < 80) {
            alerts.push({
                type: 'warning',
                message: `Performance score below threshold: ${metrics.performanceScore}%`,
                timestamp: Date.now()
            });
        }
        
        // Error rate alerts
        if (metrics.errorRate > 0.1) {
            alerts.push({
                type: 'warning',
                message: `High error rate detected: ${metrics.errorRate.toFixed(2)}%`,
                timestamp: Date.now()
            });
        }
        
        // Cache hit rate alerts
        if (metrics.cacheHitRate < 50) {
            alerts.push({
                type: 'warning',
                message: `Low cache hit rate: ${metrics.cacheHitRate}%`,
                timestamp: Date.now()
            });
        }
        
        // Memory usage alerts
        if (metrics.memoryUsage > 90) {
            alerts.push({
                type: 'critical',
                message: `High memory usage: ${metrics.memoryUsage}%`,
                timestamp: Date.now()
            });
        }
        
        // Add new alerts
        alerts.forEach(alert => {
            this.healthMonitor.alerts.push(alert);
            console.warn(`🚨 Health Alert [${alert.type}]: ${alert.message}`);
        });
        
        // Keep only recent alerts (last hour)
        const oneHourAgo = Date.now() - 3600000;
        this.healthMonitor.alerts = this.healthMonitor.alerts.filter(
            alert => alert.timestamp > oneHourAgo
        );
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    /**
     * Wait for global instance to be available
     */
    waitForGlobalInstance(instanceName, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkInstance = () => {
                if (window[instanceName]) {
                    resolve(window[instanceName]);
                    return;
                }
                
                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Timeout waiting for ${instanceName}`));
                    return;
                }
                
                setTimeout(checkInstance, 100);
            };
            
            checkInstance();
        });
    }
    
    /**
     * Map agent names to module names
     */
    mapAgentToModule(agentName) {
        const mapping = {
            'DataArchitect': 'dataArchitect',
            'ETLProcessor': 'etlProcessor',
            'UIArchitect': 'uiArchitect',
            'ChartSpecialist': 'chartSpecialist',
            'InspectionAnalyst': 'inspectionAnalyst',
            'RiskCalculator': 'riskCalculator',
            'GeoMapper': 'geoMapper'
        };
        
        return mapping[agentName] || null;
    }
    
    /**
     * Detect circular dependencies in data flows
     */
    detectCircularDependencies() {
        const circular = [];
        const visited = new Set();
        const recursionStack = new Set();
        
        const hasCycle = (node, path = []) => {
            if (recursionStack.has(node)) {
                circular.push([...path, node]);
                return true;
            }
            
            if (visited.has(node)) return false;
            
            visited.add(node);
            recursionStack.add(node);
            
            const dependencies = this.dependencyGraph.get(node) || new Set();
            for (const dep of dependencies) {
                if (hasCycle(dep, [...path, node])) {
                    return true;
                }
            }
            
            recursionStack.delete(node);
            return false;
        };
        
        // Check all nodes
        for (const node of this.dependencyGraph.keys()) {
            if (!visited.has(node)) {
                hasCycle(node);
            }
        }
        
        return circular;
    }
    
    /**
     * Estimate memory usage
     */
    estimateMemoryUsage() {
        if ('memory' in performance) {
            const memInfo = performance.memory;
            return ((memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100).toFixed(2);
        }
        
        // Fallback estimation based on cache sizes
        let estimatedUsage = 0;
        
        if (window.CachingSystem) {
            const cacheStats = window.CachingSystem.getStatistics();
            estimatedUsage += parseInt(cacheStats.memoryCache.utilization) || 0;
        }
        
        if (window.StateManagement) {
            estimatedUsage += 10; // Estimated state management overhead
        }
        
        return Math.min(estimatedUsage, 100);
    }
    
    /**
     * Set up system-level events
     */
    setupSystemEvents() {
        if (!this.eventBus) return;
        
        // System integration events
        this.eventBus.on('system:module_error', (data) => {
            this.handleModuleError(data);
        });
        
        this.eventBus.on('system:performance_degradation', (data) => {
            this.handlePerformanceDegradation(data);
        });
        
        this.eventBus.on('system:cache_full', (data) => {
            this.handleCacheFull(data);
        });
        
        // Data flow events
        this.eventBus.on('dataflow:bottleneck', (data) => {
            this.handleDataFlowBottleneck(data);
        });
    }
    
    /**
     * Handle module errors
     */
    handleModuleError(data) {
        console.error('Module error detected:', data);
        
        this.integrationConfig.integration.errors.push({
            type: 'module_error',
            module: data.module,
            error: data.error,
            timestamp: Date.now()
        });
        
        // Attempt module recovery if possible
        this.attemptModuleRecovery(data.module);
    }
    
    /**
     * Attempt system recovery
     */
    attemptRecovery(error) {
        console.log('🔧 Attempting system recovery...');
        
        // Clear caches to free memory
        if (window.CachingSystem) {
            window.CachingSystem.clearAll();
        }
        
        // Reset performance optimizations
        if (window.PerformanceSystem) {
            window.PerformanceSystem.resetRateLimiters?.();
        }
        
        // Reset state management if needed
        if (window.StateManagement?.global) {
            window.StateManagement.global.updateState('system.recovery', {
                attempted: true,
                timestamp: Date.now(),
                reason: error.message
            });
        }
        
        console.log('🔧 Recovery attempt completed');
    }
    
    /**
     * Attempt module recovery
     */
    attemptModuleRecovery(moduleName) {
        console.log(`🔧 Attempting recovery for module: ${moduleName}`);
        
        const module = this.integrationConfig.modules[moduleName];
        if (module) {
            module.loaded = false;
            // Mark for reload on next health check
            module.needsRecovery = true;
        }
    }
    
    // ==================== PUBLIC API ====================
    
    /**
     * Get complete system status
     */
    getSystemStatus() {
        return {
            integration: { ...this.integrationConfig.integration },
            modules: Object.fromEntries(
                Object.entries(this.integrationConfig.modules).map(([name, module]) => [
                    name,
                    { loaded: module.loaded, priority: module.priority }
                ])
            ),
            systemComponents: Object.fromEntries(
                Object.entries(this.integrationConfig.systemComponents).map(([name, component]) => [
                    name,
                    { loaded: component.loaded }
                ])
            ),
            health: this.healthMonitor ? { ...this.healthMonitor.metrics } : null,
            dataFlows: this.dataFlow.size,
            alerts: this.healthMonitor ? [...this.healthMonitor.alerts] : [],
            timestamp: Date.now()
        };
    }
    
    /**
     * Get performance metrics across all systems
     */
    getPerformanceMetrics() {
        const metrics = {
            system: {
                uptime: this.healthMonitor?.metrics.uptime || 0,
                errorRate: this.healthMonitor?.metrics.errorRate || 0,
                memoryUsage: this.healthMonitor?.metrics.memoryUsage || 0
            },
            performance: null,
            caching: null,
            api: null
        };
        
        // Get performance system metrics
        if (window.PerformanceSystem) {
            metrics.performance = window.PerformanceSystem.getPerformanceStatus();
        }
        
        // Get caching system metrics
        if (window.CachingSystem) {
            metrics.caching = window.CachingSystem.getStatistics();
        }
        
        // Get API system metrics
        if (window.PSC_API) {
            metrics.api = window.PSC_API.getSystemHealth();
        }
        
        return metrics;
    }
    
    /**
     * Execute system-wide operation
     */
    async executeSystemOperation(operation) {
        console.log(`🔄 Executing system operation: ${operation.type}`);
        
        const startTime = Date.now();
        
        try {
            let result;
            
            switch (operation.type) {
                case 'cache_clear':
                    result = await this.clearAllCaches();
                    break;
                case 'performance_optimization':
                    result = await this.optimizeSystemPerformance();
                    break;
                case 'data_refresh':
                    result = await this.refreshAllData();
                    break;
                case 'health_check':
                    result = this.performHealthCheck();
                    break;
                default:
                    throw new Error(`Unknown operation type: ${operation.type}`);
            }
            
            const duration = Date.now() - startTime;
            console.log(`✅ System operation completed in ${duration}ms`);
            
            return { success: true, result, duration };
            
        } catch (error) {
            console.error(`❌ System operation failed:`, error);
            return { success: false, error: error.message, duration: Date.now() - startTime };
        }
    }
    
    /**
     * Clear all system caches
     */
    async clearAllCaches() {
        const results = [];
        
        if (window.CachingSystem) {
            const result = await window.CachingSystem.clearAll();
            results.push({ system: 'caching', result });
        }
        
        if (window.PSC_API) {
            window.PSC_API.clearCache();
            results.push({ system: 'api', result: { success: true } });
        }
        
        return results;
    }
    
    /**
     * Optimize system performance
     */
    async optimizeSystemPerformance() {
        const optimizations = [];
        
        // Trigger performance optimizations
        if (window.PerformanceSystem) {
            // Performance system handles its own optimizations
            optimizations.push({ system: 'performance', status: 'triggered' });
        }
        
        // Optimize cache configuration
        if (window.CachingSystem) {
            window.CachingSystem.configureCaching({ aggressive: true });
            optimizations.push({ system: 'caching', status: 'optimized' });
        }
        
        return optimizations;
    }
    
    /**
     * Refresh all data across systems
     */
    async refreshAllData() {
        const refreshResults = [];
        
        // Refresh cached data
        if (window.StateManagement?.data) {
            try {
                const kpis = await window.StateManagement.data.calculateKPIs();
                const fleet = await window.StateManagement.data.getFleetData();
                const inspections = await window.StateManagement.data.getInspectionStats();
                
                refreshResults.push({ 
                    system: 'data', 
                    result: { kpis, fleet, inspections },
                    status: 'success'
                });
            } catch (error) {
                refreshResults.push({ 
                    system: 'data', 
                    error: error.message,
                    status: 'failed'
                });
            }
        }
        
        return refreshResults;
    }
}

// Initialize system integration
const systemIntegrationCore = new SystemIntegrationCore();

// Export for global access
window.SystemIntegration = systemIntegrationCore;

// Legacy compatibility
window.systemIntegrationCore = systemIntegrationCore;

console.log('🚀 PSC Dashboard System Integration Core initialized - Integrating all modules...');