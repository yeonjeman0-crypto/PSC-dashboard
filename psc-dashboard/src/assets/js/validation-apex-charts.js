/**
 * ApexCharts Implementation Validation Script
 * Tests all ChartSpecialist_Apex functionality
 */

class ApexChartsValidator {
    constructor() {
        this.testResults = [];
        this.errors = [];
        this.warnings = [];
        
        console.log('🧪 ApexCharts Validation Suite initialized');
    }

    /**
     * Run complete validation suite
     */
    async runCompleteValidation() {
        console.log('🚀 Running complete ApexCharts validation...');
        
        this.testResults = [];
        this.errors = [];
        this.warnings = [];

        // Test 1: Check dependencies
        await this.testDependencies();
        
        // Test 2: Check data loading
        await this.testDataLoading();
        
        // Test 3: Check chart specialist initialization
        await this.testChartSpecialistInitialization();
        
        // Test 4: Check KPI cards
        await this.testKpiCards();
        
        // Test 5: Check main charts
        await this.testMainCharts();
        
        // Test 6: Check interactive features
        await this.testInteractiveFeatures();
        
        // Test 7: Check real-time updates
        await this.testRealTimeUpdates();
        
        // Test 8: Check error handling
        await this.testErrorHandling();
        
        // Generate report
        this.generateValidationReport();
        
        return this.getValidationSummary();
    }

    /**
     * Test 1: Check dependencies
     */
    async testDependencies() {
        console.log('🔍 Testing dependencies...');
        
        const tests = [
            {
                name: 'ApexCharts library loaded',
                test: () => typeof ApexCharts !== 'undefined',
                critical: true
            },
            {
                name: 'ChartSpecialistApex class available',
                test: () => typeof ChartSpecialistApex !== 'undefined',
                critical: true
            },
            {
                name: 'KpiCardsApex class available',
                test: () => typeof KpiCardsApex !== 'undefined',
                critical: true
            },
            {
                name: 'DashboardIntegrationApex class available',
                test: () => typeof DashboardIntegrationApex !== 'undefined',
                critical: true
            },
            {
                name: 'DOM fully loaded',
                test: () => document.readyState === 'complete',
                critical: true
            }
        ];

        for (const test of tests) {
            try {
                const passed = test.test();
                this.testResults.push({
                    category: 'Dependencies',
                    name: test.name,
                    passed,
                    critical: test.critical
                });
                
                if (!passed && test.critical) {
                    this.errors.push(`Critical dependency missing: ${test.name}`);
                } else if (!passed) {
                    this.warnings.push(`Dependency warning: ${test.name}`);
                }
            } catch (error) {
                this.errors.push(`Dependency test error: ${test.name} - ${error.message}`);
                this.testResults.push({
                    category: 'Dependencies',
                    name: test.name,
                    passed: false,
                    error: error.message,
                    critical: test.critical
                });
            }
        }
    }

    /**
     * Test 2: Check data loading
     */
    async testDataLoading() {
        console.log('📊 Testing data loading...');
        
        try {
            // Test actual data loading
            const response = await fetch('../../processed_data/analytics/inspection_fact.json');
            const dataAvailable = response.ok;
            
            this.testResults.push({
                category: 'Data Loading',
                name: 'Actual PSC data accessible',
                passed: dataAvailable
            });

            if (!dataAvailable) {
                this.warnings.push('Actual PSC data not accessible, fallback data will be used');
            }

            // Test data structure
            if (dataAvailable) {
                const data = await response.json();
                const requiredFields = ['fleet_kpis', 'compliance_kpis', 'monthly_trends', 'vessel_performance'];
                
                for (const field of requiredFields) {
                    const fieldExists = data[field] !== undefined;
                    this.testResults.push({
                        category: 'Data Loading',
                        name: `Required field '${field}' exists`,
                        passed: fieldExists
                    });
                    
                    if (!fieldExists) {
                        this.errors.push(`Missing required data field: ${field}`);
                    }
                }
            }
        } catch (error) {
            this.errors.push(`Data loading test error: ${error.message}`);
            this.testResults.push({
                category: 'Data Loading',
                name: 'Data loading test',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Test 3: Check chart specialist initialization
     */
    async testChartSpecialistInitialization() {
        console.log('⚡ Testing chart specialist initialization...');
        
        try {
            // Wait for dashboard integration to initialize
            await this.waitForDashboardIntegration();
            
            const dashboardIntegration = window.dashboardIntegration;
            const chartSpecialist = dashboardIntegration ? dashboardIntegration.chartSpecialist : null;
            
            this.testResults.push({
                category: 'Chart Specialist',
                name: 'Dashboard integration initialized',
                passed: dashboardIntegration !== null,
                critical: true
            });

            this.testResults.push({
                category: 'Chart Specialist',
                name: 'Chart specialist instance created',
                passed: chartSpecialist !== null,
                critical: true
            });

            if (chartSpecialist) {
                this.testResults.push({
                    category: 'Chart Specialist',
                    name: 'Data cache populated',
                    passed: chartSpecialist.dataCache.size > 0
                });

                this.testResults.push({
                    category: 'Chart Specialist',
                    name: 'PSC colors defined',
                    passed: Object.keys(chartSpecialist.pscColors).length > 0
                });
            }
        } catch (error) {
            this.errors.push(`Chart specialist test error: ${error.message}`);
        }
    }

    /**
     * Test 4: Check KPI cards
     */
    async testKpiCards() {
        console.log('🎯 Testing KPI cards...');
        
        const kpiCardTests = [
            'sparkline-inspections',
            'gauge-deficiency-rate', 
            'progress-detention-rate',
            'radial-clean-rate',
            'donut-fleet-coverage',
            'bar-high-risk-vessels',
            'comparison-doc-companies',
            'pie-mou-regions',
            'sparkline-monthly-trend'
        ];

        for (const cardId of kpiCardTests) {
            try {
                const container = document.getElementById(cardId);
                this.testResults.push({
                    category: 'KPI Cards',
                    name: `Container '${cardId}' exists`,
                    passed: container !== null
                });

                if (!container) {
                    this.warnings.push(`KPI card container missing: ${cardId}`);
                }
            } catch (error) {
                this.errors.push(`KPI card test error for ${cardId}: ${error.message}`);
            }
        }
    }

    /**
     * Test 5: Check main charts
     */
    async testMainCharts() {
        console.log('📊 Testing main charts...');
        
        const mainChartTests = [
            'topDeficiencyChart',
            'inspectionTrendChart', 
            'fleetCompositionChart',
            'monthlyInspectionChart',
            'mouHeatChart'
        ];

        for (const chartId of mainChartTests) {
            try {
                const container = document.getElementById(chartId);
                this.testResults.push({
                    category: 'Main Charts',
                    name: `Container '${chartId}' exists`,
                    passed: container !== null
                });

                if (!container) {
                    this.warnings.push(`Main chart container missing: ${chartId}`);
                }
            } catch (error) {
                this.errors.push(`Main chart test error for ${chartId}: ${error.message}`);
            }
        }
    }

    /**
     * Test 6: Check interactive features
     */
    async testInteractiveFeatures() {
        console.log('🖱️ Testing interactive features...');
        
        const interactiveTests = [
            {
                name: 'handleChartClick function available',
                test: () => typeof window.handleChartClick === 'function'
            },
            {
                name: 'updateRealTimeData function available',
                test: () => typeof window.updateRealTimeData === 'function'
            },
            {
                name: 'exportChartData function available', 
                test: () => typeof window.exportChartData === 'function'
            },
            {
                name: 'getDashboardStatus function available',
                test: () => typeof window.getDashboardStatus === 'function'
            }
        ];

        for (const test of interactiveTests) {
            try {
                const passed = test.test();
                this.testResults.push({
                    category: 'Interactive Features',
                    name: test.name,
                    passed
                });

                if (!passed) {
                    this.warnings.push(`Interactive feature missing: ${test.name}`);
                }
            } catch (error) {
                this.errors.push(`Interactive feature test error: ${test.name} - ${error.message}`);
            }
        }
    }

    /**
     * Test 7: Check real-time updates
     */
    async testRealTimeUpdates() {
        console.log('🔄 Testing real-time updates...');
        
        try {
            const dashboardIntegration = window.dashboardIntegration;
            
            if (dashboardIntegration) {
                this.testResults.push({
                    category: 'Real-time Updates',
                    name: 'Real-time updates enabled',
                    passed: dashboardIntegration.realTimeInterval !== null
                });

                // Test manual update function
                if (typeof window.manualRefresh === 'function') {
                    this.testResults.push({
                        category: 'Real-time Updates',
                        name: 'Manual refresh function available',
                        passed: true
                    });
                } else {
                    this.warnings.push('Manual refresh function not available');
                }
            }
        } catch (error) {
            this.errors.push(`Real-time updates test error: ${error.message}`);
        }
    }

    /**
     * Test 8: Check error handling
     */
    async testErrorHandling() {
        console.log('⚠️ Testing error handling...');
        
        try {
            // Test chart rendering with invalid container
            const chartSpecialist = window.dashboardIntegration ? window.dashboardIntegration.chartSpecialist : null;
            
            if (chartSpecialist) {
                // This should handle gracefully without throwing
                const result = chartSpecialist.bindKpiChart('non-existent-container', 'sparklineInspections', {});
                
                this.testResults.push({
                    category: 'Error Handling',
                    name: 'Graceful handling of invalid containers',
                    passed: result === null // Should return null for invalid containers
                });
            }

            // Test loading indicator
            const loadingIndicator = document.getElementById('loadingIndicator');
            this.testResults.push({
                category: 'Error Handling',
                name: 'Loading indicator container exists',
                passed: loadingIndicator !== null
            });

        } catch (error) {
            // If error is thrown, error handling needs improvement
            this.errors.push(`Error handling test failed: ${error.message}`);
            this.testResults.push({
                category: 'Error Handling',
                name: 'Error handling test',
                passed: false,
                error: error.message
            });
        }
    }

    /**
     * Wait for dashboard integration to initialize
     */
    async waitForDashboardIntegration(timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkInitialization = () => {
                if (window.dashboardIntegration && window.dashboardIntegration.isInitialized) {
                    resolve(true);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error('Dashboard integration initialization timeout'));
                } else {
                    setTimeout(checkInitialization, 100);
                }
            };
            
            checkInitialization();
        });
    }

    /**
     * Generate validation report
     */
    generateValidationReport() {
        console.log('📋 Generating validation report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.getValidationSummary(),
            details: {
                testResults: this.testResults,
                errors: this.errors,
                warnings: this.warnings
            }
        };

        // Log summary to console
        console.log('✅ Validation Summary:', report.summary);
        
        if (this.errors.length > 0) {
            console.error('❌ Errors found:', this.errors);
        }
        
        if (this.warnings.length > 0) {
            console.warn('⚠️ Warnings:', this.warnings);
        }

        // Store report globally
        window.apexChartsValidationReport = report;
        
        return report;
    }

    /**
     * Get validation summary
     */
    getValidationSummary() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;
        const criticalErrors = this.testResults.filter(test => !test.passed && test.critical).length;
        
        return {
            totalTests,
            passedTests,
            failedTests,
            successRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
            criticalErrors: criticalErrors,
            errors: this.errors.length,
            warnings: this.warnings.length,
            status: criticalErrors > 0 ? 'CRITICAL' : failedTests > 0 ? 'WARNING' : 'SUCCESS'
        };
    }

    /**
     * Export validation report
     */
    exportValidationReport() {
        const report = window.apexChartsValidationReport || this.generateValidationReport();
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'apex-charts-validation-report.json';
        link.click();
        URL.revokeObjectURL(url);
        
        console.log('📊 Validation report exported');
    }
}

// Initialize validator when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for dashboard to initialize
    setTimeout(async () => {
        try {
            console.log('🧪 Starting ApexCharts validation...');
            const validator = new ApexChartsValidator();
            window.apexChartsValidator = validator;
            
            const results = await validator.runCompleteValidation();
            
            console.log(`🎯 Validation completed: ${results.status}`);
            console.log(`📊 Success rate: ${results.successRate}% (${results.passedTests}/${results.totalTests})`);
            
            if (results.status === 'CRITICAL') {
                console.error('🚨 CRITICAL ERRORS FOUND - Dashboard may not function properly');
            }
            
        } catch (error) {
            console.error('❌ Validation suite error:', error);
        }
    }, 3000); // Give dashboard time to initialize
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApexChartsValidator;
}

// Make globally available
window.ApexChartsValidator = ApexChartsValidator;