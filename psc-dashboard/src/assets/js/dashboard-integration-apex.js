/**
 * Dashboard Integration with ChartSpecialist_Apex
 * Complete PSC maritime dashboard implementation
 * Real-time updates and interactive features
 */

class DashboardIntegrationApex {
    constructor() {
        this.chartSpecialist = null;
        this.kpiCards = null;
        this.isInitialized = false;
        this.realTimeInterval = null;
        
        // Bind methods to preserve context
        this.initializeDashboard = this.initializeDashboard.bind(this);
        this.renderDashboardLayout = this.renderDashboardLayout.bind(this);
        this.updateRealTimeData = this.updateRealTimeData.bind(this);
        this.handleChartClick = this.handleChartClick.bind(this);
        this.exportChartData = this.exportChartData.bind(this);
        
        console.log('🎯 DashboardIntegrationApex initialized');
    }

    /**
     * Initialize complete dashboard
     */
    async initializeDashboard() {
        console.log('🚀 Initializing PSC Dashboard with ApexCharts...');

        try {
            // Wait for dependencies
            await this.waitForDependencies();

            // Initialize chart specialist
            this.chartSpecialist = new ChartSpecialistApex();
            await this.waitForChartSpecialist();

            // Initialize KPI cards
            this.kpiCards = new KpiCardsApex(this.chartSpecialist);
            
            // Render dashboard layout
            await this.renderDashboardLayout();
            
            // Start real-time updates
            this.enableRealTimeUpdates();
            
            // Enable performance optimization
            this.chartSpecialist.enablePerformanceOptimization();
            
            this.isInitialized = true;
            console.log('✅ PSC Dashboard initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Error initializing dashboard:', error);
            return false;
        }
    }

    /**
     * Wait for required dependencies to load
     */
    async waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                if (typeof ApexCharts !== 'undefined' && 
                    typeof ChartSpecialistApex !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
        });
    }

    /**
     * Wait for chart specialist to be ready
     */
    async waitForChartSpecialist() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (this.chartSpecialist && this.chartSpecialist.dataCache.size > 0) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            setTimeout(checkReady, 500); // Initial delay for data loading
        });
    }

    /**
     * Render complete dashboard layout
     */
    async renderDashboardLayout() {
        console.log('📊 Rendering dashboard layout...');

        try {
            // Phase 1: Initialize KPI cards
            await this.initializeKpiCards();
            
            // Phase 2: Initialize main charts
            await this.initializeMainCharts();
            
            // Phase 3: Initialize advanced visualizations
            await this.initializeAdvancedCharts();
            
            console.log('✅ Dashboard layout rendered successfully');
        } catch (error) {
            console.error('❌ Error rendering dashboard layout:', error);
        }
    }

    /**
     * Phase 1: Initialize all KPI cards
     */
    async initializeKpiCards() {
        console.log('🎯 Phase 1: Initializing KPI cards...');
        
        try {
            // Initialize all 9 KPI cards
            await this.kpiCards.initializeAllKpiCards();
            
            // Also initialize legacy sparklines for compatibility
            this.kpiCards.initializeSparklines();
            
            console.log('✅ KPI cards initialized');
        } catch (error) {
            console.error('❌ Error initializing KPI cards:', error);
        }
    }

    /**
     * Phase 2: Initialize main dashboard charts
     */
    async initializeMainCharts() {
        console.log('📊 Phase 2: Initializing main charts...');
        
        try {
            // Top 10 Deficiency Bar Chart
            this.chartSpecialist.bindBarChart(
                'topDeficiencyChart', 
                'topDeficiencies', 
                null
            );

            // Monthly Inspection Trend Line Chart
            this.chartSpecialist.bindBarChart(
                'inspectionTrendChart', 
                'monthlyTrend', 
                null
            );

            // Fleet Composition Donut Chart
            this.chartSpecialist.createFleetCompositionDonutOptions('fleetCompositionChart');

            // Monthly Inspection Summary
            this.renderMonthlyInspectionChart();

            console.log('✅ Main charts initialized');
        } catch (error) {
            console.error('❌ Error initializing main charts:', error);
        }
    }

    /**
     * Phase 3: Initialize advanced charts
     */
    async initializeAdvancedCharts() {
        console.log('🔥 Phase 3: Initializing advanced charts...');
        
        try {
            // MOU Heat Table
            this.chartSpecialist.bindHeatTable(
                'mouHeatChart',
                null
            );

            // Port Bubble Map (placeholder)
            this.chartSpecialist.createPortBubbleMap('portBubbleMap');

            console.log('✅ Advanced charts initialized');
        } catch (error) {
            console.error('❌ Error initializing advanced charts:', error);
        }
    }

    /**
     * Render monthly inspection chart
     */
    renderMonthlyInspectionChart() {
        const container = document.getElementById('monthlyInspectionChart');
        if (!container || typeof ApexCharts === 'undefined') {
            console.warn('⚠️ Monthly inspection chart container not found');
            return;
        }

        const monthlyTrends = this.chartSpecialist.dataCache.get('monthlyTrends') || [];
        const inspectionData = monthlyTrends.map(trend => trend.inspections);

        const options = {
            series: [{
                name: 'Inspections',
                data: inspectionData.length > 0 ? inspectionData : [6, 5, 0, 1, 1, 0, 1, 1]
            }],
            chart: {
                type: 'bar',
                height: 300,
                toolbar: { show: false }
            },
            colors: [this.chartSpecialist.pscColors.primary],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    dataLabels: { position: 'top' }
                }
            },
            dataLabels: {
                enabled: true,
                offsetY: -20,
                style: {
                    fontSize: '12px',
                    colors: ['#304758']
                }
            },
            xaxis: {
                categories: monthlyTrends.length > 0 
                    ? monthlyTrends.map(trend => trend.month.split(' ')[0])
                    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
            },
            yaxis: {
                title: { text: 'Number of Inspections' }
            }
        };

        try {
            const chart = new ApexCharts(container, options);
            chart.render();
            this.chartSpecialist.chartInstances.set('monthlyInspectionChart', chart);
            
            console.log('✅ Monthly inspection chart rendered');
        } catch (error) {
            console.error('❌ Error rendering monthly inspection chart:', error);
        }
    }

    /**
     * Real-time data updates
     */
    updateRealTimeData() {
        console.log('🔄 Starting real-time data update...');
        
        if (this.chartSpecialist) {
            this.chartSpecialist.updateRealTimeData();
        }
        
        if (this.kpiCards) {
            this.kpiCards.updateKpiCards();
        }
    }

    /**
     * Enable real-time updates
     */
    enableRealTimeUpdates(interval = 300000) { // 5 minutes
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
        }
        
        this.realTimeInterval = setInterval(() => {
            this.updateRealTimeData();
        }, interval);
        
        console.log(`⏰ Real-time updates enabled (every ${interval/1000}s)`);
    }

    /**
     * Disable real-time updates
     */
    disableRealTimeUpdates() {
        if (this.realTimeInterval) {
            clearInterval(this.realTimeInterval);
            this.realTimeInterval = null;
            console.log('⏸️ Real-time updates disabled');
        }
    }

    /**
     * Handle chart click events for drill-down navigation
     */
    handleChartClick(chartType, dataIndex) {
        console.log('📊 Chart clicked:', { chartType, dataIndex });
        
        const navigationMap = {
            'deficiencies': './deficiencies.html',
            'trends': './inspections.html', 
            'heatmap': './ports-map.html',
            'vessels': './vessels.html',
            'risk': './risk.html'
        };

        if (navigationMap[chartType]) {
            this.navigateWithLoading(navigationMap[chartType]);
        } else {
            console.log('🎯 Chart interaction logged, no navigation defined');
        }
    }

    /**
     * Navigate with loading indicator
     */
    navigateWithLoading(url) {
        this.showLoadingIndicator(true);
        
        setTimeout(() => {
            window.location.href = url;
        }, 500);
    }

    /**
     * Export chart data
     */
    exportChartData(format = 'png') {
        console.log(`📊 Exporting chart data as ${format}...`);
        
        if (!this.chartSpecialist) {
            console.warn('⚠️ Chart specialist not initialized');
            return;
        }

        // Export all charts
        this.chartSpecialist.chartInstances.forEach((chart, chartId) => {
            if (chart && chart.dataURI) {
                this.chartSpecialist.exportChart(chartId, format);
            }
        });

        // Also export KPI data
        if (this.kpiCards) {
            this.kpiCards.exportKpiCardsData('json');
        }

        console.log(`✅ Chart data export completed as ${format}`);
    }

    /**
     * Show/hide loading indicator
     */
    showLoadingIndicator(show) {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Refresh specific chart
     */
    refreshChart(chartId) {
        if (this.chartSpecialist && this.chartSpecialist.chartInstances.has(chartId)) {
            const chart = this.chartSpecialist.chartInstances.get(chartId);
            this.chartSpecialist.refreshChart(chartId, chart);
        }
    }

    /**
     * Get dashboard status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            chartsCount: this.chartSpecialist ? this.chartSpecialist.chartInstances.size : 0,
            kpiCardsLoaded: this.kpiCards !== null,
            realTimeEnabled: this.realTimeInterval !== null,
            dataLoaded: this.chartSpecialist ? this.chartSpecialist.dataCache.size > 0 : false
        };
    }

    /**
     * Debug information
     */
    getDebugInfo() {
        const status = this.getStatus();
        const chartsList = this.chartSpecialist ? 
            Array.from(this.chartSpecialist.chartInstances.keys()) : [];
        
        return {
            ...status,
            chartsList,
            cacheKeys: this.chartSpecialist ? 
                Array.from(this.chartSpecialist.dataCache.keys()) : [],
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Cleanup resources
     */
    destroy() {
        console.log('🧹 Cleaning up dashboard resources...');
        
        // Disable real-time updates
        this.disableRealTimeUpdates();
        
        // Cleanup chart specialist
        if (this.chartSpecialist) {
            this.chartSpecialist.destroy();
        }
        
        // Reset state
        this.chartSpecialist = null;
        this.kpiCards = null;
        this.isInitialized = false;
        
        console.log('✅ Dashboard cleanup completed');
    }
}

// Legacy function implementations for backward compatibility
function renderDashboardLayout() {
    if (window.dashboardIntegration) {
        window.dashboardIntegration.renderDashboardLayout();
    } else {
        console.warn('⚠️ Dashboard integration not initialized');
    }
}

function updateRealTimeData() {
    if (window.dashboardIntegration) {
        window.dashboardIntegration.updateRealTimeData();
    } else {
        console.warn('⚠️ Dashboard integration not initialized');
    }
}

function handleChartClick(chartType, dataIndex) {
    if (window.dashboardIntegration) {
        window.dashboardIntegration.handleChartClick(chartType, dataIndex);
    } else {
        console.warn('⚠️ Dashboard integration not initialized');
    }
}

function exportChartData(format = 'png') {
    if (window.dashboardIntegration) {
        window.dashboardIntegration.exportChartData(format);
    } else {
        console.warn('⚠️ Dashboard integration not initialized');
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing PSC Dashboard Integration...');
    
    try {
        window.dashboardIntegration = new DashboardIntegrationApex();
        const success = await window.dashboardIntegration.initializeDashboard();
        
        if (success) {
            console.log('✅ PSC Dashboard fully operational');
            
            // Log status for debugging
            console.log('📊 Dashboard Status:', window.dashboardIntegration.getStatus());
        } else {
            console.error('❌ Dashboard initialization failed');
        }
    } catch (error) {
        console.error('❌ Critical error during dashboard initialization:', error);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardIntegrationApex;
}

// Make functions globally available
window.renderDashboardLayout = renderDashboardLayout;
window.updateRealTimeData = updateRealTimeData;
window.handleChartClick = handleChartClick;
window.exportChartData = exportChartData;