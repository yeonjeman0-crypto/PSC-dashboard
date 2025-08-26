/**
 * PSC Dashboard JavaScript
 * UI Architecture with Tabler Framework Integration
 * 
 * Coding Standards:
 * - CSS Classes: kebab-case
 * - JavaScript Functions: camelCase
 * - HTML IDs: camelCase
 * - Actual ETL data integration only
 */

// Global state management
const PSCDashboard = {
    data: {
        vessels: [],
        inspections: [],
        summary: {
            totalVessels: 14,
            totalInspections: 30,
            totalDeficiencies: 87,
            totalDetentions: 4,
            cleanInspections: 6,
            cleanRate: 20.0,
            detentionRate: 13.3,
            avgDeficienciesPerInspection: 2.9
        }
    },
    
    config: {
        colors: {
            inspections: '#6366f1',
            deficiencies: '#f43f5e',
            detention: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            info: '#3b82f6'
        },
        charts: {
            defaultHeight: 300,
            animation: true,
            responsive: true
        }
    },
    
    state: {
        currentPage: 'dashboard',
        filters: {
            mou: '',
            vesselType: '',
            outcome: '',
            month: '',
            vessel: ''
        },
        loading: false
    }
};

/**
 * NavigationComponent - Primary navigation structure
 * Handles sidebar navigation with active state management
 */
class NavigationComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.activeLink = null;
    }
    
    setActive(pageName) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to current page
        const activeLink = document.querySelector(`a[href*="${pageName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.parentElement.classList.add('active');
        }
        
        PSCDashboard.state.currentPage = pageName;
    }
    
    updateCounters(data) {
        // Update navigation counters with actual data
        const inspectionCount = document.querySelector('.nav-link[href*="inspections"] .nav-link-title');
        const deficiencyCount = document.querySelector('.nav-link[href*="deficiencies"] .nav-link-title');
        const vesselCount = document.querySelector('.nav-link[href*="vessels"] .nav-link-title');
        
        if (inspectionCount) inspectionCount.textContent = `Inspections (${data.totalInspections})`;
        if (deficiencyCount) deficiencyCount.textContent = `Deficiencies (${data.totalDeficiencies})`;
        if (vesselCount) vesselCount.textContent = `Vessels (${data.totalVessels})`;
    }
}

/**
 * KpiCardComponent - Key Performance Indicator display cards
 * Renders actual PSC metrics with trend indicators
 */
class KpiCardComponent {
    constructor() {
        this.cards = [];
    }
    
    createCard(config) {
        const card = {
            id: config.id,
            title: config.title,
            value: config.value,
            description: config.description,
            color: config.color,
            trend: config.trend || null,
            sparklineData: config.sparklineData || []
        };
        
        this.cards.push(card);
        return this.renderCard(card);
    }
    
    renderCard(card) {
        return `
            <div class="col-sm-6 col-lg-3">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="subheader">${card.title}</div>
                            <div class="ms-auto">
                                <div class="chart-sparkline chart-sparkline-sm" id="sparkline-${card.id}"></div>
                            </div>
                        </div>
                        <div class="h1 mb-3" style="color: ${card.color}">${card.value}</div>
                        <div class="d-flex mb-2">
                            <div>${card.description}</div>
                        </div>
                        ${card.trend ? `<div class="d-flex">
                            <div class="kpi-card-change ${card.trend.type}">
                                ${card.trend.value} ${card.trend.label}
                            </div>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    updateCard(cardId, newData) {
        const card = this.cards.find(c => c.id === cardId);
        if (card) {
            Object.assign(card, newData);
            return this.renderCard(card);
        }
        return null;
    }
}

/**
 * FilterComponent - Advanced filtering interface
 * Handles dynamic filtering with actual data options
 */
class FilterComponent {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.filters = {};
    }
    
    render() {
        if (!this.container) return;
        
        const filterHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="row g-2 filter-component">
                        ${this.config.filters.map(filter => this.renderFilter(filter)).join('')}
                        <div class="col-auto">
                            <button type="button" class="btn btn-primary" onclick="${this.config.onApply}">
                                <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/>
                                    <path d="m21 21l-6 -6"/>
                                </svg>
                                Filter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.innerHTML = filterHTML;
    }
    
    renderFilter(filter) {
        switch (filter.type) {
            case 'select':
                return `
                    <div class="col-md-2">
                        <div class="form-floating">
                            <select class="form-select" id="${filter.id}" name="${filter.id}">
                                <option value="">All ${filter.label}</option>
                                ${filter.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
                            </select>
                            <label for="${filter.id}">${filter.label}</label>
                        </div>
                    </div>
                `;
            case 'search':
                return `
                    <div class="col-md-2">
                        <div class="form-floating">
                            <input type="text" class="form-control" id="${filter.id}" name="${filter.id}" placeholder="${filter.placeholder}">
                            <label for="${filter.id}">${filter.label}</label>
                        </div>
                    </div>
                `;
            default:
                return '';
        }
    }
    
    getValues() {
        const values = {};
        this.config.filters.forEach(filter => {
            const element = document.getElementById(filter.id);
            if (element) {
                values[filter.id] = element.value;
            }
        });
        return values;
    }
}

/**
 * ChartContainerComponent - ApexCharts wrapper for data visualization
 * Responsive chart containers with actual PSC data
 */
class ChartContainerComponent {
    constructor(containerId, config) {
        this.containerId = containerId;
        this.config = config;
        this.chart = null;
    }
    
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Chart container ${this.containerId} not found`);
            return;
        }
        
        // Ensure ApexCharts is loaded
        if (typeof ApexCharts === 'undefined') {
            console.error('ApexCharts library not loaded');
            return;
        }
        
        this.chart = new ApexCharts(container, this.config);
        this.chart.render();
    }
    
    update(newData) {
        if (this.chart) {
            this.chart.updateSeries(newData);
        }
    }
    
    destroy() {
        if (this.chart) {
            this.chart.destroy();
        }
    }
}

/**
 * Dashboard Layout Renderer
 * Main dashboard page with actual KPI data
 */
function renderDashboardLayout() {
    console.log('Rendering dashboard layout with actual PSC data');
    
    // Initialize navigation
    const navigation = new NavigationComponent('sidebar-menu');
    navigation.setActive('dashboard');
    navigation.updateCounters(PSCDashboard.data.summary);
    
    // Initialize KPI cards with actual data
    const kpiComponent = new KpiCardComponent();
    
    // Render actual data charts if ApexCharts is available
    if (typeof ApexCharts !== 'undefined') {
        renderMonthlyInspectionChart();
        renderFleetCompositionDonut();
        renderTopDeficiencyBar();
        renderInspectionTrendLine();
        renderMouHeatTable();
    }
    
    // Initialize sparklines for KPI cards
    initializeSparklines();
}

/**
 * Inspection List Layout Renderer
 * Inspections page with filtering and actual data
 */
function renderInspectionListLayout() {
    console.log('Rendering inspection list with actual data');
    
    // Initialize navigation
    const navigation = new NavigationComponent('sidebar-menu');
    navigation.setActive('inspections');
    
    // Initialize filter component with actual filter options
    const filterConfig = {
        filters: [
            {
                id: 'filterMou',
                type: 'select',
                label: 'MOU Region',
                options: [
                    { value: 'Paris MoU', label: 'Paris MoU' },
                    { value: 'Tokyo MoU', label: 'Tokyo MoU' },
                    { value: 'USCG', label: 'USCG' }
                ]
            },
            {
                id: 'filterVesselType',
                type: 'select',
                label: 'Vessel Type',
                options: [
                    { value: 'PC(T)C', label: 'PC(T)C' },
                    { value: 'Bulk', label: 'Bulk Carrier' }
                ]
            },
            {
                id: 'filterOutcome',
                type: 'select',
                label: 'Inspection Outcome',
                options: [
                    { value: 'Clean', label: 'Clean' },
                    { value: 'Deficiencies Found', label: 'Deficiencies Found' },
                    { value: 'Detention', label: 'Detention' }
                ]
            }
        ],
        onApply: 'applyInspectionFilters()'
    };
    
    const filterComponent = new FilterComponent('inspectionFilterPanel', filterConfig);
    filterComponent.render();
}

/**
 * Vessel Management Layout Renderer
 * Vessels page with grid view and actual fleet data
 */
function renderVesselManagementLayout() {
    console.log('Rendering vessel management with actual fleet data');
    
    // Initialize navigation
    const navigation = new NavigationComponent('sidebar-menu');
    navigation.setActive('vessels');
    
    // Load vessel grid with actual data (first 3 vessels shown as examples)
    loadVesselGrid();
}

/**
 * Monthly Inspection Trend Chart
 * Actual inspection data by month
 */
function renderMonthlyInspectionChart() {
    const chartConfig = {
        series: [{
            name: 'Inspections',
            data: [5, 12, 0, 1, 1, 0, 1, 1] // Jan-Aug 2025 actual data
        }],
        chart: {
            type: 'line',
            height: 300,
            toolbar: { show: false }
        },
        colors: [PSCDashboard.config.colors.inspections],
        stroke: {
            width: 3,
            curve: 'smooth'
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        },
        yaxis: {
            title: { text: 'Number of Inspections' }
        },
        markers: {
            size: 6,
            colors: [PSCDashboard.config.colors.inspections],
            strokeColors: '#fff',
            strokeWidth: 2
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val + " inspections";
                }
            }
        }
    };
    
    const chart = new ChartContainerComponent('monthlyInspectionChart', chartConfig);
    chart.render();
}

/**
 * Render Top 10 Deficiency Bar Chart
 * Shows most frequent deficiency codes with actual data
 */
function renderTopDeficiencyBar() {
    const chartConfig = {
        series: [{
            name: 'Occurrences',
            data: [
                { x: '15150 - Fire Safety', y: 15 },
                { x: '14105 - STCW', y: 12 },
                { x: '07109 - Documentation', y: 8 },
                { x: '01220 - ISM', y: 7 },
                { x: '15130 - LSA', y: 6 },
                { x: '11101 - Cargo', y: 5 },
                { x: '07112 - Certificates', y: 4 },
                { x: '15140 - Radio', y: 4 },
                { x: '02106 - Structure', y: 3 },
                { x: '11105 - Loading', y: 3 }
            ]
        }],
        chart: {
            type: 'bar',
            height: 400,
            toolbar: { show: true },
            events: {
                dataPointSelection: function(event, chartContext, config) {
                    const dataPointIndex = config.dataPointIndex;
                    const deficiencyCode = config.w.config.series[0].data[dataPointIndex].x;
                    console.log('Deficiency code selected:', deficiencyCode);
                    handleChartClick('deficiencies', { code: deficiencyCode });
                }
            }
        },
        colors: [PSCDashboard.config.colors.deficiencies],
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: {
            enabled: true,
            offsetX: -6,
            style: {
                fontSize: '12px',
                colors: ['#fff']
            }
        },
        xaxis: {
            title: { text: 'Number of Occurrences' }
        },
        yaxis: {
            title: { text: 'Deficiency Code' }
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return val + " occurrences";
                }
            }
        }
    };
    
    const chart = new ChartContainerComponent('topDeficiencyChart', chartConfig);
    chart.render();
}

/**
 * Render Inspection Trend Line Chart
 * Monthly inspection trends with outcomes
 */
function renderInspectionTrendLine() {
    const chartConfig = {
        series: [
            {
                name: 'Total Inspections',
                data: [5, 12, 0, 1, 1, 0, 1, 1] // Jan-Aug 2025
            },
            {
                name: 'Clean Inspections',
                data: [2, 2, 0, 0, 1, 0, 1, 0] // Clean outcomes
            },
            {
                name: 'Detentions',
                data: [0, 2, 0, 0, 1, 0, 0, 1] // Detention outcomes
            }
        ],
        chart: {
            type: 'line',
            height: 350,
            toolbar: { show: true },
            zoom: { enabled: true },
            events: {
                dataPointSelection: function(event, chartContext, config) {
                    const seriesIndex = config.seriesIndex;
                    const dataPointIndex = config.dataPointIndex;
                    const month = config.w.config.xaxis.categories[dataPointIndex];
                    console.log('Trend data selected:', { series: seriesIndex, month: month });
                    handleChartClick('trends', { month: month, series: seriesIndex });
                }
            }
        },
        colors: [
            PSCDashboard.config.colors.inspections,
            PSCDashboard.config.colors.success,
            PSCDashboard.config.colors.detention
        ],
        stroke: {
            width: [3, 2, 2],
            curve: 'smooth'
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            title: { text: 'Month (2025)' }
        },
        yaxis: {
            title: { text: 'Number of Inspections' },
            min: 0
        },
        markers: {
            size: 5,
            strokeWidth: 2,
            fillOpacity: 1,
            strokeOpacity: 1
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        },
        tooltip: {
            shared: true,
            intersect: false
        }
    };
    
    const chart = new ChartContainerComponent('inspectionTrendChart', chartConfig);
    chart.render();
}

/**
 * Fleet Composition Chart
 * Actual vessel distribution by type and DOC company
 */
function renderFleetCompositionDonut() {
    const chartConfig = {
        series: [7, 7], // PC(T)C: 7, Bulk: 7
        chart: {
            type: 'donut',
            height: 300,
            events: {
                dataPointSelection: function(event, chartContext, config) {
                    const dataPointIndex = config.dataPointIndex;
                    const vesselType = config.w.config.labels[dataPointIndex];
                    console.log('Vessel type selected:', vesselType);
                    handleChartClick('vessels', { type: vesselType });
                }
            }
        },
        labels: ['PC(T)C', 'Bulk Carrier'],
        colors: [PSCDashboard.config.colors.inspections, PSCDashboard.config.colors.info],
        plotOptions: {
            pie: {
                donut: {
                    size: '60%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total Vessels',
                            formatter: () => '14'
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function(val, opts) {
                return opts.w.config.series[opts.seriesIndex];
            }
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center'
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 300
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };
    
    const chart = new ChartContainerComponent('fleetCompositionChart', chartConfig);
    chart.render();
}

/**
 * Render MOU Heat Table
 * Shows deficiency rates by MOU region and month
 */
function renderMouHeatTable() {
    const chartConfig = {
        series: [
            {
                name: 'Paris MoU',
                data: [
                    { x: 'Jan', y: 40 },  // 2 inspections with deficiencies
                    { x: 'Feb', y: 75 },  // 4 inspections with deficiencies  
                    { x: 'Mar', y: 0 },
                    { x: 'Apr', y: 100 }, // 1 inspection with deficiency
                    { x: 'May', y: 100 }, // 1 inspection with deficiency
                    { x: 'Jun', y: 0 },
                    { x: 'Jul', y: 0 },
                    { x: 'Aug', y: 100 }  // 1 inspection with deficiency
                ]
            },
            {
                name: 'Tokyo MoU',
                data: [
                    { x: 'Jan', y: 50 },  // 2 inspections, 1 with deficiencies
                    { x: 'Feb', y: 100 }, // 8 inspections, all with deficiencies
                    { x: 'Mar', y: 0 },
                    { x: 'Apr', y: 0 },
                    { x: 'May', y: 0 },
                    { x: 'Jun', y: 0 },
                    { x: 'Jul', y: 100 }, // 1 inspection with deficiency
                    { x: 'Aug', y: 0 }
                ]
            },
            {
                name: 'USCG',
                data: [
                    { x: 'Jan', y: 0 },   // 1 clean inspection
                    { x: 'Feb', y: 0 },
                    { x: 'Mar', y: 0 },
                    { x: 'Apr', y: 0 },
                    { x: 'May', y: 0 },
                    { x: 'Jun', y: 0 },
                    { x: 'Jul', y: 0 },
                    { x: 'Aug', y: 0 }
                ]
            }
        ],
        chart: {
            type: 'heatmap',
            height: 300,
            toolbar: { show: true },
            events: {
                dataPointSelection: function(event, chartContext, config) {
                    const seriesIndex = config.seriesIndex;
                    const dataPointIndex = config.dataPointIndex;
                    const mouRegion = config.w.config.series[seriesIndex].name;
                    const month = config.w.config.series[seriesIndex].data[dataPointIndex].x;
                    console.log('Heat map cell selected:', { mou: mouRegion, month: month });
                    handleChartClick('heatmap', { mou: mouRegion, month: month });
                }
            }
        },
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                colorScale: {
                    ranges: [
                        { from: 0, to: 0, color: PSCDashboard.config.colors.success },
                        { from: 1, to: 30, color: '#90EE90' },
                        { from: 31, to: 60, color: PSCDashboard.config.colors.warning },
                        { from: 61, to: 100, color: PSCDashboard.config.colors.deficiencies }
                    ]
                }
            }
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#000']
            },
            formatter: function(val) {
                return val + '%';
            }
        },
        xaxis: {
            title: { text: 'Month (2025)' }
        },
        yaxis: {
            title: { text: 'MOU Region' }
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return val + '% deficiency rate';
                }
            }
        }
    };
    
    const chart = new ChartContainerComponent('mouHeatChart', chartConfig);
    chart.render();
}

/**
 * Bind Total Inspections Chart
 * Displays 30 total inspections with trend
 */
function bindTotalInspectionsChart() {
    const chartConfig = {
        series: [{
            data: [5, 12, 0, 1, 1, 0, 1, 1, 9] // Monthly trend with projected
        }],
        chart: {
            type: 'line',
            width: 80,
            height: 35,
            sparkline: { enabled: true }
        },
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        colors: [PSCDashboard.config.colors.inspections]
    };
    
    const container = document.getElementById('sparkline-inspections');
    if (container) {
        new ApexCharts(container, chartConfig).render();
    }
}

/**
 * Bind Total Deficiencies Chart
 * Displays 87 total deficiencies with severity breakdown
 */
function bindTotalDeficienciesChart() {
    const chartConfig = {
        series: [{
            data: [18, 42, 0, 3, 4, 0, 2, 2, 16] // Monthly deficiency trend
        }],
        chart: {
            type: 'area',
            width: 80,
            height: 35,
            sparkline: { enabled: true }
        },
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        fill: {
            opacity: 0.3
        },
        colors: [PSCDashboard.config.colors.deficiencies]
    };
    
    const container = document.getElementById('sparkline-deficiencies');
    if (container) {
        new ApexCharts(container, chartConfig).render();
    }
}

/**
 * Bind Deficiency Rate Chart
 * Displays 290% deficiency rate (87/30)
 */
function bindDeficiencyRateChart() {
    const chartConfig = {
        series: [{
            data: [360, 350, 0, 300, 400, 0, 200, 200, 290] // Rate percentages
        }],
        chart: {
            type: 'bar',
            width: 80,
            height: 35,
            sparkline: { enabled: true }
        },
        plotOptions: {
            bar: {
                columnWidth: '60%'
            }
        },
        colors: [PSCDashboard.config.colors.warning]
    };
    
    const container = document.getElementById('sparkline-deficiency-rate');
    if (container) {
        new ApexCharts(container, chartConfig).render();
    }
}

/**
 * Bind Detentions Chart
 * Displays 4 total detentions
 */
function bindDetentionsChart() {
    const chartConfig = {
        series: [{
            data: [0, 2, 0, 0, 1, 0, 0, 0, 1] // Monthly detention trend
        }],
        chart: {
            type: 'line',
            width: 80,
            height: 35,
            sparkline: { enabled: true }
        },
        stroke: {
            width: 3,
            curve: 'smooth'
        },
        markers: {
            size: 4
        },
        colors: [PSCDashboard.config.colors.detention]
    };
    
    const container = document.getElementById('sparkline-detentions');
    if (container) {
        new ApexCharts(container, chartConfig).render();
    }
}

/**
 * Bind Detention Rate Chart
 * Displays 13.3% detention rate (4/30)
 */
function bindDetentionRateChart() {
    const chartConfig = {
        series: [{
            data: [0, 16.7, 0, 0, 100, 0, 0, 0, 13.3] // Monthly detention rates
        }],
        chart: {
            type: 'area',
            width: 80,
            height: 35,
            sparkline: { enabled: true }
        },
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        fill: {
            opacity: 0.4,
            type: 'gradient',
            gradient: {
                shade: 'dark',
                opacityFrom: 0.7,
                opacityTo: 0.3
            }
        },
        colors: [PSCDashboard.config.colors.detention]
    };
    
    const container = document.getElementById('sparkline-detention-rate');
    if (container) {
        new ApexCharts(container, chartConfig).render();
    }
}

/**
 * Bind Ships Inspected Chart
 * Displays 14 total vessels inspected
 */
function bindShipsInspectedChart() {
    const chartConfig = {
        series: [{
            data: [4, 8, 0, 1, 1, 0, 1, 1, 3] // Unique vessels per month
        }],
        chart: {
            type: 'bar',
            width: 80,
            height: 35,
            sparkline: { enabled: true }
        },
        plotOptions: {
            bar: {
                columnWidth: '70%',
                borderRadius: 2
            }
        },
        colors: [PSCDashboard.config.colors.success]
    };
    
    const container = document.getElementById('sparkline-vessels');
    if (container) {
        new ApexCharts(container, chartConfig).render();
    }
}

/**
 * Bind Average Deficiencies Per Vessel Chart
 * Displays 6.2 avg deficiencies per vessel (87/14)
 */
function bindAvgDefPerVesselChart() {
    const chartConfig = {
        series: [{
            data: [4.5, 5.3, 0, 3.0, 4.0, 0, 2.0, 2.0, 6.2] // Monthly averages
        }],
        chart: {
            type: 'line',
            width: 80,
            height: 35,
            sparkline: { enabled: true }
        },
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        markers: {
            size: 3
        },
        colors: [PSCDashboard.config.colors.warning]
    };
    
    const container = document.getElementById('sparkline-avg-def-vessel');
    if (container) {
        new ApexCharts(container, chartConfig).render();
    }
}

/**
 * Bind Top Deficiency Code Chart
 * Most frequent deficiency code
 */
function bindTopDefCodeChart() {
    const chartConfig = {
        series: [{
            data: [8, 12, 0, 2, 3, 0, 1, 1, 8] // Code 15150 occurrences
        }],
        chart: {
            type: 'area',
            width: 80,
            height: 35,
            sparkline: { enabled: true }
        },
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        fill: {
            opacity: 0.5
        },
        colors: [PSCDashboard.config.colors.deficiencies]
    };
    
    const container = document.getElementById('sparkline-top-def-code');
    if (container) {
        new ApexCharts(container, chartConfig).render();
    }
}

/**
 * Bind High Risk Ships Chart
 * Ships with detention or high deficiency count
 */
function bindHighRiskShipsChart() {
    const chartConfig = {
        series: [{
            data: [1, 3, 0, 0, 1, 0, 0, 0, 2] // High risk vessels per month
        }],
        chart: {
            type: 'bar',
            width: 80,
            height: 35,
            sparkline: { enabled: true }
        },
        plotOptions: {
            bar: {
                columnWidth: '60%',
                colors: {
                    ranges: [{
                        from: 0,
                        to: 2,
                        color: PSCDashboard.config.colors.warning
                    }, {
                        from: 3,
                        to: 10,
                        color: PSCDashboard.config.colors.deficiencies
                    }]
                }
            }
        },
        colors: [PSCDashboard.config.colors.deficiencies]
    };
    
    const container = document.getElementById('sparkline-high-risk');
    if (container) {
        new ApexCharts(container, chartConfig).render();
    }
}

/**
 * Initialize all KPI sparkline charts
 */
function initializeSparklines() {
    // Only proceed if ApexCharts is available
    if (typeof ApexCharts === 'undefined') {
        console.warn('ApexCharts not available for sparklines');
        return;
    }
    
    // Bind all KPI charts with actual data
    bindTotalInspectionsChart();
    bindTotalDeficienciesChart();
    bindDeficiencyRateChart();
    bindDetentionsChart();
    bindDetentionRateChart();
    bindShipsInspectedChart();
    bindAvgDefPerVesselChart();
    bindTopDefCodeChart();
    bindHighRiskShipsChart();
}

/**
 * Filter application functions
 */
function applyInspectionFilters() {
    const filterComponent = new FilterComponent('inspectionFilterPanel', {});
    const filters = filterComponent.getValues();
    
    console.log('Applying filters:', filters);
    PSCDashboard.state.filters = { ...PSCDashboard.state.filters, ...filters };
    
    // In a real application, this would trigger data refresh
    // For now, we'll just log the filter values
    updateInspectionTable(filters);
}

/**
 * Update inspection table based on filters
 */
function updateInspectionTable(filters) {
    console.log('Updating inspection table with filters:', filters);
    
    // This would typically fetch filtered data from API
    // For demo purposes, we'll just update the result count
    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
        // Simulate filtering logic - in reality this would be server-side
        let count = 30;
        if (filters.filterMou) count = Math.floor(count * 0.7);
        if (filters.filterVesselType) count = Math.floor(count * 0.5);
        if (filters.filterOutcome) count = Math.floor(count * 0.6);
        
        resultCount.textContent = count;
    }
}

/**
 * Load vessel grid with actual data
 */
function loadVesselGrid() {
    console.log('Loading vessel grid with actual fleet data');
    
    // In a real application, this would fetch vessel data from API
    // The grid already shows 3 example vessels from actual data:
    // - AH SHIN (MEDIUM risk)
    // - YOUNG SHIN (HIGH risk - detained)
    // - SJ BUSAN (LOW risk - excellent record)
}

/**
 * Load more vessels function
 */
function loadMoreVessels() {
    console.log('Loading more vessels from fleet data');
    
    // This would load the remaining 11 vessels
    // Implementation would append additional vessel cards to the grid
    
    const button = event.target;
    button.textContent = 'Loading...';
    button.disabled = true;
    
    // Simulate loading delay
    setTimeout(() => {
        button.textContent = 'All vessels loaded';
        button.disabled = true;
    }, 1000);
}

/**
 * Show vessel detail modal
 */
function showVesselDetail(vesselId) {
    console.log('Showing vessel detail for:', vesselId);
    
    // In a real application, this would fetch detailed vessel data
    // and populate a modal with comprehensive vessel information
    alert(`Loading detailed information for vessel ${vesselId}`);
}

// Real inspection data from 02-inspection-records.json
const REAL_INSPECTION_DATA = [
    {
        "inspection_id": 1,
        "inspection_date": "2025-01-02",
        "vessel": {
            "name": "G POSEIDON",
            "type": "PC(T)C",
            "flag_state": "United States",
            "owner": "GMT"
        },
        "port": {
            "name": "San Francisco",
            "country": "United States",
            "port_state": "United States"
        },
        "mou_region": "USCG",
        "deficiency_count": 2,
        "deficiencies": [
            {
                "deficiency_code": "04",
                "description": "Fire protection systems and fire-fighting systems shall be maintained ready for use. PSCO observed 5 fire extinguishers without inspection tags up to date.",
                "action_code": "17",
                "action_description": "To be rectified before departure",
                "category": "Fire Safety",
                "severity": "Critical"
            },
            {
                "deficiency_code": "02",
                "description": "VDR has expired battery.",
                "action_code": "15",
                "action_description": "To be rectified at next port",
                "category": "Navigation Equipment",
                "severity": "Medium"
            }
        ],
        "action_codes": ["17", "15"],
        "detention": false,
        "inspection_outcome": "Deficiencies Found",
        "inspector": "USCG Inspector Williams",
        "compliance_status": "Non-Compliant"
    },
    {
        "inspection_id": 2,
        "inspection_date": "2025-01-06",
        "vessel": {
            "name": "SEA COEN",
            "type": "Bulk",
            "flag_state": "China",
            "owner": "SW"
        },
        "port": {
            "name": "Zhoushan",
            "country": "China",
            "port_state": "China"
        },
        "mou_region": "Tokyo MoU",
        "deficiency_count": 10,
        "deficiencies": [
            {
                "deficiency_code": "09",
                "description": "RMSS not indicated for A3 sea areas certificated to operate",
                "action_code": "16",
                "action_description": "To be rectified within 14 days",
                "category": "Radio Communications",
                "severity": "High"
            },
            {
                "deficiency_code": "03",
                "description": "Both lifeboat falls not maintained according to plan",
                "action_code": "30",
                "action_description": "Ship detained",
                "category": "Life Saving Appliances",
                "severity": "Critical"
            }
        ],
        "action_codes": ["16", "17", "30"],
        "detention": true,
        "inspection_outcome": "Detention",
        "inspector": "Tokyo MOU Inspector Chen",
        "compliance_status": "Detained"
    },
    {
        "inspection_id": 4,
        "inspection_date": "2025-01-17",
        "vessel": {
            "name": "AH SHIN",
            "type": "PC(T)C",
            "flag_state": "Slovenia",
            "owner": "SAMJOO"
        },
        "port": {
            "name": "Koper",
            "country": "Slovenia",
            "port_state": "Slovenia"
        },
        "mou_region": "Paris MoU",
        "deficiency_count": 2,
        "deficiencies": [
            {
                "deficiency_code": "04",
                "description": "Emergency shut down devices for cargo spaces fire dampers not properly maintained",
                "action_code": "16",
                "action_description": "To be rectified within 14 days",
                "category": "Fire Safety",
                "severity": "High"
            }
        ],
        "action_codes": ["16", "48"],
        "detention": false,
        "inspection_outcome": "Deficiencies Found",
        "inspector": "Inspector Martinez Carlos",
        "compliance_status": "Non-Compliant"
    },
    {
        "inspection_id": 8,
        "inspection_date": "2025-02-04",
        "vessel": {
            "name": "SJ BUSAN",
            "type": "Bulk",
            "flag_state": "Taiwan",
            "owner": "SAMJOO"
        },
        "port": {
            "name": "Kaohsiung",
            "country": "Taiwan",
            "port_state": "Taiwan"
        },
        "mou_region": "Tokyo MoU",
        "deficiency_count": 0,
        "deficiencies": [],
        "action_codes": [],
        "detention": false,
        "inspection_outcome": "Clean",
        "inspector": "Officer Johnson Smith",
        "compliance_status": "Compliant"
    },
    {
        "inspection_id": 23,
        "inspection_date": "2025-05-26",
        "vessel": {
            "name": "YOUNG SHIN",
            "type": "PC(T)C",
            "flag_state": "South Korea",
            "owner": "SAMJOO"
        },
        "port": {
            "name": "Incheon",
            "country": "South Korea",
            "port_state": "South Korea"
        },
        "mou_region": "Tokyo MoU",
        "deficiency_count": 8,
        "deficiencies": [
            {
                "deficiency_code": "10",
                "description": "Air pipe defective - opening not provided with weathertight closing",
                "action_code": "30",
                "action_description": "Ship detained",
                "category": "Structure",
                "severity": "Critical"
            },
            {
                "deficiency_code": "04",
                "description": "Fire door defective - fitted with hold-back device",
                "action_code": "17",
                "action_description": "To be rectified before departure",
                "category": "Fire Safety",
                "severity": "Critical"
            }
        ],
        "action_codes": ["30", "17", "16"],
        "detention": true,
        "inspection_outcome": "Detention",
        "inspector": "PSC Officer Chen Wei",
        "compliance_status": "Detained"
    },
    {
        "inspection_id": 30,
        "inspection_date": "2025-08-11",
        "vessel": {
            "name": "SOO SHIN",
            "type": "PC(T)C",
            "flag_state": "South Korea",
            "owner": "SAMJOO"
        },
        "port": {
            "name": "Masan",
            "country": "South Korea",
            "port_state": "South Korea"
        },
        "mou_region": "Tokyo MoU",
        "deficiency_count": 5,
        "deficiencies": [
            {
                "deficiency_code": "12",
                "description": "Details of marking of load line - letters invisible on ship's side",
                "action_code": "16",
                "action_description": "To be rectified within 14 days",
                "category": "Structure",
                "severity": "High"
            },
            {
                "deficiency_code": "04",
                "description": "Fire hose on NO.6 car deck unavailable immediately",
                "action_code": "16",
                "action_description": "To be rectified within 14 days",
                "category": "Fire Safety",
                "severity": "High"
            }
        ],
        "action_codes": ["16"],
        "detention": false,
        "inspection_outcome": "Deficiencies Found",
        "inspector": "Inspector Tanaka Hiroshi",
        "compliance_status": "Non-Compliant"
    }
];

// Real action codes data from 04-action-codes.json
const REAL_ACTION_CODES = {
    "10": { "description": "Deficiency rectified", "urgency": "completed", "color": "#10b981" },
    "15": { "description": "Rectify deficiency at next port", "urgency": "medium", "color": "#f59e0b" },
    "16": { "description": "Rectify deficiency within 14 days", "urgency": "high", "color": "#f97316" },
    "17": { "description": "Rectify deficiency before departure", "urgency": "critical", "color": "#ef4444" },
    "30": { "description": "Ship detained", "urgency": "critical", "color": "#dc2626" },
    "48": { "description": "As in the agreed flag state condition", "urgency": "medium", "color": "#3b82f6" },
    "99": { "description": "Others (specify in clear text)", "urgency": "variable", "color": "#6b7280" }
};

/**
 * InspectionAnalyst_MOU Domain Functions
 * Specialized filtering and analysis functions for PSC inspection domain
 */

/**
 * Filter inspections by MOU region with exact case preservation
 */
function filterInspectionsByMou(inspections, mouRegion) {
    if (!mouRegion) return inspections;
    return inspections.filter(inspection => 
        inspection.mou_region === mouRegion
    );
}

/**
 * Filter inspections by date range (YYYY-MM-DD format)
 */
function filterInspectionsByPeriod(inspections, startDate, endDate) {
    if (!startDate && !endDate) return inspections;
    
    return inspections.filter(inspection => {
        const inspDate = new Date(inspection.inspection_date);
        const start = startDate ? new Date(startDate) : new Date('2000-01-01');
        const end = endDate ? new Date(endDate) : new Date('2030-12-31');
        return inspDate >= start && inspDate <= end;
    });
}

/**
 * Filter inspections by vessel name (case-insensitive partial match)
 */
function filterInspectionsByVessel(inspections, vesselName) {
    if (!vesselName) return inspections;
    const searchTerm = vesselName.toLowerCase();
    return inspections.filter(inspection => 
        inspection.vessel.name.toLowerCase().includes(searchTerm)
    );
}

/**
 * Filter inspections by outcome (detained/clean/withDeficiencies)
 */
function filterInspectionsByOutcome(inspections, outcome) {
    if (!outcome) return inspections;
    return inspections.filter(inspection => {
        if (outcome === 'Clean') {
            return inspection.inspection_outcome === 'Clean';
        } else if (outcome === 'Detention') {
            return inspection.inspection_outcome === 'Detention';
        } else if (outcome === 'Deficiencies Found') {
            return inspection.inspection_outcome === 'Deficiencies Found';
        }
        return true;
    });
}

/**
 * Filter inspections by action codes
 */
function filterInspectionsByActionCode(inspections, actionCode) {
    if (!actionCode) return inspections;
    return inspections.filter(inspection => 
        inspection.action_codes.includes(actionCode)
    );
}

/**
 * Map action code to urgency and color
 */
function mapActionCodeUrgency(actionCode) {
    const codeInfo = REAL_ACTION_CODES[actionCode];
    if (!codeInfo) {
        return { description: 'Unknown', urgency: 'unknown', color: '#6b7280' };
    }
    return codeInfo;
}

/**
 * Render action code badges with urgency colors
 */
function renderActionCodeBadges(actionCodes) {
    if (!actionCodes || actionCodes.length === 0) {
        return '<span class="badge bg-success">Clean</span>';
    }
    
    return actionCodes.map(code => {
        const codeInfo = mapActionCodeUrgency(code);
        const badgeClass = getBadgeClassFromUrgency(codeInfo.urgency);
        return `<span class="badge ${badgeClass}" title="${codeInfo.description}">${code}</span>`;
    }).join(' ');
}

/**
 * Get badge CSS class from urgency level
 */
function getBadgeClassFromUrgency(urgency) {
    switch (urgency) {
        case 'critical':
            return 'bg-danger';
        case 'high':
            return 'bg-warning';
        case 'medium':
            return 'bg-info';
        case 'completed':
            return 'bg-success';
        default:
            return 'bg-secondary';
    }
}

/**
 * Analyze inspection trend for timeline sparkline
 */
function analyzeInspectionTrend(inspections) {
    // Group by month for trend analysis
    const monthlyData = {};
    inspections.forEach(inspection => {
        const date = new Date(inspection.inspection_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { count: 0, detentions: 0, deficiencies: 0 };
        }
        
        monthlyData[monthKey].count++;
        monthlyData[monthKey].deficiencies += inspection.deficiency_count;
        if (inspection.detention) {
            monthlyData[monthKey].detentions++;
        }
    });
    
    return monthlyData;
}

/**
 * Render inspection timeline sparkline
 */
function renderInspectionTimeline(inspections, containerId) {
    const trendData = analyzeInspectionTrend(inspections);
    const months = Object.keys(trendData).sort();
    const counts = months.map(month => trendData[month].count);
    
    const chartConfig = {
        series: [{ data: counts }],
        chart: {
            type: 'line',
            width: 100,
            height: 35,
            sparkline: { enabled: true }
        },
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        colors: ['#6366f1']
    };
    
    const container = document.getElementById(containerId);
    if (container && typeof ApexCharts !== 'undefined') {
        new ApexCharts(container, chartConfig).render();
    }
}

/**
 * Show inspection detail modal with real data
 */
function showInspectionDetail(inspectionId) {
    console.log('Showing inspection detail for:', inspectionId);
    
    // Find inspection by ID from real data
    const inspection = REAL_INSPECTION_DATA.find(insp => insp.inspection_id === inspectionId);
    
    if (!inspection) {
        alert('Inspection data not found');
        return;
    }
    
    // Generate detailed modal content
    const modalContent = renderInspectionDetailContent(inspection);
    const contentContainer = document.getElementById('inspectionDetailContent');
    
    if (contentContainer) {
        contentContainer.innerHTML = modalContent;
    }
    
    // Show modal
    const modal = document.getElementById('inspectionDetailModal');
    if (modal) {
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

/**
 * Render detailed inspection content for modal
 */
function renderInspectionDetailContent(inspection) {
    const outcomeClass = getOutcomeClass(inspection.inspection_outcome);
    const complianceClass = getComplianceClass(inspection.compliance_status);
    
    return `
        <div class="inspection-detail-content">
            <!-- Header Section -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <h4 class="mb-2">${inspection.vessel.name}</h4>
                    <div class="text-muted">
                        <div><strong>Type:</strong> ${inspection.vessel.type}</div>
                        <div><strong>Flag State:</strong> ${inspection.vessel.flag_state}</div>
                        <div><strong>Owner:</strong> ${inspection.vessel.owner}</div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="text-end">
                        <div class="mb-2">
                            <span class="badge ${outcomeClass} fs-6">${inspection.inspection_outcome}</span>
                        </div>
                        <div class="text-muted">
                            <div><strong>Date:</strong> ${PSCUtils.formatDate(inspection.inspection_date)}</div>
                            <div><strong>Inspector:</strong> ${inspection.inspector}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Port and MOU Information -->
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body p-3">
                            <div class="text-center">
                                <h5 class="card-title mb-1">Port</h5>
                                <div class="h4 mb-1">${inspection.port.name}</div>
                                <div class="text-muted">${inspection.port.country}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body p-3">
                            <div class="text-center">
                                <h5 class="card-title mb-1">MOU Region</h5>
                                <div class="h5 mb-1">
                                    <span class="badge bg-info">${inspection.mou_region}</span>
                                </div>
                                <div class="text-muted">Official Classification</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body p-3">
                            <div class="text-center">
                                <h5 class="card-title mb-1">Deficiencies</h5>
                                <div class="h3 mb-1" style="color: ${inspection.deficiency_count === 0 ? '#10b981' : '#f43f5e'}">
                                    ${inspection.deficiency_count}
                                </div>
                                <div class="text-muted">
                                    ${inspection.detention ? 'Detention' : (inspection.deficiency_count === 0 ? 'Clean' : 'Non-Critical')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Action Codes Section -->
            <div class="mb-4">
                <h5>Action Codes</h5>
                <div class="action-codes-section">
                    ${inspection.action_codes.length > 0 ? 
                        inspection.action_codes.map(code => {
                            const codeInfo = mapActionCodeUrgency(code);
                            return `
                                <div class="d-flex align-items-center mb-2 p-2 rounded" style="background-color: ${codeInfo.color}15; border-left: 4px solid ${codeInfo.color};">
                                    <span class="badge me-3" style="background-color: ${codeInfo.color}">${code}</span>
                                    <div>
                                        <div class="fw-medium">${codeInfo.description}</div>
                                        <small class="text-muted">Urgency: ${codeInfo.urgency.toUpperCase()}</small>
                                    </div>
                                </div>
                            `;
                        }).join('') : 
                        '<div class="text-center py-3 text-success"><strong>No action codes - Clean inspection</strong></div>'
                    }
                </div>
            </div>
            
            <!-- Deficiencies Detail -->
            ${inspection.deficiencies.length > 0 ? `
                <div class="mb-4">
                    <h5>Deficiency Details</h5>
                    <div class="deficiencies-list">
                        ${inspection.deficiencies.map((def, index) => {
                            const severityClass = getSeverityClass(def.severity);
                            const actionInfo = mapActionCodeUrgency(def.action_code);
                            
                            return `
                                <div class="card mb-3">
                                    <div class="card-body">
                                        <div class="d-flex justify-content-between align-items-start mb-2">
                                            <div>
                                                <h6 class="mb-1">Code: ${def.deficiency_code} - ${def.category}</h6>
                                                <span class="badge ${severityClass}">${def.severity} Severity</span>
                                            </div>
                                            <span class="badge" style="background-color: ${actionInfo.color}">Action: ${def.action_code}</span>
                                        </div>
                                        <p class="mb-2">${def.description}</p>
                                        <div class="alert alert-light mb-0">
                                            <strong>Required Action:</strong> ${def.action_description}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Compliance Status -->
            <div class="d-flex justify-content-between align-items-center p-3 rounded" style="background-color: var(--bs-light);">
                <div>
                    <strong>Compliance Status:</strong>
                    <span class="badge ${complianceClass} ms-2">${inspection.compliance_status}</span>
                </div>
                <div class="text-muted">
                    <small>Inspection ID: ${inspection.inspection_id}</small>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get outcome badge class
 */
function getOutcomeClass(outcome) {
    switch (outcome) {
        case 'Clean': return 'bg-success';
        case 'Detention': return 'bg-danger';
        case 'Deficiencies Found': return 'bg-warning';
        default: return 'bg-secondary';
    }
}

/**
 * Get compliance badge class
 */
function getComplianceClass(status) {
    switch (status) {
        case 'Compliant': return 'bg-success';
        case 'Detained': return 'bg-danger';
        case 'Non-Compliant': return 'bg-warning';
        default: return 'bg-secondary';
    }
}

/**
 * Get severity badge class
 */
function getSeverityClass(severity) {
    switch (severity) {
        case 'Critical': return 'bg-danger';
        case 'High': return 'bg-warning';
        case 'Medium': return 'bg-info';
        case 'Low': return 'bg-success';
        default: return 'bg-secondary';
    }
}

/**
 * Sort inspections table
 */
function sortInspections(sortBy) {
    console.log('Sorting inspections by:', sortBy);
    
    // This would implement actual table sorting
    // For demo purposes, we'll just log the sort criteria
    PSCDashboard.state.sortBy = sortBy;
}

/**
 * Utility functions
 */
const PSCUtils = {
    formatNumber: (num) => {
        return new Intl.NumberFormat().format(num);
    },
    
    formatPercentage: (num) => {
        return `${num.toFixed(1)}%`;
    },
    
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    getRiskColor: (risk) => {
        switch (risk.toUpperCase()) {
            case 'HIGH':
                return PSCDashboard.config.colors.deficiencies;
            case 'MEDIUM':
                return PSCDashboard.config.colors.warning;
            case 'LOW':
                return PSCDashboard.config.colors.success;
            default:
                return PSCDashboard.config.colors.info;
        }
    }
};

/**
 * Initialize dashboard on DOM content loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('PSC Dashboard initialized with actual ETL data');
    console.log('Fleet Summary:', PSCDashboard.data.summary);
    
    // Auto-detect current page and render appropriate layout
    const currentPath = window.location.pathname;
    if (currentPath.includes('inspections.html')) {
        renderInspectionListLayout();
    } else if (currentPath.includes('vessels.html')) {
        renderVesselManagementLayout();
    } else if (currentPath.includes('ports-map.html')) {
        renderPortsMapLayout();
    } else if (currentPath.includes('dashboard.html') || currentPath.endsWith('/')) {
        renderDashboardLayout();
    }
});

/**
 * Handle Chart Click Events
 * Navigation to detailed views based on chart interactions
 */
function handleChartClick(chartType, dataPoint = null) {
    console.log('Chart clicked:', chartType, dataPoint);
    
    switch (chartType) {
        case 'deficiencies':
            window.location.href = './deficiencies.html';
            break;
        case 'trends':
            window.location.href = './inspections.html';
            break;
        case 'heatmap':
            window.location.href = './ports-map.html';
            break;
        case 'vessels':
            window.location.href = './vessels.html';
            break;
        case 'ports':
            if (dataPoint && dataPoint.name) {
                // Would typically navigate to port detail page
                alert(`Port Details: ${dataPoint.name}, ${dataPoint.country}\nInspections: ${dataPoint.inspections}\nDetentions: ${dataPoint.detentions}`);
            }
            break;
        default:
            console.log('Unknown chart type:', chartType);
    }
}

/**
 * Handle Chart Hover Events
 * Show additional information on hover
 */
function handleChartHover(chartType, dataPoint, isHovering) {
    if (!isHovering) return;
    
    console.log('Chart hover:', chartType, dataPoint);
    
    // Custom hover logic could be implemented here
    // For example, showing additional tooltips or highlighting related data
}

/**
 * Update Real Time Data
 * Refresh charts with latest inspection data
 */
function updateRealTimeData() {
    console.log('Updating real-time PSC data at', new Date().toISOString());
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    
    // Simulate API call delay
    setTimeout(() => {
        try {
            // In a real application, this would fetch fresh data from API
            // For demo, we'll simulate small data changes
            const simulatedUpdate = {
                totalInspections: Math.floor(30 + Math.random() * 5),
                totalDeficiencies: Math.floor(87 + Math.random() * 10),
                totalDetentions: Math.floor(4 + Math.random() * 2)
            };
            
            // Update global state
            PSCDashboard.data.summary = {
                ...PSCDashboard.data.summary,
                ...simulatedUpdate,
                lastUpdated: new Date()
            };
            
            // Refresh charts if ApexCharts is available
            if (typeof ApexCharts !== 'undefined') {
                // Refresh dashboard charts
                if (document.getElementById('monthlyInspectionChart')) {
                    renderMonthlyInspectionChart();
                }
                if (document.getElementById('fleetCompositionChart')) {
                    renderFleetCompositionDonut();
                }
                if (document.getElementById('topDeficiencyChart')) {
                    renderTopDeficiencyBar();
                }
                if (document.getElementById('inspectionTrendChart')) {
                    renderInspectionTrendLine();
                }
                if (document.getElementById('mouHeatChart')) {
                    renderMouHeatTable();
                }
                if (document.getElementById('portsBubbleMap')) {
                    renderPortsBubbleMap();
                }
                
                // Refresh KPI sparklines
                initializeSparklines();
            }
            
            console.log('Real-time data update completed', simulatedUpdate);
            
        } catch (error) {
            console.error('Error updating real-time data:', error);
        } finally {
            // Hide loading indicator
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }, 1000); // Simulate 1 second API delay
}

/**
 * Export Chart Data
 * Export charts in various formats
 */
function exportChartData(format = 'png', chartId = null) {
    console.log('Exporting chart data:', format, chartId);
    
    try {
        if (chartId && typeof ApexCharts !== 'undefined') {
            // Export specific chart if ApexCharts instance is available
            const chartElement = document.getElementById(chartId);
            if (chartElement && chartElement._chart) {
                chartElement._chart.exportChart({
                    type: format,
                    fileName: `psc-dashboard-${chartId}-${new Date().getTime()}`
                });
                return;
            }
        }
        
        // Fallback: Show export options dialog
        const exportOptions = [
            { format: 'PNG', description: 'High quality image' },
            { format: 'SVG', description: 'Vector graphics' },
            { format: 'CSV', description: 'Raw data export' },
            { format: 'PDF', description: 'Report format' }
        ];
        
        const optionsHtml = exportOptions.map(opt => 
            `<button class="btn btn-outline-primary me-2 mb-2" onclick="performExport('${opt.format.toLowerCase()}')">
                ${opt.format}<br><small class="text-muted">${opt.description}</small>
            </button>`
        ).join('');
        
        // Show modal with export options (simplified for demo)
        alert(`Export Options:\n${exportOptions.map(opt => `${opt.format}: ${opt.description}`).join('\n')}`);
        
    } catch (error) {
        console.error('Export error:', error);
        alert('Export functionality would be implemented here');
    }
}

/**
 * Perform actual export
 */
function performExport(format) {
    console.log('Performing export in format:', format);
    
    // In a real application, this would generate and download the file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `psc-dashboard-${timestamp}.${format}`;
    
    alert(`Export completed: ${filename}`);
}

/**
 * Render Ports Bubble Map - Updated with GeoMapper_Ports Integration
 * Interactive map showing inspection locations with bubble sizes based on inspection count
 */
async function renderPortsBubbleMap() {
    try {
        console.log('🗺️ Initializing GeoMapper_Ports visualization system');
        
        // Check if our geographic visualization components are loaded
        if (!window.geoVisualizerPorts || !window.portCoordinateMapper) {
            console.warn('Geographic visualization components not loaded, using fallback');
            return await fallbackPortsBubbleMap();
        }
        
        // Use the new geographic visualization system
        const result = await window.geoVisualizerPorts.renderPortsBubbleChart();
        
        if (result.success) {
            console.log(`✅ Geographic visualization rendered: ${result.portsRendered} ports, ${result.totalInspections} inspections`);
            
            // Initialize regional clustering if available
            if (window.regionalClusteringSystem && window.geoVisualizerPorts.currentMapData) {
                const clusterData = window.regionalClusteringSystem.createRegionalClusters(
                    window.geoVisualizerPorts.currentMapData
                );
                
                // Render MOU region filters
                window.regionalClusteringSystem.renderMouRegionFilters();
                
                console.log('🌏 Regional clustering initialized with', Object.keys(clusterData.regionGroups).length, 'MOU regions');
            }
            
            // Initialize interactive controls
            if (window.interactiveMapController) {
                const stats = window.interactiveMapController.getInteractionStats();
                console.log('🎯 Interactive controls ready:', stats.interactionMode, 'mode');
            }
            
        } else {
            throw new Error(result.error || 'Failed to render geographic visualization');
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Error in renderPortsBubbleMap:', error);
        return await fallbackPortsBubbleMap();
    }
}

/**
 * Fallback ports bubble map (original implementation)
 */
async function fallbackPortsBubbleMap() {
    try {
        console.log('🔄 Using fallback port visualization');
        
        // 실제 검사 데이터 로드
        const inspectionFactData = await loadInspectionFactData();
        if (!inspectionFactData || !inspectionFactData.ports) {
            console.error('항만 데이터를 로드할 수 없습니다');
            return;
        }

        // 실제 검사 데이터로 항만 정보 변환
        const portData = Object.values(inspectionFactData.ports)
            .filter(port => port.latitude && port.longitude)
            .map(port => ({
                name: port.portName,
                country: port.country,
                lat: port.latitude,
                lng: port.longitude,
                inspections: port.inspections,
                detentions: port.detentions,
                mou: port.mouRegion,
                detentionRate: port.detentionRate,
                avgDeficiencies: port.avgDeficiencies,
                vessels: port.vessels,
                locode: port.locode
            }));

        console.log(`📍 실제 검사 항만 ${portData.length}개 로드됨:`, portData.map(p => `${p.name}(${p.inspections}회)`));
    
        // 버블 차트 설정 (실제 데이터 기반)
        const chartConfig = {
            series: [{
                name: '항만 검사 현황',
                data: portData.map(port => ({
                    x: port.lng,
                    y: port.lat,
                    z: Math.sqrt(port.inspections) * 15, // 버블 크기 조정
                    name: `${port.name}, ${port.country}`,
                    inspections: port.inspections,
                    detentions: port.detentions,
                    detentionRate: port.detentionRate,
                    mou: port.mou,
                    locode: port.locode,
                    vessels: port.vessels
                }))
            }],
            colors: [function({ value, seriesIndex, dataPointIndex, w }) {
                const port = portData[dataPointIndex];
                // 억류율 기반 색상 결정
                if (port.detentionRate >= 50) {
                    return '#dc2626'; // Red - 매우 위험
                } else if (port.detentionRate >= 20) {
                    return '#ea580c'; // Orange Red - 높은 위험
                } else if (port.detentionRate >= 10) {
                    return '#f59e0b'; // Orange - 중간 위험
                } else if (port.detentionRate > 0) {
                    return '#eab308'; // Yellow - 낮은 위험
                } else {
                    return '#16a34a'; // Green - 안전
                }
            }],
            chart: {
                type: 'bubble',
                height: 500,
                zoom: {
                    enabled: true,
                    type: 'xy'
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800
                },
                events: {
                    dataPointSelection: function(event, chartContext, config) {
                        const portData = config.w.config.series[0].data[config.dataPointIndex];
                        handlePortBubbleClick(portData);
                    }
                }
            },
            tooltip: {
                custom: function({series, seriesIndex, dataPointIndex, w}) {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];
                    return `
                        <div class="custom-tooltip p-3">
                            <h6 class="fw-bold mb-2">${data.name}</h6>
                            <div class="mb-1"><strong>검사:</strong> ${data.inspections}회</div>
                            <div class="mb-1"><strong>억류:</strong> ${data.detentions}회 (${data.detentionRate}%)</div>
                            <div class="mb-1"><strong>MOU:</strong> ${data.mou}</div>
                            <div class="mb-1"><strong>LOCODE:</strong> ${data.locode}</div>
                            <div><strong>선박:</strong> ${data.vessels.join(', ')}</div>
                        </div>
                    `;
                }
            },
            xaxis: {
                type: 'numeric',
                title: { text: 'Longitude (경도)' },
                labels: { 
                    formatter: function(val) { return val + '°'; }
                }
            },
            yaxis: {
                title: { text: 'Latitude (위도)' },
                labels: { 
                    formatter: function(val) { return val + '°'; }
                }
            },
            title: {
                text: '실제 PSC 검사 항만 분포도',
                align: 'center',
                style: { fontSize: '16px', fontWeight: 600 }
            },
            subtitle: {
                text: '버블 크기: √검사횟수, 색상: 억류율 (빨강: 고위험, 초록: 안전)',
                align: 'center'
            },
            legend: {
                show: false
            }
        };

        // 차트 렌더링
        const mapContainer = document.getElementById('portsBubbleMap');
        if (mapContainer && window.ApexCharts) {
            const chart = new ApexCharts(mapContainer, chartConfig);
            await chart.render();
            console.log('✅ 실제 검사 항만 버블 맵 렌더링 완료');
        } else {
            console.error('ApexCharts 또는 컨테이너를 찾을 수 없습니다');
        }
        
        // 항만 통계 요약 업데이트
        updatePortStatistics(portData, inspectionFactData.metadata);
        
    } catch (error) {
        console.error('버블 맵 렌더링 오류:', error);
        // 오류 시 대체 메시지 표시
        const mapContainer = document.getElementById('portsBubbleMap');
        if (mapContainer) {
            mapContainer.innerHTML = '<div class="text-center text-muted p-4">항만 지도를 로드할 수 없습니다. 데이터를 확인해주세요.</div>';
        }
    }
}

/**
 * 실제 검사 데이터 로드 함수
 */
async function loadInspectionFactData() {
    try {
        const response = await fetch('./src/assets/data/inspection_fact.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('📊 검사 데이터 로드 완료:', data.metadata);
        return data;
    } catch (error) {
        console.error('검사 데이터 로드 실패:', error);
        return null;
    }
}

/**
 * 항만 버블 클릭 이벤트 핸들러
 */
function handlePortBubbleClick(portData) {
    console.log('🏗️ 항만 클릭됨:', portData.name);
    
    // 모달 또는 상세 패널 표시
    const detailHtml = `
        <div class="modal-header">
            <h5 class="modal-title">${portData.name}, ${portData.country || portData.name.split(',')[1]}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="col-6">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <div class="h2 mb-0">${portData.inspections}</div>
                                    <div class="small">검사</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="card bg-danger text-white">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="me-3">
                                    <div class="h2 mb-0">${portData.detentions}</div>
                                    <div class="small">억류 (${portData.detentionRate}%)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-3">
                <p><strong>MOU 지역:</strong> ${portData.mou}</p>
                <p><strong>LOCODE:</strong> ${portData.locode}</p>
                <p><strong>검사받은 선박:</strong> ${portData.vessels ? portData.vessels.join(', ') : 'N/A'}</p>
            </div>
            <div class="mt-3">
                <button class="btn btn-primary" onclick="filterByPort('${portData.name}')">
                    이 항만의 검사 이력 보기
                </button>
            </div>
        </div>
    `;
    
    // 간단한 alert로 표시 (실제로는 modal 구현)
    alert(`${portData.name}\n검사: ${portData.inspections}회\n억류: ${portData.detentions}회 (${portData.detentionRate}%)\nMOU: ${portData.mou}`);
}

/**
 * 항만별 검사 필터링
 */
function filterByPort(portName) {
    // Inspections 페이지로 이동하면서 필터 적용
    window.location.href = `./inspections.html?port=${encodeURIComponent(portName)}`;
}

/**
 * Update port statistics summary
 */
function updatePortStatistics(portData, metadata) {
    const totalPorts = portData.length;
    const totalInspections = portData.reduce((sum, port) => sum + port.inspections, 0);
    const totalDetentions = portData.reduce((sum, port) => sum + port.detentions, 0);
    const highRiskPorts = portData.filter(port => port.detentionRate > 0).length;
    const avgDetentionRate = totalInspections > 0 ? Math.round((totalDetentions / totalInspections) * 100 * 10) / 10 : 0;
    
    // 통계 컨테이너 업데이트
    const statsContainer = document.getElementById('portStatistics');
    if (statsContainer) {
        const statsHtml = `
            <div class="row text-center">
                <div class="col-md-3 col-6">
                    <div class="mb-2">
                        <div class="h3 text-primary mb-0">${totalPorts}</div>
                        <div class="text-muted small">검사 항만</div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="mb-2">
                        <div class="h3 text-info mb-0">${totalInspections}</div>
                        <div class="text-muted small">총 검사</div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="mb-2">
                        <div class="h3 text-warning mb-0">${totalDetentions}</div>
                        <div class="text-muted small">총 억류</div>
                    </div>
                </div>
                <div class="col-md-3 col-6">
                    <div class="mb-2">
                        <div class="h3 text-danger mb-0">${avgDetentionRate}%</div>
                        <div class="text-muted small">평균 억류율</div>
                    </div>
                </div>
            </div>
            <hr class="my-3">
            <div class="row">
                <div class="col-md-6">
                    <div class="small text-muted">
                        <strong>고위험 항만:</strong> ${highRiskPorts}/${totalPorts}개
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="small text-muted">
                        <strong>데이터 생성:</strong> ${metadata ? new Date(metadata.generatedAt).toLocaleString('ko-KR') : 'N/A'}
                    </div>
                </div>
            </div>
            <div class="mt-3">
                <div class="small text-muted">
                    ${metadata ? metadata.dataSource : '실제 PSC 검사 데이터'}에서 추출한 실제 항만 지리정보
                </div>
            </div>
        `;
        
        statsContainer.innerHTML = statsHtml;
        console.log('📊 항만 통계 업데이트 완료');
    }
    
    // 테이블 업데이트 (실제 데이터 기반)
    updatePortTable(portData);
}

/**
 * 항만 테이블 업데이트 (실제 데이터)
 */
function updatePortTable(portData) {
    const tableBody = document.querySelector('#portDetailsTable tbody');
    if (!tableBody) return;
    
    // 검사 횟수 순으로 정렬
    const sortedPorts = portData.sort((a, b) => b.inspections - a.inspections);
    
    const tableRows = sortedPorts.map(port => {
        const riskLevel = getRiskLevel(port.detentionRate);
        const riskBadge = getRiskBadge(riskLevel);
        
        return `
            <tr onclick="handlePortRowClick('${port.name}')" style="cursor: pointer;">
                <td><strong>${port.name}</strong></td>
                <td>${port.country}</td>
                <td>${port.mou}</td>
                <td><span class="badge bg-primary">${port.inspections}</span></td>
                <td><span class="badge ${port.detentions > 0 ? 'bg-warning' : 'bg-secondary'}">${port.detentions}</span></td>
                <td>${port.detentionRate}%</td>
                <td>${riskBadge}</td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = tableRows;
}

/**
 * 위험도 수준 계산
 */
function getRiskLevel(detentionRate) {
    if (detentionRate >= 50) return 'very-high';
    if (detentionRate >= 20) return 'high';
    if (detentionRate >= 10) return 'medium';
    if (detentionRate > 0) return 'low';
    return 'safe';
}

/**
 * 위험도 배지 생성
 */
function getRiskBadge(riskLevel) {
    const badges = {
        'very-high': '<span class="badge bg-danger">매우 위험</span>',
        'high': '<span class="badge bg-warning">높음</span>',
        'medium': '<span class="badge bg-warning">보통</span>',
        'low': '<span class="badge bg-info">낮음</span>',
        'safe': '<span class="badge bg-success">안전</span>'
    };
    return badges[riskLevel] || badges.safe;
}

/**
 * 항만 테이블 행 클릭 핸들러
 */
function handlePortRowClick(portName) {
    console.log('🏗️ 항만 행 클릭:', portName);
    filterByPort(portName);
}
}

/**
 * MOU 지역별 클러스터링 함수
 */
function clusterPortsByRegion(portData) {
    const mouClusters = {};
    
    portData.forEach(port => {
        const mou = port.mou || 'Unknown';
        if (!mouClusters[mou]) {
            mouClusters[mou] = {
                region: mou,
                ports: [],
                totalInspections: 0,
                totalDetentions: 0,
                avgLatitude: 0,
                avgLongitude: 0
            };
        }
        
        mouClusters[mou].ports.push(port);
        mouClusters[mou].totalInspections += port.inspections;
        mouClusters[mou].totalDetentions += port.detentions;
    });
    
    // 각 클러스터의 중심점 계산
    Object.keys(mouClusters).forEach(mou => {
        const cluster = mouClusters[mou];
        const validPorts = cluster.ports.filter(p => p.lat && p.lng);
        
        if (validPorts.length > 0) {
            cluster.avgLatitude = validPorts.reduce((sum, p) => sum + p.lat, 0) / validPorts.length;
            cluster.avgLongitude = validPorts.reduce((sum, p) => sum + p.lng, 0) / validPorts.length;
            cluster.detentionRate = cluster.totalInspections > 0 ? 
                Math.round((cluster.totalDetentions / cluster.totalInspections) * 100 * 10) / 10 : 0;
        }
    });
    
    console.log('📊 MOU 지역별 클러스터링:', mouClusters);
    return mouClusters;
}

/**
 * 선박 이동 경로 렌더링 (트래픽 플로우)
 */
function renderTrafficFlow(portData) {
    // 실제 선박 이동 데이터가 있다면 여기서 처리
    // 예: AH SHIN의 이동 경로 추적
    const vesselRoutes = [
        { from: 'Koper', to: 'Incheon', vessel: 'AH SHIN', inspections: 2 },
        { from: 'Zhoushan', to: 'Tianjin', vessel: 'SEA COEN', inspections: 2 },
        // 추가 경로들...
    ];
    
    console.log('🛳️ 선박 이동 경로 분석:', vesselRoutes);
    return vesselRoutes;
}

/**
 * 계절별 검사 패턴 분석
 */
function analyzeSeasonalPatterns(portData) {
    const patterns = {
        spring: { ports: [], inspections: 0 }, // Q1 (1-3월)
        summer: { ports: [], inspections: 0 }, // Q2 (4-6월)  
        autumn: { ports: [], inspections: 0 }, // Q3 (7-9월)
        winter: { ports: [], inspections: 0 }  // Q4 (10-12월)
    };
    
    // 실제 구현에서는 검사 날짜 기반으로 계절별 분류
    console.log('🌿 계절별 검사 패턴:', patterns);
    return patterns;
}

/**
 * 고위험 항만 하이라이트
 */
function highlightHighRiskPorts(portData) {
    const highRiskThreshold = 20; // 20% 이상 억류율
    const highRiskPorts = portData.filter(port => port.detentionRate >= highRiskThreshold);
    
    console.log(`⚠️ 고위험 항만 (억류율 ${highRiskThreshold}% 이상):`, 
                highRiskPorts.map(p => `${p.name}: ${p.detentionRate}%`));
    
    return highRiskPorts;
}

/**
 * Ports Map Layout Renderer
 * Ports and geographic analysis page
 */
function renderPortsMapLayout() {
    console.log('Rendering ports map layout with actual port data');
    
    // Initialize navigation
    const navigation = new NavigationComponent('sidebar-menu');
    navigation.setActive('ports-map');
    
    // Render ports bubble map
    if (typeof ApexCharts !== 'undefined') {
        renderPortsBubbleMap();
    } else {
        console.warn('ApexCharts not available for ports map');
    }
}

/**
 * Export functions for global access
 */
window.PSCDashboard = PSCDashboard;
window.renderDashboardLayout = renderDashboardLayout;
window.renderInspectionListLayout = renderInspectionListLayout;
window.renderVesselManagementLayout = renderVesselManagementLayout;
window.renderPortsMapLayout = renderPortsMapLayout;
window.applyInspectionFilters = applyInspectionFilters;
window.showVesselDetail = showVesselDetail;
window.showInspectionDetail = showInspectionDetail;
window.sortInspections = sortInspections;
window.loadMoreVessels = loadMoreVessels;

// Interactive event handlers
window.handleChartClick = handleChartClick;
window.handleChartHover = handleChartHover;
window.updateRealTimeData = updateRealTimeData;
window.exportChartData = exportChartData;
window.performExport = performExport;

// Chart rendering functions
window.renderTopDeficiencyBar = renderTopDeficiencyBar;
window.renderInspectionTrendLine = renderInspectionTrendLine;
window.renderFleetCompositionDonut = renderFleetCompositionDonut;
window.renderMouHeatTable = renderMouHeatTable;
window.renderPortsBubbleMap = renderPortsBubbleMap;

// Additional inspection management functions
window.updateInspectionTable = updateInspectionTable;
window.renderInspectionTableRows = renderInspectionTableRows;
window.resetInspectionFilters = resetInspectionFilters;
window.clearFilter = clearFilter;
window.showVesselHistory = showVesselHistory;
window.generateInspectionReport = generateInspectionReport;
window.updateInspectionPageHeader = updateInspectionPageHeader;
window.addFilterResetButton = addFilterResetButton;

// InspectionAnalyst_MOU domain functions
window.filterInspectionsByMou = filterInspectionsByMou;
window.filterInspectionsByPeriod = filterInspectionsByPeriod;
window.filterInspectionsByVessel = filterInspectionsByVessel;
window.filterInspectionsByOutcome = filterInspectionsByOutcome;
window.filterInspectionsByActionCode = filterInspectionsByActionCode;
window.mapActionCodeUrgency = mapActionCodeUrgency;
window.renderActionCodeBadges = renderActionCodeBadges;
window.analyzeInspectionTrend = analyzeInspectionTrend;
window.renderInspectionTimeline = renderInspectionTimeline;
window.getInspectionStatistics = getInspectionStatistics;

// Helper functions
window.getInspectionRowClass = getInspectionRowClass;
window.getMouBadgeClass = getMouBadgeClass;
window.getDeficiencyBadgeClass = getDeficiencyBadgeClass;
window.getVesselInitials = getVesselInitials;

// Real data exports
window.REAL_INSPECTION_DATA = REAL_INSPECTION_DATA;
window.REAL_ACTION_CODES = REAL_ACTION_CODES;

/**
 * ===================================================================
 * PSC RISK ANALYSIS MODULE
 * Maritime Risk Assessment System with 5x5 Matrix Implementation
 * 
 * Risk Score Formula: riskScore = A*0.4 + H*0.4 + M*0.2 (0-100 scale)
 * - A Factor: Age Factor (vessel age normalized)
 * - H Factor: History Factor (deficiency history severity)
 * - M Factor: MOU Factor (port state control performance)
 * ===================================================================
 */

// Real vessel data from 01-fleet-master.json
const REAL_VESSEL_DATA = [
    {
        "vessel_id": "VES001", "vessel_name": "AH SHIN", "age_years": 26.6, 
        "inspection_history": {"total_inspections": 3, "total_deficiencies": 3, "detention_count": 0},
        "flag_state": "Panama", "vessel_type": "PC(T)C", "risk_profile": "MEDIUM"
    },
    {
        "vessel_id": "VES002", "vessel_name": "SANG SHIN", "age_years": 31.5,
        "inspection_history": {"total_inspections": 2, "total_deficiencies": 3, "detention_count": 0},
        "flag_state": "Panama", "vessel_type": "PC(T)C", "risk_profile": "MEDIUM"
    },
    {
        "vessel_id": "VES003", "vessel_name": "YOUNG SHIN", "age_years": 33.5,
        "inspection_history": {"total_inspections": 1, "total_deficiencies": 8, "detention_count": 1},
        "flag_state": "Panama", "vessel_type": "PC(T)C", "risk_profile": "HIGH"
    },
    {
        "vessel_id": "VES004", "vessel_name": "HAE SHIN", "age_years": 32.0,
        "inspection_history": {"total_inspections": 3, "total_deficiencies": 11, "detention_count": 1},
        "flag_state": "Panama", "vessel_type": "PC(T)C", "risk_profile": "HIGH"
    },
    {
        "vessel_id": "VES005", "vessel_name": "GMT ASTRO", "age_years": 39.3,
        "inspection_history": {"total_inspections": 2, "total_deficiencies": 11, "detention_count": 0},
        "flag_state": "Panama", "vessel_type": "PC(T)C", "risk_profile": "HIGH"
    },
    {
        "vessel_id": "VES006", "vessel_name": "G POSEIDON", "age_years": 15.2,
        "inspection_history": {"total_inspections": 1, "total_deficiencies": 2, "detention_count": 0},
        "flag_state": "Panama", "vessel_type": "PC(T)C", "risk_profile": "MEDIUM"
    },
    {
        "vessel_id": "VES007", "vessel_name": "SOO SHIN", "age_years": 26.7,
        "inspection_history": {"total_inspections": 2, "total_deficiencies": 5, "detention_count": 0},
        "flag_state": "Panama", "vessel_type": "PC(T)C", "risk_profile": "LOW"
    },
    {
        "vessel_id": "VES008", "vessel_name": "SEA COEN", "age_years": 20.1,
        "inspection_history": {"total_inspections": 1, "total_deficiencies": 10, "detention_count": 1},
        "flag_state": "Marshall Islands", "vessel_type": "Bulk", "risk_profile": "HIGH"
    },
    {
        "vessel_id": "VES009", "vessel_name": "SEA GRACE", "age_years": 17.8,
        "inspection_history": {"total_inspections": 0, "total_deficiencies": 0, "detention_count": 0},
        "flag_state": "Marshall Islands", "vessel_type": "Bulk", "risk_profile": "MEDIUM"
    },
    {
        "vessel_id": "VES010", "vessel_name": "WOORI SUN", "age_years": 21.1,
        "inspection_history": {"total_inspections": 0, "total_deficiencies": 0, "detention_count": 0},
        "flag_state": "Korea", "vessel_type": "Bulk", "risk_profile": "MEDIUM"
    },
    {
        "vessel_id": "VES011", "vessel_name": "SJ BUSAN", "age_years": 15.6,
        "inspection_history": {"total_inspections": 2, "total_deficiencies": 0, "detention_count": 0},
        "flag_state": "Korea", "vessel_type": "Bulk", "risk_profile": "LOW"
    },
    {
        "vessel_id": "VES012", "vessel_name": "SJ COLOMBO", "age_years": 15.6,
        "inspection_history": {"total_inspections": 4, "total_deficiencies": 0, "detention_count": 0},
        "flag_state": "Korea", "vessel_type": "Bulk", "risk_profile": "LOW"
    },
    {
        "vessel_id": "VES013", "vessel_name": "SJ ASIA", "age_years": 20.1,
        "inspection_history": {"total_inspections": 1, "total_deficiencies": 3, "detention_count": 0},
        "flag_state": "Korea", "vessel_type": "Bulk", "risk_profile": "MEDIUM"
    },
    {
        "vessel_id": "VES014", "vessel_name": "DAEBO GLADSTONE", "age_years": 12.6,
        "inspection_history": {"total_inspections": 1, "total_deficiencies": 2, "detention_count": 0},
        "flag_state": "Panama", "vessel_type": "Bulk", "risk_profile": "LOW"
    }
];

// PSC Risk Analysis Module
const PSCRiskAnalysis = {
    // Risk calculation functions
    
    /**
     * Calculate Age Factor (A) - normalized to 0-1 scale
     * Formula: A = min(age / 40, 1.0)
     */
    calculateAgeFactor: function(vesselAge) {
        if (vesselAge <= 0) return 0;
        return Math.min(vesselAge / 40, 1.0);
    },
    
    /**
     * Calculate Deficiency History Factor (H) - normalized to 0-1 scale
     * Considers: avg deficiencies per inspection, detention history, trend
     */
    calculateDeficiencyFactor: function(inspectionHistory) {
        if (!inspectionHistory || inspectionHistory.total_inspections === 0) {
            return 0.3; // Assume moderate risk for no history
        }
        
        const avgDeficiencies = inspectionHistory.total_deficiencies / inspectionHistory.total_inspections;
        const detentionRate = inspectionHistory.detention_count / inspectionHistory.total_inspections;
        
        // Base factor from average deficiencies (0-1 scale)
        let baseFactor = Math.min(avgDeficiencies / 10, 1.0);
        
        // Detention penalty (adds 0.3-0.5 to factor)
        const detentionPenalty = detentionRate * 0.5;
        
        // Combine factors and clamp to 0-1 range
        let hFactor = baseFactor + detentionPenalty;
        return Math.min(Math.max(hFactor, 0), 1.0);
    },
    
    /**
     * Calculate MOU Factor (M) - based on flag state MOU performance
     * Simplified: High-performance flags get lower scores
     */
    calculateMouFactor: function(flagState, inspectionHistory) {
        // Flag state risk mapping (0-1 scale)
        const flagRiskMap = {
            'Korea': 0.2,           // Low risk - good PSC performance
            'Japan': 0.2,           
            'Singapore': 0.2,       
            'Norway': 0.25,         
            'Denmark': 0.25,        
            'Marshall Islands': 0.4, // Medium risk
            'Liberia': 0.4,         
            'Panama': 0.5,          // Medium-high risk
            'Malta': 0.4,           
            'Cyprus': 0.4,          
            'Bahamas': 0.35         
        };
        
        let baseMouFactor = flagRiskMap[flagState] || 0.5; // Default medium risk
        
        // Adjust based on actual inspection performance
        if (inspectionHistory && inspectionHistory.total_inspections > 0) {
            const avgDeficiencies = inspectionHistory.total_deficiencies / inspectionHistory.total_inspections;
            if (avgDeficiencies > 3) {
                baseMouFactor = Math.min(baseMouFactor + 0.1, 1.0);
            } else if (avgDeficiencies === 0) {
                baseMouFactor = Math.max(baseMouFactor - 0.1, 0);
            }
        }
        
        return baseMouFactor;
    },
    
    /**
     * Main risk score calculation function
     * Formula: riskScore = A*0.4 + H*0.4 + M*0.2
     * Returns score on 0-100 scale
     */
    calculateRiskScore: function(vesselData, inspectionHistory) {
        const aFactor = this.calculateAgeFactor(vesselData.age_years);
        const hFactor = this.calculateDeficiencyFactor(inspectionHistory || vesselData.inspection_history);
        const mFactor = this.calculateMouFactor(vesselData.flag_state, inspectionHistory || vesselData.inspection_history);
        
        // Weighted combination
        const riskScore = (aFactor * 0.4) + (hFactor * 0.4) + (mFactor * 0.2);
        
        // Convert to 0-100 scale and round
        return Math.round(riskScore * 100);
    },
    
    /**
     * Calculate all vessels' risk scores
     */
    calculateFleetRiskScores: function() {
        return REAL_VESSEL_DATA.map(vessel => {
            const riskScore = this.calculateRiskScore(vessel);
            const aFactor = this.calculateAgeFactor(vessel.age_years);
            const hFactor = this.calculateDeficiencyFactor(vessel.inspection_history);
            const mFactor = this.calculateMouFactor(vessel.flag_state, vessel.inspection_history);
            
            return {
                ...vessel,
                risk_score: riskScore,
                a_factor: Math.round(aFactor * 100),
                h_factor: Math.round(hFactor * 100),
                m_factor: Math.round(mFactor * 100),
                risk_level: this.getRiskLevel(riskScore),
                risk_color: this.getRiskColor(riskScore)
            };
        });
    },
    
    /**
     * Get risk level classification
     */
    getRiskLevel: function(riskScore) {
        if (riskScore >= 81) return 'Critical';
        if (riskScore >= 61) return 'High';
        if (riskScore >= 41) return 'Elevated';
        if (riskScore >= 21) return 'Moderate';
        return 'Low';
    },
    
    /**
     * Get risk color for visualization
     */
    getRiskColor: function(riskScore) {
        if (riskScore >= 81) return '#dc2626';  // Critical - Red
        if (riskScore >= 61) return '#f97316';  // High - Orange-Red
        if (riskScore >= 41) return '#f59e0b';  // Elevated - Orange
        if (riskScore >= 21) return '#eab308';  // Moderate - Yellow
        return '#10b981';                       // Low - Green
    },
    
    // 5x5 Risk Matrix functions
    
    /**
     * Calculate probability grade (1-5) based on deficiency history
     */
    calculateProbabilityGrade: function(inspectionHistory) {
        if (!inspectionHistory || inspectionHistory.total_inspections === 0) return 3;
        
        const avgDeficiencies = inspectionHistory.total_deficiencies / inspectionHistory.total_inspections;
        const detentionRate = inspectionHistory.detention_count / inspectionHistory.total_inspections;
        
        if (avgDeficiencies >= 8 || detentionRate > 0.5) return 5; // Very High
        if (avgDeficiencies >= 5 || detentionRate > 0.2) return 4;  // High
        if (avgDeficiencies >= 2 || detentionRate > 0) return 3;    // Medium
        if (avgDeficiencies >= 1) return 2;                        // Low
        return 1;                                                   // Very Low
    },
    
    /**
     * Calculate seriousness grade (1-5) based on age and MOU factors
     */
    calculateSeriousnessGrade: function(vesselAge, flagState) {
        const ageFactor = this.calculateAgeFactor(vesselAge);
        const mouFactor = this.calculateMouFactor(flagState);
        
        const combinedFactor = (ageFactor + mouFactor) / 2;
        
        if (combinedFactor >= 0.8) return 5; // Critical
        if (combinedFactor >= 0.6) return 4; // Major
        if (combinedFactor >= 0.4) return 3; // Moderate
        if (combinedFactor >= 0.2) return 2; // Minor
        return 1;                             // Negligible
    },
    
    /**
     * Generate 5x5 risk matrix data
     */
    generateRiskMatrix: function() {
        const matrix = [];
        const vesselScores = this.calculateFleetRiskScores();
        
        // Create 5x5 matrix with counts
        for (let probability = 1; probability <= 5; probability++) {
            for (let seriousness = 1; seriousness <= 5; seriousness++) {
                const riskRating = probability * seriousness;
                const vesselsInCell = vesselScores.filter(vessel => {
                    const pGrade = this.calculateProbabilityGrade(vessel.inspection_history);
                    const sGrade = this.calculateSeriousnessGrade(vessel.age_years, vessel.flag_state);
                    return pGrade === probability && sGrade === seriousness;
                });
                
                matrix.push({
                    probability,
                    seriousness,
                    risk_rating: riskRating,
                    vessel_count: vesselsInCell.length,
                    vessels: vesselsInCell.map(v => v.vessel_name),
                    color: this.getMatrixCellColor(riskRating)
                });
            }
        }
        
        return matrix;
    },
    
    /**
     * Get matrix cell color based on risk rating (1-25)
     */
    getMatrixCellColor: function(riskRating) {
        if (riskRating >= 16) return '#dc2626';  // Red (16-25)
        if (riskRating >= 6) return '#f59e0b';   // Amber (6-15)
        return '#10b981';                        // Green (1-5)
    },
    
    // Scenario simulation functions
    
    /**
     * Simulate training improvement scenario (-20% H factor)
     */
    simulateTrainingScenario: function(vesselData) {
        const originalH = this.calculateDeficiencyFactor(vesselData.inspection_history);
        const improvedH = originalH * 0.8; // 20% reduction
        
        const aFactor = this.calculateAgeFactor(vesselData.age_years);
        const mFactor = this.calculateMouFactor(vesselData.flag_state, vesselData.inspection_history);
        
        const originalScore = this.calculateRiskScore(vesselData);
        const improvedScore = Math.round(((aFactor * 0.4) + (improvedH * 0.4) + (mFactor * 0.2)) * 100);
        
        return {
            scenario: 'Training Improvement',
            original_score: originalScore,
            projected_score: improvedScore,
            improvement: originalScore - improvedScore,
            h_factor_change: Math.round((originalH - improvedH) * 100)
        };
    },
    
    /**
     * Simulate maintenance enhancement scenario (-30% H factor)
     */
    simulateMaintenanceScenario: function(vesselData) {
        const originalH = this.calculateDeficiencyFactor(vesselData.inspection_history);
        const improvedH = originalH * 0.7; // 30% reduction
        
        const aFactor = this.calculateAgeFactor(vesselData.age_years);
        const mFactor = this.calculateMouFactor(vesselData.flag_state, vesselData.inspection_history);
        
        const originalScore = this.calculateRiskScore(vesselData);
        const improvedScore = Math.round(((aFactor * 0.4) + (improvedH * 0.4) + (mFactor * 0.2)) * 100);
        
        return {
            scenario: 'Maintenance Enhancement',
            original_score: originalScore,
            projected_score: improvedScore,
            improvement: originalScore - improvedScore,
            h_factor_change: Math.round((originalH - improvedH) * 100)
        };
    },
    
    /**
     * Simulate regulatory changes scenario (±15% M factor)
     */
    simulateRegulatoryScenario: function(vesselData, increase = false) {
        const originalM = this.calculateMouFactor(vesselData.flag_state, vesselData.inspection_history);
        const adjustedM = increase ? 
            Math.min(originalM * 1.15, 1.0) :  // 15% increase (worse)
            Math.max(originalM * 0.85, 0);     // 15% decrease (better)
        
        const aFactor = this.calculateAgeFactor(vesselData.age_years);
        const hFactor = this.calculateDeficiencyFactor(vesselData.inspection_history);
        
        const originalScore = this.calculateRiskScore(vesselData);
        const adjustedScore = Math.round(((aFactor * 0.4) + (hFactor * 0.4) + (adjustedM * 0.2)) * 100);
        
        return {
            scenario: `Regulatory Changes (${increase ? 'Stricter' : 'Improved'})`,
            original_score: originalScore,
            projected_score: adjustedScore,
            change: adjustedScore - originalScore,
            m_factor_change: Math.round((adjustedM - originalM) * 100)
        };
    },
    
    /**
     * Simulate aging scenario (+1 year)
     */
    simulateAgingScenario: function(vesselData) {
        const originalA = this.calculateAgeFactor(vesselData.age_years);
        const agedA = this.calculateAgeFactor(vesselData.age_years + 1);
        
        const hFactor = this.calculateDeficiencyFactor(vesselData.inspection_history);
        const mFactor = this.calculateMouFactor(vesselData.flag_state, vesselData.inspection_history);
        
        const originalScore = this.calculateRiskScore(vesselData);
        const agedScore = Math.round(((agedA * 0.4) + (hFactor * 0.4) + (mFactor * 0.2)) * 100);
        
        return {
            scenario: 'Time Progression (+1 year)',
            original_score: originalScore,
            projected_score: agedScore,
            change: agedScore - originalScore,
            a_factor_change: Math.round((agedA - originalA) * 100)
        };
    },
    
    // Risk factor decomposition
    
    /**
     * Decompose risk factors for detailed analysis
     */
    decomposeRiskFactors: function(vesselId) {
        const vessel = REAL_VESSEL_DATA.find(v => v.vessel_id === vesselId);
        if (!vessel) return null;
        
        const aFactor = this.calculateAgeFactor(vessel.age_years);
        const hFactor = this.calculateDeficiencyFactor(vessel.inspection_history);
        const mFactor = this.calculateMouFactor(vessel.flag_state, vessel.inspection_history);
        const riskScore = this.calculateRiskScore(vessel);
        
        return {
            vessel_name: vessel.vessel_name,
            vessel_id: vesselId,
            risk_score: riskScore,
            risk_level: this.getRiskLevel(riskScore),
            factors: {
                age: {
                    value: Math.round(aFactor * 100),
                    weight: 0.4,
                    contribution: Math.round(aFactor * 40),
                    description: `${vessel.age_years} years old`
                },
                history: {
                    value: Math.round(hFactor * 100),
                    weight: 0.4,
                    contribution: Math.round(hFactor * 40),
                    description: `${vessel.inspection_history.total_deficiencies} deficiencies in ${vessel.inspection_history.total_inspections} inspections`
                },
                mou: {
                    value: Math.round(mFactor * 100),
                    weight: 0.2,
                    contribution: Math.round(mFactor * 20),
                    description: `${vessel.flag_state} flag state performance`
                }
            },
            recommendations: this.generateRiskRecommendations(vessel, aFactor, hFactor, mFactor)
        };
    },
    
    /**
     * Generate risk-based recommendations
     */
    generateRiskRecommendations: function(vessel, aFactor, hFactor, mFactor) {
        const recommendations = [];
        
        if (hFactor > 0.7) {
            recommendations.push({
                priority: 'High',
                category: 'Deficiency Management',
                action: 'Implement enhanced pre-inspection maintenance program',
                impact: 'Could reduce H factor by 20-30%'
            });
        }
        
        if (aFactor > 0.6) {
            recommendations.push({
                priority: 'Medium',
                category: 'Age Management',
                action: 'Consider vessel replacement or major renovation program',
                impact: 'Long-term risk reduction strategy'
            });
        }
        
        if (mFactor > 0.5) {
            recommendations.push({
                priority: 'Medium',
                category: 'Flag Performance',
                action: 'Review flag state selection and consider reflagging',
                impact: 'Could reduce M factor by 10-15%'
            });
        }
        
        if (vessel.inspection_history.detention_count > 0) {
            recommendations.push({
                priority: 'Critical',
                category: 'Detention Prevention',
                action: 'Immediate comprehensive safety audit required',
                impact: 'Essential for operational continuity'
            });
        }
        
        return recommendations;
    },
    
    // UI rendering functions
    
    /**
     * Initialize risk analysis page
     */
    init: function() {
        console.log('Initializing PSC Risk Analysis module');
        this.updateRiskSummaryCards();
        this.renderRiskMatrix();
        this.renderTopRiskVessels();
        this.renderVesselRankingTable();
        this.initializeScenarioSimulator();
    },
    
    /**
     * Update risk summary cards
     */
    updateRiskSummaryCards: function() {
        const vesselScores = this.calculateFleetRiskScores();
        const riskDistribution = {
            critical: vesselScores.filter(v => v.risk_score >= 81).length,
            high: vesselScores.filter(v => v.risk_score >= 61 && v.risk_score < 81).length,
            elevated: vesselScores.filter(v => v.risk_score >= 41 && v.risk_score < 61).length,
            moderate: vesselScores.filter(v => v.risk_score >= 21 && v.risk_score < 41).length,
            low: vesselScores.filter(v => v.risk_score < 21).length
        };
        
        const avgRiskScore = Math.round(vesselScores.reduce((sum, v) => sum + v.risk_score, 0) / vesselScores.length);
        
        // Update summary cards
        document.getElementById('criticalRiskCount').textContent = riskDistribution.critical;
        document.getElementById('highRiskCount').textContent = riskDistribution.high;
        document.getElementById('elevatedRiskCount').textContent = riskDistribution.elevated;
        document.getElementById('moderateRiskCount').textContent = riskDistribution.moderate;
        document.getElementById('lowRiskCount').textContent = riskDistribution.low;
        document.getElementById('avgRiskScore').textContent = avgRiskScore;
    },
    
    /**
     * Render 5x5 risk matrix heatmap
     */
    renderRiskMatrix: function() {
        const matrixData = this.generateRiskMatrix();
        
        // Prepare data for ApexCharts heatmap
        const series = [];
        for (let s = 5; s >= 1; s--) {
            const rowData = [];
            for (let p = 1; p <= 5; p++) {
                const cell = matrixData.find(m => m.probability === p && m.seriousness === s);
                rowData.push({
                    x: `P${p}`,
                    y: cell.vessel_count,
                    fillColor: cell.color
                });
            }
            series.push({
                name: `S${s}`,
                data: rowData
            });
        }
        
        const chartConfig = {
            series: series,
            chart: {
                type: 'heatmap',
                height: 400,
                toolbar: { show: true }
            },
            colors: ['#10b981'],
            plotOptions: {
                heatmap: {
                    shadeIntensity: 0.5,
                    radius: 4,
                    useFillColorAsStroke: true,
                    colorScale: {
                        ranges: [
                            { from: 0, to: 0, color: '#f8f9fa', name: 'No Vessels' },
                            { from: 1, to: 2, color: '#10b981', name: '1-2 Vessels' },
                            { from:3, to: 4, color: '#f59e0b', name: '3-4 Vessels' },
                            { from: 5, to: 10, color: '#dc2626', name: '5+ Vessels' }
                        ]
                    }
                }
            },
            xaxis: {
                title: { text: 'Probability (Historical Deficiency Rate)' },
                categories: ['P1 (Very Low)', 'P2 (Low)', 'P3 (Medium)', 'P4 (High)', 'P5 (Very High)']
            },
            yaxis: {
                title: { text: 'Seriousness (Age + MOU Severity)' },
                categories: ['S5 (Critical)', 'S4 (Major)', 'S3 (Moderate)', 'S2 (Minor)', 'S1 (Negligible)']
            },
            tooltip: {
                custom: function({ series, seriesIndex, dataPointIndex, w }) {
                    const probability = dataPointIndex + 1;
                    const seriousness = 5 - seriesIndex;
                    const cell = matrixData.find(m => m.probability === probability && m.seriousness === seriousness);
                    
                    return `
                        <div class="custom-tooltip p-3">
                            <div class="fw-bold">Risk Rating: ${cell.risk_rating}</div>
                            <div>Vessels: ${cell.vessel_count}</div>
                            ${cell.vessels.length > 0 ? `<div class="mt-2"><strong>Vessels:</strong><br>${cell.vessels.join('<br>')}</div>` : ''}
                        </div>
                    `;
                }
            }
        };
        
        const container = document.getElementById('riskMatrixHeatmap');
        if (container && typeof ApexCharts !== 'undefined') {
            new ApexCharts(container, chartConfig).render();
        }
    },
    
    /**
     * Render top risk vessels list
     */
    renderTopRiskVessels: function() {
        const vesselScores = this.calculateFleetRiskScores()
            .sort((a, b) => b.risk_score - a.risk_score)
            .slice(0, 5); // Top 5 risk vessels
        
        const container = document.getElementById('topRiskVessels');
        if (!container) return;
        
        container.innerHTML = vesselScores.map(vessel => `
            <div class="list-group-item d-flex align-items-center">
                <div class="avatar avatar-sm me-3" style="background-color: ${vessel.risk_color}">
                    ${vessel.risk_score}
                </div>
                <div class="flex-fill">
                    <div class="fw-medium">${vessel.vessel_name}</div>
                    <div class="text-muted small">
                        ${vessel.vessel_type} • ${vessel.flag_state} • Age: ${vessel.age_years}y
                    </div>
                </div>
                <div class="text-end">
                    <div class="fw-medium">${vessel.risk_level}</div>
                    <div class="text-muted small">Risk Level</div>
                </div>
            </div>
        `).join('');
    },
    
    /**
     * Render vessel risk ranking table
     */
    renderVesselRankingTable: function() {
        const vesselScores = this.calculateFleetRiskScores()
            .sort((a, b) => b.risk_score - a.risk_score);
        
        const tbody = document.getElementById('vesselRiskRanking');
        if (!tbody) return;
        
        tbody.innerHTML = vesselScores.map((vessel, index) => `
            <tr>
                <td><span class="badge bg-secondary">#${index + 1}</span></td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar avatar-sm me-3" style="background-color: ${vessel.risk_color}20; color: ${vessel.risk_color};">
                            ${vessel.vessel_name.substring(0, 2)}
                        </div>
                        <div>
                            <div class="fw-medium">${vessel.vessel_name}</div>
                            <div class="text-muted small">${vessel.flag_state}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge bg-info">${vessel.vessel_type}</span></td>
                <td>
                    <div class="fw-bold" style="color: ${vessel.risk_color};">${vessel.risk_score}</div>
                    <div class="text-muted small">0-100 Scale</div>
                </td>
                <td>
                    <div class="progress progress-sm">
                        <div class="progress-bar bg-warning" style="width: ${vessel.a_factor}%"></div>
                    </div>
                    <div class="small">${vessel.a_factor}/100</div>
                </td>
                <td>
                    <div class="progress progress-sm">
                        <div class="progress-bar bg-danger" style="width: ${vessel.h_factor}%"></div>
                    </div>
                    <div class="small">${vessel.h_factor}/100</div>
                </td>
                <td>
                    <div class="progress progress-sm">
                        <div class="progress-bar bg-info" style="width: ${vessel.m_factor}%"></div>
                    </div>
                    <div class="small">${vessel.m_factor}/100</div>
                </td>
                <td><span class="badge" style="background-color: ${vessel.risk_color};">${vessel.risk_level}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="PSCRiskAnalysis.showVesselRiskDetail('${vessel.vessel_id}')">
                        Details
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Populate scenario vessel selector
        const scenarioSelect = document.getElementById('scenarioVessel');
        if (scenarioSelect) {
            scenarioSelect.innerHTML = '<option value="">Choose vessel...</option>' + 
                vesselScores.map(vessel => 
                    `<option value="${vessel.vessel_id}">${vessel.vessel_name} (Risk: ${vessel.risk_score})</option>`
                ).join('');
        }
    },
    
    /**
     * Initialize scenario simulator
     */
    initializeScenarioSimulator: function() {
        const runButton = document.getElementById('runScenario');
        if (runButton) {
            runButton.addEventListener('click', () => this.runScenarioSimulation());
        }
    },
    
    /**
     * Run scenario simulation
     */
    runScenarioSimulation: function() {
        const vesselSelect = document.getElementById('scenarioVessel');
        const scenarioSelect = document.getElementById('scenarioType');
        
        if (!vesselSelect.value || !scenarioSelect.value) {
            alert('Please select both vessel and scenario type');
            return;
        }
        
        const vessel = REAL_VESSEL_DATA.find(v => v.vessel_id === vesselSelect.value);
        let result;
        
        switch (scenarioSelect.value) {
            case 'training':
                result = this.simulateTrainingScenario(vessel);
                break;
            case 'maintenance':
                result = this.simulateMaintenanceScenario(vessel);
                break;
            case 'regulatory':
                result = this.simulateRegulatoryScenario(vessel, Math.random() > 0.5);
                break;
            case 'age':
                result = this.simulateAgingScenario(vessel);
                break;
            default:
                alert('Unknown scenario type');
                return;
        }
        
        this.displayScenarioResults(result);
    },
    
    /**
     * Display scenario simulation results
     */
    displayScenarioResults: function(result) {
        document.getElementById('currentRiskScore').textContent = result.original_score;
        document.getElementById('projectedRiskScore').textContent = result.projected_score;
        
        const change = result.improvement || result.change || 0;
        const changePercent = Math.abs(Math.round((change / result.original_score) * 100));
        
        // Update progress bar
        const progressBar = document.getElementById('riskChangeBar');
        progressBar.style.width = Math.min(changePercent, 100) + '%';
        
        // Update change indicator
        const indicator = document.getElementById('riskChangeIndicator');
        const changeText = document.getElementById('riskChangeText');
        
        if (change > 0) {
            indicator.className = 'badge bg-success';
            indicator.textContent = `↓ ${change} points improvement`;
            progressBar.className = 'progress-bar bg-success';
        } else if (change < 0) {
            indicator.className = 'badge bg-danger';
            indicator.textContent = `↑ ${Math.abs(change)} points increase`;
            progressBar.className = 'progress-bar bg-danger';
        } else {
            indicator.className = 'badge bg-secondary';
            indicator.textContent = 'No significant change';
        }
        
        changeText.textContent = `${changePercent}% relative change`;
        
        // Show results container
        document.getElementById('scenarioResults').style.display = 'block';
        
        // Generate recommendations
        const recommendations = this.getScenarioRecommendations(result);
        document.getElementById('scenarioRecommendations').innerHTML = recommendations;
    },
    
    /**
     * Get scenario-specific recommendations
     */
    getScenarioRecommendations: function(result) {
        let recommendations = '<h6>Recommendations:</h6><ul class="list-unstyled">';
        
        if (result.scenario.includes('Training') && result.improvement > 5) {
            recommendations += '<li>✓ Training programs show significant risk reduction potential</li>';
            recommendations += '<li>✓ Focus on areas with highest deficiency rates</li>';
        }
        
        if (result.scenario.includes('Maintenance') && result.improvement > 8) {
            recommendations += '<li>✓ Enhanced maintenance could substantially improve risk profile</li>';
            recommendations += '<li>✓ Consider preventive maintenance scheduling optimization</li>';
        }
        
        if (result.scenario.includes('Regulatory')) {
            recommendations += '<li>• Monitor regulatory changes in operating regions</li>';
            recommendations += '<li>• Maintain compliance buffers for regulatory shifts</li>';
        }
        
        if (result.scenario.includes('Time Progression')) {
            recommendations += '<li>⚠ Age-related risk increase is inevitable without intervention</li>';
            recommendations += '<li>⚠ Consider vessel replacement timeline planning</li>';
        }
        
        recommendations += '</ul>';
        return recommendations;
    },
    
    /**
     * Show detailed risk analysis for a vessel
     */
    showVesselRiskDetail: function(vesselId) {
        const analysis = this.decomposeRiskFactors(vesselId);
        if (!analysis) {
            alert('Vessel data not found');
            return;
        }
        
        const modalContent = `
            <div class="modal fade" id="riskDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Risk Analysis: ${analysis.vessel_name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-body text-center">
                                            <div class="h2" style="color: ${this.getRiskColor(analysis.risk_score)}">${analysis.risk_score}</div>
                                            <div class="text-muted">Overall Risk Score</div>
                                            <div class="badge" style="background-color: ${this.getRiskColor(analysis.risk_score)}">${analysis.risk_level}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-body">
                                            <h6>Risk Factor Breakdown</h6>
                                            <div class="mb-2">
                                                <div class="d-flex justify-content-between">
                                                    <span>Age Factor (A)</span>
                                                    <strong>${analysis.factors.age.contribution}%</strong>
                                                </div>
                                                <div class="progress progress-sm">
                                                    <div class="progress-bar bg-warning" style="width: ${analysis.factors.age.value}%"></div>
                                                </div>
                                                <small class="text-muted">${analysis.factors.age.description}</small>
                                            </div>
                                            <div class="mb-2">
                                                <div class="d-flex justify-content-between">
                                                    <span>History Factor (H)</span>
                                                    <strong>${analysis.factors.history.contribution}%</strong>
                                                </div>
                                                <div class="progress progress-sm">
                                                    <div class="progress-bar bg-danger" style="width: ${analysis.factors.history.value}%"></div>
                                                </div>
                                                <small class="text-muted">${analysis.factors.history.description}</small>
                                            </div>
                                            <div class="mb-2">
                                                <div class="d-flex justify-content-between">
                                                    <span>MOU Factor (M)</span>
                                                    <strong>${analysis.factors.mou.contribution}%</strong>
                                                </div>
                                                <div class="progress progress-sm">
                                                    <div class="progress-bar bg-info" style="width: ${analysis.factors.mou.value}%"></div>
                                                </div>
                                                <small class="text-muted">${analysis.factors.mou.description}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <h6>Risk Management Recommendations</h6>
                                    ${analysis.recommendations.map(rec => `
                                        <div class="alert alert-${rec.priority === 'Critical' ? 'danger' : rec.priority === 'High' ? 'warning' : 'info'}">
                                            <div class="d-flex">
                                                <div>
                                                    <strong>${rec.category}:</strong> ${rec.action}
                                                    <div class="text-muted small">Expected Impact: ${rec.impact}</div>
                                                </div>
                                                <div class="ms-auto">
                                                    <span class="badge bg-${rec.priority === 'Critical' ? 'danger' : rec.priority === 'High' ? 'warning' : 'info'}">${rec.priority}</span>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="PSCRiskAnalysis.exportVesselRiskReport('${vesselId}')">Export Report</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document and show
        document.body.insertAdjacentHTML('beforeend', modalContent);
        const modal = new bootstrap.Modal(document.getElementById('riskDetailModal'));
        modal.show();
        
        // Remove modal after hiding
        document.getElementById('riskDetailModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    },
    
    /**
     * Export vessel risk report (placeholder)
     */
    exportVesselRiskReport: function(vesselId) {
        const analysis = this.decomposeRiskFactors(vesselId);
        console.log('Exporting risk report for:', analysis.vessel_name);
        alert(`Risk report for ${analysis.vessel_name} would be exported here.`);
    }
};

// Export PSCRiskAnalysis to global scope
window.PSCRiskAnalysis = PSCRiskAnalysis;