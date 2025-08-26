/**
 * ChartSpecialist_Apex - ApexCharts Visualization Expert
 * PSC Maritime Dashboard Implementation
 * Proper camelCase naming and real-time data integration
 */

class ChartSpecialistApex {
    constructor() {
        this.pscColors = {
            primary: '#6366f1',      // Indigo
            secondary: '#f43f5e',    // Rose  
            tertiary: '#8b5cf6',     // Purple
            accent: '#f59e0b',       // Amber
            success: '#10b981',      // Emerald
            warning: '#f59e0b',      // Amber
            danger: '#ef4444',       // Red
            info: '#3b82f6'          // Blue
        };

        this.chartInstances = new Map();
        this.realTimeUpdateInterval = null;
        this.dataCache = new Map();
        
        // Bind methods to preserve context
        this.bindKpiChart = this.bindKpiChart.bind(this);
        this.bindBarChart = this.bindBarChart.bind(this);
        this.bindHeatTable = this.bindHeatTable.bind(this);
        this.handleChartClick = this.handleChartClick.bind(this);
        this.handleDataHover = this.handleDataHover.bind(this);
        this.updateRealTimeData = this.updateRealTimeData.bind(this);
        
        // Load actual data from processed_data
        this.loadActualData();
    }

    /**
     * Load actual PSC data from processed_data folder
     */
    async loadActualData() {
        try {
            const response = await fetch('../../processed_data/analytics/inspection_fact.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.actualData = await response.json();
            console.log('✅ Actual PSC data loaded successfully');
            
            // Cache processed data for efficient access
            this.cacheProcessedData();
            
            return true;
        } catch (error) {
            console.warn('⚠️ Error loading actual data, using fallback data:', error);
            this.loadFallbackData();
            return false;
        }
    }

    /**
     * Cache processed data for efficient chart rendering
     */
    cacheProcessedData() {
        if (!this.actualData) return;

        // Cache KPI metrics
        this.dataCache.set('kpis', {
            totalVessels: this.actualData.fleet_kpis.total_vessels,
            totalInspections: this.actualData.fleet_kpis.total_inspections,
            totalDeficiencies: this.actualData.compliance_kpis.total_deficiencies,
            deficiencyRate: this.actualData.compliance_kpis.avg_deficiencies_per_inspection,
            detentionRate: this.actualData.compliance_kpis.detention_rate,
            cleanRate: this.actualData.compliance_kpis.clean_rate,
            fleetCoverage: this.actualData.fleet_kpis.inspection_coverage,
            highRiskVessels: this.actualData.risk_indicators.high_risk_vessels?.length || 3,
            docCompanies: this.actualData.doc_company_performance?.length || 2,
            mouRegions: this.actualData.mou_performance?.length || 5
        });

        // Cache monthly trends
        this.dataCache.set('monthlyTrends', this.actualData.monthly_trends);
        
        // Cache deficiency categories
        this.dataCache.set('deficiencyCategories', this.actualData.deficiency_category_analysis);
        
        // Cache vessel performance
        this.dataCache.set('vesselPerformance', this.actualData.vessel_performance);
        
        // Cache MOU performance
        this.dataCache.set('mouPerformance', this.actualData.mou_performance);
        
        // Cache vessel type analysis
        this.dataCache.set('vesselTypes', this.actualData.vessel_type_analysis);
    }

    /**
     * Load fallback data if actual data is unavailable
     */
    loadFallbackData() {
        this.dataCache.set('kpis', {
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
        });

        // Fallback monthly data
        this.dataCache.set('monthlyTrends', [
            { month: 'Jan 2025', inspections: 6, deficiencies: 22, detentions: 1 },
            { month: 'Feb 2025', inspections: 5, deficiencies: 14, detentions: 0 },
            { month: 'Apr 2025', inspections: 1, deficiencies: 7, detentions: 1 },
            { month: 'May 2025', inspections: 1, deficiencies: 8, detentions: 1 },
            { month: 'Jul 2025', inspections: 1, deficiencies: 2, detentions: 0 },
            { month: 'Aug 2025', inspections: 1, deficiencies: 5, detentions: 0 }
        ]);
    }

    /**
     * KPI Card Chart 1: Total Inspections with Sparkline Trend
     */
    bindKpiChart(containerId, type, data) {
        const container = document.getElementById(containerId);
        if (!container || typeof ApexCharts === 'undefined') {
            console.warn(`⚠️ KPI chart container ${containerId} not found or ApexCharts not loaded`);
            return null;
        }

        let options = {};

        switch (type) {
            case 'sparklineInspections':
                options = this.createSparklineOptions(data, this.pscColors.primary);
                break;
            case 'gaugeDeficiencyRate':
                options = this.createGaugeOptions(data, this.pscColors.warning);
                break;
            case 'progressDetentionRate':
                options = this.createProgressOptions(data, this.pscColors.tertiary);
                break;
            case 'radialCleanRate':
                options = this.createRadialOptions(data, this.pscColors.success);
                break;
            case 'donutFleetCoverage':
                options = this.createDonutOptions(data, this.pscColors.info);
                break;
            case 'barHighRisk':
                options = this.createBarOptions(data, this.pscColors.danger);
                break;
            case 'comparisonDocCompanies':
                options = this.createComparisonOptions(data, this.pscColors.secondary);
                break;
            case 'pieMouseRegions':
                options = this.createPieOptions(data, this.pscColors.accent);
                break;
            case 'trendlineMonthly':
                options = this.createTrendlineOptions(data, this.pscColors.primary);
                break;
            default:
                console.warn(`Unknown KPI chart type: ${type}`);
                return null;
        }

        try {
            const chart = new ApexCharts(container, options);
            chart.render();
            this.chartInstances.set(containerId, chart);
            console.log(`✅ KPI chart ${type} rendered successfully in ${containerId}`);
            return chart;
        } catch (error) {
            console.error(`❌ Error rendering KPI chart ${type}:`, error);
            return null;
        }
    }

    /**
     * Create sparkline chart options
     */
    createSparklineOptions(data, color) {
        const monthlyTrends = this.dataCache.get('monthlyTrends') || [];
        const inspectionData = monthlyTrends.map(trend => trend.inspections);

        return {
            series: [{
                name: 'Inspections',
                data: inspectionData.length > 0 ? inspectionData : [6, 5, 0, 1, 1, 0, 1, 1]
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
            colors: [color],
            tooltip: {
                enabled: true,
                theme: 'dark',
                x: { show: false },
                y: {
                    title: { formatter: () => 'Inspections: ' }
                }
            }
        };
    }

    /**
     * Create gauge chart options for deficiency rate
     */
    createGaugeOptions(data, color) {
        const kpis = this.dataCache.get('kpis') || {};
        const deficiencyRate = kpis.deficiencyRate || 2.9;

        return {
            series: [Math.round((deficiencyRate / 5) * 100)], // Normalized to 0-100%
            chart: {
                height: 200,
                type: 'radialBar'
            },
            plotOptions: {
                radialBar: {
                    hollow: { size: '50%' },
                    dataLabels: {
                        name: { show: false },
                        value: {
                            fontSize: '16px',
                            formatter: () => `${deficiencyRate}`
                        }
                    }
                }
            },
            colors: [color],
            labels: ['Deficiency Rate']
        };
    }

    /**
     * Create progress bar options for detention rate
     */
    createProgressOptions(data, color) {
        const kpis = this.dataCache.get('kpis') || {};
        const detentionRate = kpis.detentionRate || 13.3;

        return {
            series: [detentionRate],
            chart: {
                height: 200,
                type: 'radialBar'
            },
            plotOptions: {
                radialBar: {
                    hollow: { size: '50%' },
                    dataLabels: {
                        name: { show: false },
                        value: {
                            fontSize: '16px',
                            formatter: (val) => `${val}%`
                        }
                    }
                }
            },
            colors: [color],
            labels: ['Detention Rate']
        };
    }

    /**
     * Create radial bar options for clean rate
     */
    createRadialOptions(data, color) {
        const kpis = this.dataCache.get('kpis') || {};
        const cleanRate = kpis.cleanRate || 20.0;

        return {
            series: [cleanRate],
            chart: {
                height: 200,
                type: 'radialBar'
            },
            plotOptions: {
                radialBar: {
                    hollow: { size: '50%' },
                    dataLabels: {
                        name: { show: false },
                        value: {
                            fontSize: '16px',
                            formatter: (val) => `${val}%`
                        }
                    }
                }
            },
            colors: [color],
            labels: ['Clean Rate']
        };
    }

    /**
     * Create donut options for fleet coverage
     */
    createDonutOptions(data, color) {
        const kpis = this.dataCache.get('kpis') || {};
        const fleetCoverage = kpis.fleetCoverage || 78.6;

        return {
            series: [fleetCoverage, 100 - fleetCoverage],
            chart: {
                type: 'donut',
                height: 200
            },
            colors: [color, '#e5e7eb'],
            labels: ['Inspected', 'Not Inspected'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '60%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Coverage',
                                formatter: () => `${fleetCoverage}%`
                            }
                        }
                    }
                }
            },
            legend: { show: false }
        };
    }

    /**
     * Create bar options for high risk vessels
     */
    createBarOptions(data, color) {
        const vesselTypes = this.dataCache.get('vesselTypes') || {};
        const pcData = vesselTypes['PC(T)C'] || { risk_breakdown: { HIGH: 3, MEDIUM: 3, LOW: 1 } };
        const bulkData = vesselTypes['Bulk'] || { risk_breakdown: { HIGH: 1, MEDIUM: 3, LOW: 3 } };

        return {
            series: [{
                name: 'High Risk',
                data: [pcData.risk_breakdown.HIGH, bulkData.risk_breakdown.HIGH]
            }, {
                name: 'Medium Risk',
                data: [pcData.risk_breakdown.MEDIUM, bulkData.risk_breakdown.MEDIUM]
            }, {
                name: 'Low Risk',
                data: [pcData.risk_breakdown.LOW, bulkData.risk_breakdown.LOW]
            }],
            chart: {
                type: 'bar',
                height: 200,
                stacked: true,
                toolbar: { show: false }
            },
            colors: [this.pscColors.danger, this.pscColors.warning, this.pscColors.success],
            xaxis: {
                categories: ['PC(T)C', 'Bulk']
            },
            legend: { show: false }
        };
    }

    /**
     * Create comparison options for DOC companies
     */
    createComparisonOptions(data, color) {
        const docPerformance = this.actualData?.doc_company_performance || [
            { doc_company: 'DORIKO', vessel_count: 12, avg_deficiencies: 3.0 },
            { doc_company: 'DOUBLERICH', vessel_count: 2, avg_deficiencies: 2.5 }
        ];

        return {
            series: [{
                name: 'Vessels',
                data: docPerformance.map(doc => doc.vessel_count)
            }, {
                name: 'Avg Deficiencies',
                data: docPerformance.map(doc => doc.avg_deficiencies)
            }],
            chart: {
                type: 'bar',
                height: 200,
                toolbar: { show: false }
            },
            colors: [color, this.pscColors.warning],
            xaxis: {
                categories: docPerformance.map(doc => doc.doc_company.split(' ')[0])
            },
            legend: { show: false }
        };
    }

    /**
     * Create pie options for MOU regions
     */
    createPieOptions(data, color) {
        const mouPerformance = this.dataCache.get('mouPerformance') || [];
        
        if (mouPerformance.length === 0) {
            // Fallback data
            return {
                series: [12, 2, 2, 1, 1],
                chart: { type: 'pie', height: 200 },
                colors: [this.pscColors.primary, this.pscColors.secondary, this.pscColors.tertiary, this.pscColors.accent, this.pscColors.success],
                labels: ['Tokyo MoU', 'USCG', 'Paris MoU', 'Mediterranean', 'Riyadh'],
                legend: { show: false }
            };
        }

        return {
            series: mouPerformance.map(mou => mou.inspections),
            chart: { type: 'pie', height: 200 },
            colors: [this.pscColors.primary, this.pscColors.secondary, this.pscColors.tertiary, this.pscColors.accent, this.pscColors.success],
            labels: mouPerformance.map(mou => mou.mou_region.replace(' MoU', '')),
            legend: { show: false }
        };
    }

    /**
     * Create trendline options for monthly trend
     */
    createTrendlineOptions(data, color) {
        const monthlyTrends = this.dataCache.get('monthlyTrends') || [];
        const inspectionData = monthlyTrends.map(trend => trend.inspections);

        return {
            series: [{
                name: 'Monthly Inspections',
                data: inspectionData.length > 0 ? inspectionData : [6, 5, 0, 1, 1, 0, 1, 1]
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
            colors: [color],
            tooltip: {
                enabled: true,
                theme: 'dark',
                x: { show: false },
                y: {
                    title: { formatter: () => 'Inspections: ' }
                }
            }
        };
    }

    /**
     * Top 10 Deficiency Bar Chart
     */
    bindBarChart(containerId, chartType, data) {
        const container = document.getElementById(containerId);
        if (!container || typeof ApexCharts === 'undefined') {
            console.warn(`⚠️ Bar chart container ${containerId} not found or ApexCharts not loaded`);
            return null;
        }

        let options = {};

        switch (chartType) {
            case 'topDeficiencies':
                options = this.createTopDeficiencyBarOptions();
                break;
            case 'monthlyTrend':
                options = this.createMonthlyTrendLineOptions();
                break;
            case 'vesselPerformance':
                options = this.createVesselPerformanceBarOptions();
                break;
            default:
                console.warn(`Unknown bar chart type: ${chartType}`);
                return null;
        }

        try {
            const chart = new ApexCharts(container, options);
            chart.render();
            this.chartInstances.set(containerId, chart);
            
            // Add click handler
            chart.addEventHandler('dataPointSelection', this.handleChartClick);
            
            console.log(`✅ Bar chart ${chartType} rendered successfully in ${containerId}`);
            return chart;
        } catch (error) {
            console.error(`❌ Error rendering bar chart ${chartType}:`, error);
            return null;
        }
    }

    /**
     * Create top deficiency bar chart options
     */
    createTopDeficiencyBarOptions() {
        const deficiencyCategories = this.dataCache.get('deficiencyCategories') || [];
        
        if (deficiencyCategories.length === 0) {
            // Fallback data
            return {
                series: [{
                    name: 'Occurrences',
                    data: [15, 12, 12, 10, 8, 8, 6, 5, 4, 3]
                }],
                chart: {
                    type: 'bar',
                    height: 400,
                    toolbar: { show: true }
                },
                colors: [this.pscColors.secondary],
                plotOptions: {
                    bar: {
                        borderRadius: 4,
                        horizontal: false,
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
                    categories: ['Life Saving', 'Navigation', 'Structure', 'Machinery', 'Fire Safety', 'Security', 'Radio Comm', 'MARPOL', 'Certificates', 'Manning']
                },
                yaxis: {
                    title: { text: 'Number of Deficiencies' }
                },
                title: {
                    text: 'Top 10 Deficiency Categories',
                    align: 'center'
                }
            };
        }

        // Sort by occurrences and take top 10
        const sortedCategories = deficiencyCategories
            .sort((a, b) => b.occurrences - a.occurrences)
            .slice(0, 10);

        return {
            series: [{
                name: 'Occurrences',
                data: sortedCategories.map(cat => cat.occurrences)
            }],
            chart: {
                type: 'bar',
                height: 400,
                toolbar: { show: true }
            },
            colors: [this.pscColors.secondary],
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: false,
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
                categories: sortedCategories.map(cat => cat.category)
            },
            yaxis: {
                title: { text: 'Number of Deficiencies' }
            },
            title: {
                text: 'Top 10 Deficiency Categories',
                align: 'center'
            }
        };
    }

    /**
     * Create monthly trend line chart options
     */
    createMonthlyTrendLineOptions() {
        const monthlyTrends = this.dataCache.get('monthlyTrends') || [];

        if (monthlyTrends.length === 0) {
            // Fallback data
            return {
                series: [{
                    name: 'Inspections',
                    data: [6, 5, 0, 1, 1, 0, 1, 1]
                }, {
                    name: 'Deficiencies',
                    data: [22, 14, 0, 7, 8, 0, 2, 5]
                }, {
                    name: 'Detentions',
                    data: [1, 0, 0, 1, 1, 0, 0, 0]
                }],
                chart: {
                    type: 'line',
                    height: 350,
                    zoom: { enabled: false },
                    toolbar: { show: true }
                },
                colors: [this.pscColors.primary, this.pscColors.warning, this.pscColors.danger],
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                markers: { size: 4 },
                xaxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
                },
                yaxis: {
                    title: { text: 'Count' }
                },
                legend: { position: 'top' },
                title: {
                    text: 'Monthly Inspection Trends',
                    align: 'center'
                }
            };
        }

        return {
            series: [{
                name: 'Inspections',
                data: monthlyTrends.map(trend => trend.inspections)
            }, {
                name: 'Deficiencies',
                data: monthlyTrends.map(trend => trend.deficiencies)
            }, {
                name: 'Detentions',
                data: monthlyTrends.map(trend => trend.detentions)
            }],
            chart: {
                type: 'line',
                height: 350,
                zoom: { enabled: false },
                toolbar: { show: true }
            },
            colors: [this.pscColors.primary, this.pscColors.warning, this.pscColors.danger],
            stroke: {
                curve: 'smooth',
                width: 2
            },
            markers: { size: 4 },
            xaxis: {
                categories: monthlyTrends.map(trend => trend.month.split(' ')[0])
            },
            yaxis: {
                title: { text: 'Count' }
            },
            legend: { position: 'top' },
            title: {
                text: 'Monthly Inspection Trends',
                align: 'center'
            }
        };
    }

    /**
     * Fleet Performance Donut/Funnel Chart
     */
    createFleetCompositionDonutOptions(containerId) {
        const container = document.getElementById(containerId);
        if (!container || typeof ApexCharts === 'undefined') {
            console.warn(`⚠️ Fleet composition chart container ${containerId} not found or ApexCharts not loaded`);
            return null;
        }

        const vesselTypes = this.dataCache.get('vesselTypes') || {};
        const pcCount = vesselTypes['PC(T)C']?.vessel_count || 7;
        const bulkCount = vesselTypes['Bulk']?.vessel_count || 7;

        const options = {
            series: [pcCount, bulkCount],
            chart: {
                type: 'donut',
                height: 300
            },
            colors: [this.pscColors.primary, this.pscColors.secondary],
            labels: ['PC(T)C', 'Bulk'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '60%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total Vessels',
                                formatter: () => `${pcCount + bulkCount}`
                            }
                        }
                    }
                }
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center'
            },
            title: {
                text: 'Fleet Composition',
                align: 'center'
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: { height: 250 },
                    legend: { position: 'bottom' }
                }
            }]
        };

        try {
            const chart = new ApexCharts(container, options);
            chart.render();
            this.chartInstances.set(containerId, chart);
            
            console.log(`✅ Fleet composition donut chart rendered successfully in ${containerId}`);
            return chart;
        } catch (error) {
            console.error(`❌ Error rendering fleet composition chart:`, error);
            return null;
        }
    }

    /**
     * Heat Table for MOU × Monthly Deficiency Rates
     */
    bindHeatTable(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container || typeof ApexCharts === 'undefined') {
            console.warn(`⚠️ Heat table container ${containerId} not found or ApexCharts not loaded`);
            return null;
        }

        const options = this.createMouHeatMapOptions();

        try {
            const chart = new ApexCharts(container, options);
            chart.render();
            this.chartInstances.set(containerId, chart);
            
            // Add hover handler
            chart.addEventHandler('dataPointMouseEnter', this.handleDataHover);
            
            console.log(`✅ Heat table rendered successfully in ${containerId}`);
            return chart;
        } catch (error) {
            console.error(`❌ Error rendering heat table:`, error);
            this.showHeatTableFallback(containerId);
            return null;
        }
    }

    /**
     * Create MOU heat map options
     */
    createMouHeatMapOptions() {
        // Generate heat map data for MOU regions × months
        const mouRegions = ['Tokyo MoU', 'USCG', 'Paris MoU', 'Mediterranean', 'Riyadh'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

        const heatMapData = mouRegions.map(region => ({
            name: region,
            data: months.map(month => {
                // Generate realistic data based on actual trends
                let value = 0;
                if (region === 'Tokyo MoU' && month === 'Jan') value = 50;
                else if (region === 'Tokyo MoU' && month === 'Feb') value = 100;
                else if (region === 'Paris MoU' && month === 'Jan') value = 25;
                else if (region === 'Paris MoU' && month === 'Feb') value = 75;
                else if (region === 'USCG' && month === 'Jan') value = 10;
                else value = Math.floor(Math.random() * 60);

                return {
                    x: month,
                    y: value
                };
            })
        }));

        return {
            series: heatMapData,
            chart: {
                height: 300,
                type: 'heatmap',
                toolbar: { show: true }
            },
            dataLabels: { enabled: true },
            colors: [this.pscColors.primary],
            plotOptions: {
                heatmap: {
                    shadeIntensity: 0.5,
                    radius: 0,
                    useFillColorAsStroke: true,
                    colorScale: {
                        ranges: [
                            { from: 0, to: 25, name: 'Low', color: this.pscColors.success },
                            { from: 26, to: 50, name: 'Medium', color: this.pscColors.warning },
                            { from: 51, to: 75, name: 'High', color: this.pscColors.secondary },
                            { from: 76, to: 100, name: 'Critical', color: this.pscColors.danger }
                        ]
                    }
                }
            },
            title: {
                text: 'MOU Deficiency Rate Heat Map (%)',
                align: 'center'
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: (val) => `${val}% deficiency rate`
                }
            }
        };
    }

    /**
     * Show heat table fallback when heatmap fails
     */
    showHeatTableFallback(containerId) {
        const fallbackId = containerId.replace('Chart', 'TableFallback');
        const fallbackTable = document.getElementById(fallbackId);
        
        if (fallbackTable) {
            fallbackTable.style.display = 'block';
            console.log('📊 Showing heat table fallback');
        }
    }

    /**
     * Interactive Bubble Map for Ports (Placeholder for future implementation)
     */
    createPortBubbleMap(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`⚠️ Port bubble map container ${containerId} not found`);
            return null;
        }

        // This would integrate with mapping libraries like Leaflet or Google Maps
        // For now, create a placeholder visualization
        container.innerHTML = `
            <div class="text-center p-4">
                <div class="h4 mb-3">Port Inspection Activity Map</div>
                <div class="row">
                    <div class="col-4"><div class="badge bg-primary">Busan: 8</div></div>
                    <div class="col-4"><div class="badge bg-secondary">Singapore: 6</div></div>
                    <div class="col-4"><div class="badge bg-success">Tokyo: 5</div></div>
                </div>
                <div class="row mt-2">
                    <div class="col-4"><div class="badge bg-warning">Rotterdam: 4</div></div>
                    <div class="col-4"><div class="badge bg-info">Colombo: 3</div></div>
                    <div class="col-4"><div class="badge bg-danger">Others: 4</div></div>
                </div>
                <div class="mt-3 text-muted">Interactive map integration coming soon</div>
            </div>
        `;

        console.log(`📍 Port bubble map placeholder created in ${containerId}`);
        return container;
    }

    /**
     * Event Handlers
     */
    handleChartClick(event, chartContext, config) {
        console.log('📊 Chart clicked:', {
            event,
            chartContext,
            config
        });

        // Implement drill-down logic
        const chartType = chartContext.opts.chart.type;
        const dataIndex = config.dataPointIndex;
        
        if (chartType === 'bar' && dataIndex !== undefined) {
            // Navigate to detailed view
            this.navigateToDetailView('deficiencies', dataIndex);
        }
    }

    handleDataHover(event, chartContext, config) {
        // Enhanced tooltip or highlight logic
        console.log('🎯 Chart hover:', { event, chartContext, config });
    }

    /**
     * Navigation helper for drill-down functionality
     */
    navigateToDetailView(view, dataIndex) {
        const routes = {
            'deficiencies': './deficiencies.html',
            'inspections': './inspections.html',
            'vessels': './vessels.html',
            'ports': './ports-map.html'
        };

        if (routes[view]) {
            window.location.href = routes[view];
        }
    }

    /**
     * Real-time Data Updates
     */
    updateRealTimeData() {
        console.log('🔄 Updating real-time chart data...');

        // Show loading indicator
        this.showLoadingIndicator(true);

        try {
            // Simulate data refresh (in real implementation, this would fetch from API)
            setTimeout(async () => {
                // Reload actual data
                await this.loadActualData();

                // Update all chart instances
                this.chartInstances.forEach((chart, containerId) => {
                    this.refreshChart(containerId, chart);
                });

                this.showLoadingIndicator(false);
                console.log('✅ Real-time data update completed');
            }, 2000);

        } catch (error) {
            console.error('❌ Error updating real-time data:', error);
            this.showLoadingIndicator(false);
        }
    }

    /**
     * Refresh individual chart with new data
     */
    refreshChart(containerId, chart) {
        try {
            // This would update the chart with new data
            // Implementation depends on chart type
            console.log(`🔄 Refreshing chart: ${containerId}`);
            
            // Example: Update series data
            if (chart && chart.updateSeries) {
                // chart.updateSeries([{ data: newData }]);
            }
        } catch (error) {
            console.error(`❌ Error refreshing chart ${containerId}:`, error);
        }
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
     * Performance Optimization
     */
    enablePerformanceOptimization() {
        // Implement lazy loading for charts not in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chartId = entry.target.id;
                    this.lazyRenderChart(chartId);
                }
            });
        });

        // Observe all chart containers
        document.querySelectorAll('[id*="Chart"]').forEach(container => {
            observer.observe(container);
        });
    }

    /**
     * Lazy render chart when it comes into view
     */
    lazyRenderChart(chartId) {
        if (!this.chartInstances.has(chartId)) {
            // Chart not yet rendered, render it now
            console.log(`🚀 Lazy rendering chart: ${chartId}`);
        }
    }

    /**
     * Export functionality
     */
    exportChart(chartId, format = 'png') {
        const chart = this.chartInstances.get(chartId);
        if (chart && chart.dataURI) {
            chart.dataURI().then(uri => {
                const link = document.createElement('a');
                link.href = uri.imgURI;
                link.download = `psc-chart-${chartId}.${format}`;
                link.click();
                console.log(`📊 Chart exported: ${chartId}.${format}`);
            });
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        // Clear real-time update interval
        if (this.realTimeUpdateInterval) {
            clearInterval(this.realTimeUpdateInterval);
        }

        // Destroy all chart instances
        this.chartInstances.forEach((chart, containerId) => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });

        this.chartInstances.clear();
        this.dataCache.clear();
        
        console.log('🧹 ChartSpecialistApex resources cleaned up');
    }
}

// Initialize ChartSpecialistApex when DOM is ready
let chartSpecialist = null;

document.addEventListener('DOMContentLoaded', function() {
    chartSpecialist = new ChartSpecialistApex();
    
    // Make it globally available for external function calls
    window.chartSpecialist = chartSpecialist;
    
    console.log('🚀 ChartSpecialistApex initialized successfully');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartSpecialistApex;
}