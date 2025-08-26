/**
 * KPI Cards Component with ApexCharts Integration
 * Implements 9 KPI card charts with proper camelCase naming
 */

class KpiCardsApex {
    constructor(chartSpecialist) {
        this.chartSpecialist = chartSpecialist;
        this.kpiData = null;
        
        // Bind methods to preserve context
        this.initializeSparklines = this.initializeSparklines.bind(this);
        this.renderKpiCard = this.renderKpiCard.bind(this);
        this.updateKpiCards = this.updateKpiCards.bind(this);
        
        console.log('🎯 KpiCardsApex initialized');
    }

    /**
     * Initialize all KPI card charts
     */
    async initializeAllKpiCards() {
        console.log('🚀 Initializing all KPI cards...');

        try {
            // Load KPI data from chart specialist
            this.kpiData = this.chartSpecialist.dataCache.get('kpis');
            
            if (!this.kpiData) {
                console.warn('⚠️ KPI data not available, using defaults');
                this.kpiData = {
                    totalVessels: 14,
                    totalInspections: 30,
                    totalDeficiencies: 87,
                    deficiencyRate: 2.9,
                    detentionRate: 13.3,
                    cleanRate: 20.0,
                    fleetCoverage: 78.6,
                    highRiskVessels: 3,
                    docCompanies: 2,
                    mouRegions: 6
                };
            }

            // Initialize all 9 KPI cards
            this.initializeKpiCard1TotalInspections();
            this.initializeKpiCard2DeficiencyRate();
            this.initializeKpiCard3DetentionRate();
            this.initializeKpiCard4CleanRate();
            this.initializeKpiCard5FleetCoverage();
            this.initializeKpiCard6HighRiskVessels();
            this.initializeKpiCard7DocCompanies();
            this.initializeKpiCard8MouRegions();
            this.initializeKpiCard9MonthlyTrend();

            console.log('✅ All KPI cards initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing KPI cards:', error);
        }
    }

    /**
     * KPI Card 1: Total Inspections with Sparkline Trend
     */
    initializeKpiCard1TotalInspections() {
        const containerId = 'sparkline-inspections';
        const inspectionData = this.kpiData.totalInspections;

        this.chartSpecialist.bindKpiChart(
            containerId, 
            'sparklineInspections', 
            inspectionData
        );

        // Update card content
        this.updateKpiCardContent('total-inspections-value', this.kpiData.totalInspections);
        this.updateKpiCardContent('total-inspections-subtitle', `Clean: 6 (20%)`);
        this.updateKpiCardContent('total-inspections-detail', `With Deficiencies: 24`);

        console.log('✅ KPI Card 1 (Total Inspections) initialized');
    }

    /**
     * KPI Card 2: Deficiency Rate with Gauge Chart
     */
    initializeKpiCard2DeficiencyRate() {
        const containerId = 'gauge-deficiency-rate';
        const deficiencyRateData = this.kpiData.deficiencyRate;

        // Create gauge container if it doesn't exist
        this.createGaugeContainer(containerId);

        this.chartSpecialist.bindKpiChart(
            containerId, 
            'gaugeDeficiencyRate', 
            deficiencyRateData
        );

        // Update card content
        this.updateKpiCardContent('deficiency-rate-value', `${deficiencyRateData}`);
        this.updateKpiCardContent('deficiency-rate-subtitle', `87 def / 30 inspections`);
        this.updateKpiCardContent('deficiency-rate-detail', `Above industry avg`);

        console.log('✅ KPI Card 2 (Deficiency Rate) initialized');
    }

    /**
     * KPI Card 3: Detention Rate with Progress Bar
     */
    initializeKpiCard3DetentionRate() {
        const containerId = 'progress-detention-rate';
        const detentionRateData = this.kpiData.detentionRate;

        // Create progress container if it doesn't exist
        this.createProgressContainer(containerId);

        this.chartSpecialist.bindKpiChart(
            containerId, 
            'progressDetentionRate', 
            detentionRateData
        );

        // Update card content
        this.updateKpiCardContent('detention-rate-value', `${detentionRateData}%`);
        this.updateKpiCardContent('detention-rate-subtitle', `4 detentions / 30 inspections`);
        this.updateKpiCardContent('detention-rate-detail', `High risk fleet`);

        console.log('✅ KPI Card 3 (Detention Rate) initialized');
    }

    /**
     * KPI Card 4: Clean Rate with Radial Bar
     */
    initializeKpiCard4CleanRate() {
        const containerId = 'radial-clean-rate';
        const cleanRateData = this.kpiData.cleanRate;

        // Create radial container if it doesn't exist
        this.createRadialContainer(containerId);

        this.chartSpecialist.bindKpiChart(
            containerId, 
            'radialCleanRate', 
            cleanRateData
        );

        // Update card content
        this.updateKpiCardContent('clean-rate-value', `${cleanRateData}%`);
        this.updateKpiCardContent('clean-rate-subtitle', `6 clean / 30 total`);
        this.updateKpiCardContent('clean-rate-detail', `Needs improvement`);

        console.log('✅ KPI Card 4 (Clean Rate) initialized');
    }

    /**
     * KPI Card 5: Fleet Coverage with Donut Chart
     */
    initializeKpiCard5FleetCoverage() {
        const containerId = 'donut-fleet-coverage';
        const fleetCoverageData = this.kpiData.fleetCoverage;

        // Create donut container if it doesn't exist
        this.createDonutContainer(containerId);

        this.chartSpecialist.bindKpiChart(
            containerId, 
            'donutFleetCoverage', 
            fleetCoverageData
        );

        // Update card content
        this.updateKpiCardContent('fleet-coverage-value', `${fleetCoverageData}%`);
        this.updateKpiCardContent('fleet-coverage-subtitle', `11 of 14 vessels`);
        this.updateKpiCardContent('fleet-coverage-detail', `Good coverage`);

        console.log('✅ KPI Card 5 (Fleet Coverage) initialized');
    }

    /**
     * KPI Card 6: High Risk Vessels with Bar Chart
     */
    initializeKpiCard6HighRiskVessels() {
        const containerId = 'bar-high-risk-vessels';
        const highRiskData = this.kpiData.highRiskVessels;

        // Create bar container if it doesn't exist
        this.createBarContainer(containerId);

        this.chartSpecialist.bindKpiChart(
            containerId, 
            'barHighRisk', 
            highRiskData
        );

        // Update card content
        this.updateKpiCardContent('high-risk-value', `${highRiskData}`);
        this.updateKpiCardContent('high-risk-subtitle', `21% of fleet at risk`);
        this.updateKpiCardContent('high-risk-detail', `Detention or 5+ deficiencies`);

        console.log('✅ KPI Card 6 (High Risk Vessels) initialized');
    }

    /**
     * KPI Card 7: DOC Companies with Comparison Chart
     */
    initializeKpiCard7DocCompanies() {
        const containerId = 'comparison-doc-companies';
        const docCompaniesData = this.kpiData.docCompanies;

        // Create comparison container if it doesn't exist
        this.createComparisonContainer(containerId);

        this.chartSpecialist.bindKpiChart(
            containerId, 
            'comparisonDocCompanies', 
            docCompaniesData
        );

        // Update card content
        this.updateKpiCardContent('doc-companies-value', `${docCompaniesData}`);
        this.updateKpiCardContent('doc-companies-subtitle', `DORIKO: 12 vessels`);
        this.updateKpiCardContent('doc-companies-detail', `DOUBLERICH: 2 vessels`);

        console.log('✅ KPI Card 7 (DOC Companies) initialized');
    }

    /**
     * KPI Card 8: MOU Regions with Distribution Pie
     */
    initializeKpiCard8MouRegions() {
        const containerId = 'pie-mou-regions';
        const mouRegionsData = this.kpiData.mouRegions;

        // Create pie container if it doesn't exist
        this.createPieContainer(containerId);

        this.chartSpecialist.bindKpiChart(
            containerId, 
            'pieMouseRegions', 
            mouRegionsData
        );

        // Update card content
        this.updateKpiCardContent('mou-regions-value', `${mouRegionsData}`);
        this.updateKpiCardContent('mou-regions-subtitle', `Tokyo MoU: 12 inspections`);
        this.updateKpiCardContent('mou-regions-detail', `Global coverage`);

        console.log('✅ KPI Card 8 (MOU Regions) initialized');
    }

    /**
     * KPI Card 9: Monthly Trend with Line Sparkline
     */
    initializeKpiCard9MonthlyTrend() {
        const containerId = 'sparkline-monthly-trend';
        const monthlyTrendData = this.kpiData.totalInspections;

        this.chartSpecialist.bindKpiChart(
            containerId, 
            'trendlineMonthly', 
            monthlyTrendData
        );

        // Update card content
        this.updateKpiCardContent('monthly-trend-value', 'Stable');
        this.updateKpiCardContent('monthly-trend-subtitle', `Avg: 3.75 per month`);
        this.updateKpiCardContent('monthly-trend-detail', `Peak: Feb (5)`);

        console.log('✅ KPI Card 9 (Monthly Trend) initialized');
    }

    /**
     * Legacy sparklines initialization for compatibility
     */
    initializeSparklines() {
        console.log('🔄 Initializing legacy sparklines...');
        
        // Initialize existing sparkline containers
        const sparklineContainers = [
            'sparkline-vessels',
            'sparkline-inspections', 
            'sparkline-deficiencies',
            'sparkline-deficiency-rate',
            'sparkline-detentions',
            'sparkline-detention-rate',
            'sparkline-avg-def-vessel',
            'sparkline-top-def-code',
            'sparkline-high-risk'
        ];

        sparklineContainers.forEach(containerId => {
            this.createLegacySparkline(containerId);
        });
    }

    /**
     * Create legacy sparkline for existing containers
     */
    createLegacySparkline(containerId) {
        const container = document.getElementById(containerId);
        if (!container || typeof ApexCharts === 'undefined') return;

        const options = {
            series: [{
                name: 'Trend',
                data: [8, 12, 6, 9, 15, 10, 7, 11]
            }],
            chart: {
                type: 'line',
                width: 100,
                height: 35,
                sparkline: { enabled: true }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            colors: [this.chartSpecialist.pscColors.primary],
            tooltip: {
                enabled: true,
                theme: 'dark',
                x: { show: false },
                y: {
                    title: { formatter: () => 'Value: ' }
                }
            }
        };

        try {
            const chart = new ApexCharts(container, options);
            chart.render();
            this.chartSpecialist.chartInstances.set(containerId, chart);
        } catch (error) {
            console.error(`❌ Error creating legacy sparkline ${containerId}:`, error);
        }
    }

    /**
     * Helper methods to create chart containers
     */
    createGaugeContainer(containerId) {
        this.createChartContainer(containerId, 'gauge-chart');
    }

    createProgressContainer(containerId) {
        this.createChartContainer(containerId, 'progress-chart');
    }

    createRadialContainer(containerId) {
        this.createChartContainer(containerId, 'radial-chart');
    }

    createDonutContainer(containerId) {
        this.createChartContainer(containerId, 'donut-chart');
    }

    createBarContainer(containerId) {
        this.createChartContainer(containerId, 'bar-chart');
    }

    createComparisonContainer(containerId) {
        this.createChartContainer(containerId, 'comparison-chart');
    }

    createPieContainer(containerId) {
        this.createChartContainer(containerId, 'pie-chart');
    }

    /**
     * Generic method to create chart containers
     */
    createChartContainer(containerId, className = 'chart-container') {
        let container = document.getElementById(containerId);
        
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = className;
            container.style.height = '150px';
            
            // Try to find a parent element to append to
            const parentElement = document.querySelector('.ms-auto') || document.body;
            parentElement.appendChild(container);
            
            console.log(`📊 Created chart container: ${containerId}`);
        }
        
        return container;
    }

    /**
     * Update KPI card content
     */
    updateKpiCardContent(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * Update all KPI cards with fresh data
     */
    async updateKpiCards() {
        console.log('🔄 Updating all KPI cards...');
        
        try {
            // Reload data
            await this.chartSpecialist.loadActualData();
            this.kpiData = this.chartSpecialist.dataCache.get('kpis');
            
            // Re-initialize all cards
            await this.initializeAllKpiCards();
            
            console.log('✅ All KPI cards updated successfully');
        } catch (error) {
            console.error('❌ Error updating KPI cards:', error);
        }
    }

    /**
     * Render specific KPI card
     */
    renderKpiCard(cardNumber, data) {
        switch (cardNumber) {
            case 1: this.initializeKpiCard1TotalInspections(); break;
            case 2: this.initializeKpiCard2DeficiencyRate(); break;
            case 3: this.initializeKpiCard3DetentionRate(); break;
            case 4: this.initializeKpiCard4CleanRate(); break;
            case 5: this.initializeKpiCard5FleetCoverage(); break;
            case 6: this.initializeKpiCard6HighRiskVessels(); break;
            case 7: this.initializeKpiCard7DocCompanies(); break;
            case 8: this.initializeKpiCard8MouRegions(); break;
            case 9: this.initializeKpiCard9MonthlyTrend(); break;
            default:
                console.warn(`Unknown KPI card number: ${cardNumber}`);
        }
    }

    /**
     * Get KPI card data
     */
    getKpiCardData(cardType) {
        if (!this.kpiData) return null;
        
        return this.kpiData[cardType] || null;
    }

    /**
     * Export KPI cards data
     */
    exportKpiCardsData(format = 'json') {
        const data = {
            timestamp: new Date().toISOString(),
            kpiData: this.kpiData,
            charts: Array.from(this.chartSpecialist.chartInstances.keys())
        };

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'psc-kpi-cards-data.json';
            link.click();
            URL.revokeObjectURL(url);
        }

        console.log(`📊 KPI cards data exported as ${format}`);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KpiCardsApex;
}

// Make available globally
window.KpiCardsApex = KpiCardsApex;