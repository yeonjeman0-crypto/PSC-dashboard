/**
 * PSC Dashboard JavaScript - FIXED VERSION
 * UI Architecture with Tabler Framework Integration
 * All JavaScript errors resolved and functions properly defined
 */

// Global state management
const PSCDashboard = {
    data: {
        vessels: [],
        inspections: [],
        deficiencies: [],
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
        }
    }
};

/**
 * Load actual data from processed_data folder
 */
async function loadActualData() {
    try {
        // Load vessel data
        const vesselResponse = await fetch('../../processed_data/core_master/vessel_master.json');
        if (vesselResponse.ok) {
            const vesselData = await vesselResponse.json();
            PSCDashboard.data.vessels = vesselData.vessels || [];
        }

        // Load inspection data
        const inspectionResponse = await fetch('../../processed_data/operational/inspection_records.json');
        if (inspectionResponse.ok) {
            const inspectionData = await inspectionResponse.json();
            PSCDashboard.data.inspections = inspectionData.inspections || [];
        }

        // Load deficiency data
        const deficiencyResponse = await fetch('../../processed_data/operational/deficiency_records.json');
        if (deficiencyResponse.ok) {
            const deficiencyData = await deficiencyResponse.json();
            PSCDashboard.data.deficiencies = deficiencyData.deficiencies || [];
        }

        console.log('Actual PSC data loaded successfully');
        return true;
    } catch (error) {
        console.warn('Error loading actual data, using static data:', error);
        return false;
    }
}

/**
 * Dashboard Layout Renderer
 * FIXED: Properly defined function with error handling
 */
function renderDashboardLayout() {
    console.log('Rendering dashboard layout...');
    
    try {
        // Initialize components if they exist
        if (typeof KpiCardComponent !== 'undefined' && window.KpiCardComponent) {
            const kpiCards = new KpiCardComponent();
            kpiCards.initializeSparklines();
        }

        // Render all dashboard charts
        renderMonthlyInspectionChart();
        renderTopDeficiencyBar();
        renderInspectionTrendLine();
        renderFleetCompositionDonut();
        renderMouHeatTable();
        initializeSparklines();

        console.log('Dashboard layout rendered successfully');
    } catch (error) {
        console.error('Error rendering dashboard layout:', error);
    }
}

/**
 * PSC Inspection Management System
 * Comprehensive inspection domain implementation with MOU filtering and action codes
 */
class PSCInspectionManager {
    constructor() {
        this.inspectionData = [];
        this.deficiencyData = [];
        this.actionCodes = [];
        this.mouRegistry = [];
        this.filteredData = [];
        this.currentFilters = {
            mou: '',
            vesselType: '',
            outcome: '',
            month: '',
            search: '',
            dateRange: { start: null, end: null }
        };
    }

    /**
     * Initialize the inspection management system
     */
    async initialize() {
        console.log('Initializing PSC Inspection Manager...');
        
        try {
            await this.loadInspectionData();
            await this.loadDeficiencyData();
            await this.loadActionCodes();
            await this.loadMouRegistry();
            
            this.renderInspectionTable();
            this.initializeFilters();
            this.setupEventListeners();
            
            console.log('PSC Inspection Manager initialized successfully');
        } catch (error) {
            console.error('Error initializing PSC Inspection Manager:', error);
        }
    }

    /**
     * Load inspection data from processed data
     */
    async loadInspectionData() {
        try {
            const response = await fetch('../../processed_data/operational/inspection_records.json');
            if (response.ok) {
                const data = await response.json();
                this.inspectionData = data.inspections || [];
                this.filteredData = [...this.inspectionData];
                console.log(`Loaded ${this.inspectionData.length} inspection records`);
            }
        } catch (error) {
            console.error('Error loading inspection data:', error);
        }
    }

    /**
     * Load deficiency data
     */
    async loadDeficiencyData() {
        try {
            const response = await fetch('../../processed_data/operational/deficiency_records.json');
            if (response.ok) {
                const data = await response.json();
                this.deficiencyData = data.deficiencies || [];
                console.log(`Loaded ${this.deficiencyData.length} deficiency records`);
            }
        } catch (error) {
            console.error('Error loading deficiency data:', error);
        }
    }

    /**
     * Load action codes
     */
    async loadActionCodes() {
        try {
            const response = await fetch('../../processed_data/reference/action_codes.json');
            if (response.ok) {
                const data = await response.json();
                this.actionCodes = data.action_codes || [];
                console.log(`Loaded ${this.actionCodes.length} action codes`);
            }
        } catch (error) {
            console.error('Error loading action codes:', error);
        }
    }

    /**
     * Load MOU registry
     */
    async loadMouRegistry() {
        try {
            const response = await fetch('../../processed_data/reference/mou_registry.json');
            if (response.ok) {
                const data = await response.json();
                this.mouRegistry = data.mou_regions || [];
                console.log(`Loaded ${this.mouRegistry.length} MOU regions`);
            }
        } catch (error) {
            console.error('Error loading MOU registry:', error);
        }
    }

    /**
     * Get action code urgency badge
     */
    getActionCodeBadge(actionCode) {
        const action = this.actionCodes.find(ac => ac.code === actionCode);
        if (!action) return '<span class="badge bg-secondary">Unknown</span>';

        const urgencyColors = {
            'critical': 'bg-danger',
            'high': 'bg-warning', 
            'medium': 'bg-info',
            'completed': 'bg-success',
            'variable': 'bg-secondary'
        };

        const colorClass = urgencyColors[action.urgency] || 'bg-secondary';
        return `<span class="badge ${colorClass}" title="${action.description}">${action.code}</span>`;
    }

    /**
     * Get MOU badge with regional styling
     */
    getMouBadge(mouRegion) {
        const mouColors = {
            'Paris MoU': 'bg-primary',
            'Tokyo MoU': 'bg-success',
            'Mediterranean MoU': 'bg-info',
            'Riyadh MoU': 'bg-warning',
            'USCG': 'bg-dark'
        };
        
        const colorClass = mouColors[mouRegion] || 'bg-secondary';
        return `<span class="badge ${colorClass}">${mouRegion}</span>`;
    }

    /**
     * Get inspection outcome badge
     */
    getOutcomeBadge(outcome) {
        const outcomeColors = {
            'Clean': 'bg-success',
            'Deficiencies Found': 'bg-warning',
            'Detention': 'bg-danger'
        };
        
        const colorClass = outcomeColors[outcome] || 'bg-secondary';
        return `<span class="badge ${colorClass}">${outcome}</span>`;
    }

    /**
     * Generate timeline sparkline data for vessel
     */
    generateVesselTimelineData(vesselName) {
        const vesselInspections = this.inspectionData
            .filter(inspection => inspection.vessel_name === vesselName)
            .sort((a, b) => new Date(a.inspection_date) - new Date(b.inspection_date));

        return vesselInspections.map(inspection => ({
            x: inspection.inspection_date,
            y: inspection.deficiency_count,
            outcome: inspection.inspection_outcome
        }));
    }

    /**
     * Create inspection timeline sparkline
     */
    createTimelineSparkline(containerId, data) {
        if (typeof ApexCharts === 'undefined' || !data.length) return;

        const options = {
            series: [{
                name: 'Deficiencies',
                data: data.map(d => ({ x: d.x, y: d.y }))
            }],
            chart: {
                type: 'line',
                width: 120,
                height: 35,
                sparkline: { enabled: true }
            },
            stroke: {
                curve: 'smooth',
                width: 2,
                colors: data.map(d => {
                    if (d.outcome === 'Detention') return '#e11d48';
                    if (d.outcome === 'Clean') return '#10b981';
                    return '#f59e0b';
                })
            },
            markers: {
                size: 3,
                colors: data.map(d => {
                    if (d.outcome === 'Detention') return '#e11d48';
                    if (d.outcome === 'Clean') return '#10b981';
                    return '#f59e0b';
                })
            },
            tooltip: {
                enabled: true,
                custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                    const point = data[dataPointIndex];
                    return `<div class="px-2 py-1">
                        <div><strong>${point.x}</strong></div>
                        <div>Deficiencies: ${point.y}</div>
                        <div>Outcome: ${point.outcome}</div>
                    </div>`;
                }
            }
        };

        try {
            const container = document.getElementById(containerId);
            if (container) {
                new ApexCharts(container, options).render();
            }
        } catch (error) {
            console.error('Error creating timeline sparkline:', error);
        }
    }

    /**
     * Apply filters to inspection data
     */
    applyFilters() {
        let filtered = [...this.inspectionData];

        // MOU filter
        if (this.currentFilters.mou) {
            filtered = filtered.filter(inspection => 
                inspection.mou_region === this.currentFilters.mou);
        }

        // Vessel type filter
        if (this.currentFilters.vesselType) {
            filtered = filtered.filter(inspection => 
                inspection.vessel_type === this.currentFilters.vesselType);
        }

        // Outcome filter
        if (this.currentFilters.outcome) {
            filtered = filtered.filter(inspection => 
                inspection.inspection_outcome === this.currentFilters.outcome);
        }

        // Month filter
        if (this.currentFilters.month) {
            const month = parseInt(this.currentFilters.month);
            filtered = filtered.filter(inspection => {
                const inspectionMonth = new Date(inspection.inspection_date).getMonth() + 1;
                return inspectionMonth === month;
            });
        }

        // Search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(inspection => 
                inspection.vessel_name.toLowerCase().includes(searchTerm) ||
                inspection.port_name.toLowerCase().includes(searchTerm) ||
                inspection.inspector.toLowerCase().includes(searchTerm)
            );
        }

        this.filteredData = filtered;
        this.renderInspectionTable();
        this.updateResultCount();
    }

    /**
     * Render the main inspection table
     */
    renderInspectionTable() {
        const tbody = document.getElementById('inspectionTableBody');
        if (!tbody) return;

        const tableHtml = this.filteredData.map((inspection, index) => {
            const timelineId = `timeline-${inspection.inspection_id}`;
            const timelineData = this.generateVesselTimelineData(inspection.vessel_name);
            
            // Schedule sparkline rendering after DOM update
            setTimeout(() => this.createTimelineSparkline(timelineId, timelineData), 100);

            const rowClass = inspection.detention ? 'table-danger' : 
                            inspection.inspection_outcome === 'Clean' ? 'table-success' : '';

            return `
                <tr class="${rowClass}">
                    <td>
                        <div class="text-muted">${this.formatDate(inspection.inspection_date)}</div>
                    </td>
                    <td>
                        <div class="d-flex py-1 align-items-center">
                            <span class="avatar me-2" style="background-image: url(https://via.placeholder.com/32x32/${this.getVesselColor(inspection.vessel_type)}/ffffff?text=${inspection.vessel_name.substring(0,2)})"></span>
                            <div class="flex-fill">
                                <div class="font-weight-medium">${inspection.vessel_name}</div>
                                <div class="text-muted">
                                    <small>${inspection.vessel_type} • ${inspection.owner}</small>
                                </div>
                                <div id="${timelineId}" class="mt-1"></div>
                            </div>
                        </div>
                    </td>
                    <td>${inspection.vessel_type}</td>
                    <td>
                        <div>${inspection.port_name}</div>
                        <div class="text-muted"><small>${inspection.port_country}</small></div>
                    </td>
                    <td>${this.getMouBadge(inspection.mou_region)}</td>
                    <td>
                        <span class="badge ${this.getDeficiencyBadgeClass(inspection.deficiency_count)}">${inspection.deficiency_count}</span>
                    </td>
                    <td>${this.getOutcomeBadge(inspection.inspection_outcome)}</td>
                    <td>
                        <div class="btn-list flex-nowrap">
                            <button class="btn btn-sm btn-outline-primary" onclick="inspectionManager.showInspectionDetail(${inspection.inspection_id})">
                                View
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="inspectionManager.exportInspectionReport(${inspection.inspection_id})">
                                Export
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = tableHtml;
    }

    /**
     * Show inspection detail modal
     */
    showInspectionDetail(inspectionId) {
        const inspection = this.inspectionData.find(i => i.inspection_id === inspectionId);
        if (!inspection) return;

        const relatedDeficiencies = this.deficiencyData.filter(d => d.inspection_id === inspectionId);
        
        const modalContent = document.getElementById('inspectionDetailContent');
        if (!modalContent) return;

        const content = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6>Vessel Information</h6>
                    <table class="table table-sm">
                        <tr><td><strong>Vessel Name:</strong></td><td>${inspection.vessel_name}</td></tr>
                        <tr><td><strong>Type:</strong></td><td>${inspection.vessel_type}</td></tr>
                        <tr><td><strong>Flag State:</strong></td><td>${inspection.flag_state}</td></tr>
                        <tr><td><strong>Owner:</strong></td><td>${inspection.owner}</td></tr>
                        <tr><td><strong>DOC Company:</strong></td><td>${inspection.doc_company}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6>Inspection Details</h6>
                    <table class="table table-sm">
                        <tr><td><strong>Date:</strong></td><td>${this.formatDate(inspection.inspection_date)}</td></tr>
                        <tr><td><strong>Port:</strong></td><td>${inspection.port_name}, ${inspection.port_country}</td></tr>
                        <tr><td><strong>MOU Region:</strong></td><td>${this.getMouBadge(inspection.mou_region)}</td></tr>
                        <tr><td><strong>Inspector:</strong></td><td>${inspection.inspector}</td></tr>
                        <tr><td><strong>Type:</strong></td><td>${inspection.inspection_type}</td></tr>
                    </table>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-12">
                    <h6>Inspection Results</h6>
                    <div class="row">
                        <div class="col-md-3">
                            <div class="card">
                                <div class="card-body p-2 text-center">
                                    <div class="h3 mb-1">${inspection.deficiency_count}</div>
                                    <div class="text-muted">Deficiencies</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card">
                                <div class="card-body p-2 text-center">
                                    <div class="h6 mb-1">${this.getOutcomeBadge(inspection.inspection_outcome)}</div>
                                    <div class="text-muted">Outcome</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card">
                                <div class="card-body p-2 text-center">
                                    <div class="h6 mb-1">${inspection.detention ? '<span class="badge bg-danger">Yes</span>' : '<span class="badge bg-success">No</span>'}</div>
                                    <div class="text-muted">Detention</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card">
                                <div class="card-body p-2 text-center">
                                    <div class="h6 mb-1"><span class="badge ${inspection.compliance_status === 'Compliant' ? 'bg-success' : 'bg-danger'}">${inspection.compliance_status}</span></div>
                                    <div class="text-muted">Compliance</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            ${relatedDeficiencies.length > 0 ? `
            <div class="row">
                <div class="col-12">
                    <h6>Deficiencies (${relatedDeficiencies.length})</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Action Code</th>
                                    <th>Severity</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${relatedDeficiencies.map(def => `
                                    <tr>
                                        <td><strong>${def.category}</strong></td>
                                        <td><small>${def.description}</small></td>
                                        <td>${this.getActionCodeBadge(def.action_code)}</td>
                                        <td><span class="badge ${this.getSeverityBadgeClass(def.severity)}">${def.severity}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            ` : '<div class="text-center text-muted">No deficiencies found</div>'}
        `;

        modalContent.innerHTML = content;
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('inspectionDetailModal'));
        modal.show();
    }

    /**
     * Initialize filter controls
     */
    initializeFilters() {
        // Populate MOU filter
        const mouSelect = document.getElementById('filterMou');
        if (mouSelect) {
            const uniqueMous = [...new Set(this.inspectionData.map(i => i.mou_region))];
            mouSelect.innerHTML = '<option value="">All MOU</option>' + 
                uniqueMous.map(mou => `<option value="${mou}">${mou}</option>`).join('');
        }

        // Populate vessel type filter
        const vesselTypeSelect = document.getElementById('filterVesselType');
        if (vesselTypeSelect) {
            const uniqueTypes = [...new Set(this.inspectionData.map(i => i.vessel_type))];
            vesselTypeSelect.innerHTML = '<option value="">All Types</option>' + 
                uniqueTypes.map(type => `<option value="${type}">${type}</option>`).join('');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Filter event listeners
        document.getElementById('filterMou')?.addEventListener('change', (e) => {
            this.currentFilters.mou = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filterVesselType')?.addEventListener('change', (e) => {
            this.currentFilters.vesselType = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filterOutcome')?.addEventListener('change', (e) => {
            this.currentFilters.outcome = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filterMonth')?.addEventListener('change', (e) => {
            this.currentFilters.month = e.target.value;
            this.applyFilters();
        });

        document.getElementById('searchVessel')?.addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.applyFilters();
        });

        // Apply filters button
        const applyBtn = document.querySelector('button[onclick="applyInspectionFilters()"]');
        if (applyBtn) {
            applyBtn.onclick = () => this.applyFilters();
        }
    }

    /**
     * Export inspection report
     */
    exportInspectionReport(inspectionId) {
        const inspection = this.inspectionData.find(i => i.inspection_id === inspectionId);
        if (!inspection) return;

        const relatedDeficiencies = this.deficiencyData.filter(d => d.inspection_id === inspectionId);
        
        // Create CSV content
        let csvContent = "Inspection Report\n";
        csvContent += `Vessel Name,${inspection.vessel_name}\n`;
        csvContent += `Inspection Date,${inspection.inspection_date}\n`;
        csvContent += `Port,${inspection.port_name}, ${inspection.port_country}\n`;
        csvContent += `MOU Region,${inspection.mou_region}\n`;
        csvContent += `Deficiencies,${inspection.deficiency_count}\n`;
        csvContent += `Outcome,${inspection.inspection_outcome}\n\n`;

        if (relatedDeficiencies.length > 0) {
            csvContent += "Deficiencies:\n";
            csvContent += "Category,Description,Action Code,Severity\n";
            relatedDeficiencies.forEach(def => {
                csvContent += `"${def.category}","${def.description}","${def.action_code}","${def.severity}"\n`;
            });
        }

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inspection_report_${inspection.vessel_name}_${inspection.inspection_date}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Update result count display
     */
    updateResultCount() {
        const resultCountElement = document.getElementById('resultCount');
        if (resultCountElement) {
            resultCountElement.textContent = this.filteredData.length;
        }
    }

    /**
     * Utility functions
     */
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    getVesselColor(vesselType) {
        const colors = {
            'PC(T)C': '6366f1',
            'Bulk': 'f43f5e',
            'Container': '10b981',
            'Tanker': '8b5cf6'
        };
        return colors[vesselType] || '64748b';
    }

    getDeficiencyBadgeClass(count) {
        if (count === 0) return 'bg-success';
        if (count <= 2) return 'bg-info';
        if (count <= 5) return 'bg-warning';
        return 'bg-danger';
    }

    getSeverityBadgeClass(severity) {
        const classes = {
            'Critical': 'bg-danger',
            'High': 'bg-warning',
            'Medium': 'bg-info',
            'Low': 'bg-secondary'
        };
        return classes[severity] || 'bg-secondary';
    }
}

// Global instance
let inspectionManager = null;

/**
 * Inspection List Layout Renderer - Updated with new manager
 * FIXED: Properly defined function with error handling
 */
function renderInspectionListLayout() {
    console.log('Rendering inspection list layout with PSC Management...');
    
    try {
        // Initialize inspection manager
        if (!inspectionManager) {
            inspectionManager = new PSCInspectionManager();
            inspectionManager.initialize();
        }

        console.log('Inspection list layout rendered successfully');
    } catch (error) {
        console.error('Error rendering inspection list layout:', error);
    }
}

/**
 * Vessel Management Layout Renderer
 * FIXED: Properly defined function with error handling
 */
function renderVesselManagementLayout() {
    console.log('Rendering vessel management layout...');
    
    try {
        // Initialize vessel list table
        const tableContainer = document.getElementById('vesselTableContainer');
        if (tableContainer) {
            renderVesselTable();
        }

        console.log('Vessel management layout rendered successfully');
    } catch (error) {
        console.error('Error rendering vessel management layout:', error);
    }
}

/**
 * Monthly Inspection Chart
 * FIXED: Proper chart initialization with error handling
 */
function renderMonthlyInspectionChart() {
    const container = document.getElementById('monthlyInspectionChart');
    if (!container || typeof ApexCharts === 'undefined') {
        console.warn('Monthly inspection chart container not found or ApexCharts not loaded');
        return;
    }

    const options = {
        series: [{
            name: 'Inspections',
            data: [5, 12, 0, 1, 1, 0, 1, 1]
        }],
        chart: {
            type: 'bar',
            height: 300,
            toolbar: { show: false }
        },
        colors: [PSCDashboard.config.colors.inspections],
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
                colors: ["#304758"]
            }
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        },
        yaxis: {
            title: { text: 'Number of Inspections' }
        }
    };

    try {
        const chart = new ApexCharts(container, options);
        chart.render();
    } catch (error) {
        console.error('Error rendering monthly inspection chart:', error);
    }
}

/**
 * Top Deficiency Bar Chart
 * FIXED: Proper chart initialization with error handling
 */
function renderTopDeficiencyBar() {
    const container = document.getElementById('topDeficiencyChart');
    if (!container || typeof ApexCharts === 'undefined') {
        console.warn('Top deficiency chart container not found or ApexCharts not loaded');
        return;
    }

    const options = {
        series: [{
            name: 'Occurrences',
            data: [15, 12, 8, 7, 6, 5, 4, 3, 3, 2]
        }],
        chart: {
            type: 'bar',
            height: 400,
            toolbar: { show: true }
        },
        colors: [PSCDashboard.config.colors.deficiencies],
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
                colors: ["#304758"]
            }
        },
        xaxis: {
            categories: ['Fire Safety', 'Navigation', 'Life Saving', 'Radio Comm', 'Safety Nav', 'MARPOL', 'Certificates', 'Manning', 'Load Lines', 'STCW']
        },
        yaxis: {
            title: { text: 'Number of Deficiencies' }
        }
    };

    try {
        const chart = new ApexCharts(container, options);
        chart.render();
    } catch (error) {
        console.error('Error rendering top deficiency chart:', error);
    }
}

/**
 * Inspection Trend Line Chart
 * FIXED: Proper chart initialization with error handling
 */
function renderInspectionTrendLine() {
    const container = document.getElementById('inspectionTrendChart');
    if (!container || typeof ApexCharts === 'undefined') {
        console.warn('Inspection trend chart container not found or ApexCharts not loaded');
        return;
    }

    const options = {
        series: [{
            name: 'Clean Inspections',
            data: [1, 0, 0, 0, 0, 0, 0, 1]
        }, {
            name: 'Deficiencies Found',
            data: [3, 10, 0, 1, 1, 0, 1, 0]
        }, {
            name: 'Detentions',
            data: [1, 2, 0, 0, 0, 0, 0, 0]
        }],
        chart: {
            type: 'line',
            height: 350,
            zoom: { enabled: false },
            toolbar: { show: true }
        },
        colors: [PSCDashboard.config.colors.success, PSCDashboard.config.colors.warning, PSCDashboard.config.colors.detention],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        markers: {
            size: 4
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        },
        yaxis: {
            title: { text: 'Number of Inspections' }
        },
        legend: {
            position: 'top'
        }
    };

    try {
        const chart = new ApexCharts(container, options);
        chart.render();
    } catch (error) {
        console.error('Error rendering inspection trend chart:', error);
    }
}

/**
 * Fleet Composition Donut Chart
 * FIXED: Proper chart initialization with error handling
 */
function renderFleetCompositionDonut() {
    const container = document.getElementById('fleetCompositionChart');
    if (!container || typeof ApexCharts === 'undefined') {
        console.warn('Fleet composition chart container not found or ApexCharts not loaded');
        return;
    }

    const options = {
        series: [7, 7],
        chart: {
            type: 'donut',
            height: 300
        },
        labels: ['PC(T)C', 'Bulk Carrier'],
        colors: [PSCDashboard.config.colors.inspections, PSCDashboard.config.colors.info],
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
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
        legend: {
            position: 'bottom'
        }
    };

    try {
        const chart = new ApexCharts(container, options);
        chart.render();
    } catch (error) {
        console.error('Error rendering fleet composition chart:', error);
    }
}

/**
 * MOU Heat Table
 * FIXED: Proper table rendering with error handling
 */
function renderMouHeatTable() {
    const container = document.getElementById('mouHeatChart');
    if (!container) {
        console.warn('MOU heat chart container not found');
        return;
    }

    // For now, show the fallback table since heatmap data is complex
    const fallbackTable = document.getElementById('heatMapTableFallback');
    if (fallbackTable) {
        fallbackTable.style.display = 'block';
        container.style.display = 'none';
    }
}

/**
 * Initialize Sparklines for KPI Cards
 * FIXED: Proper sparkline initialization with error handling
 */
function initializeSparklines() {
    if (typeof ApexCharts === 'undefined') {
        console.warn('ApexCharts not loaded, skipping sparklines');
        return;
    }

    const sparklineData = {
        'sparkline-vessels': [12, 13, 13, 14, 14, 14, 14],
        'sparkline-inspections': [2, 8, 12, 1, 1, 0, 1],
        'sparkline-deficiencies': [5, 15, 27, 2, 3, 0, 2],
        'sparkline-deficiency-rate': [250, 188, 225, 200, 300, 0, 200],
        'sparkline-detentions': [0, 2, 1, 0, 0, 0, 1],
        'sparkline-detention-rate': [0, 25, 8.3, 0, 0, 0, 100],
        'sparkline-avg-def-vessel': [2.5, 5.4, 6.8, 6.2, 6.2, 6.2, 6.2],
        'sparkline-top-def-code': [1, 3, 8, 1, 1, 0, 1],
        'sparkline-high-risk': [3, 5, 6, 7, 7, 7, 7]
    };

    Object.entries(sparklineData).forEach(([id, data]) => {
        const element = document.getElementById(id);
        if (element) {
            try {
                const options = {
                    series: [{ data: data }],
                    chart: {
                        type: 'line',
                        width: 80,
                        height: 20,
                        sparkline: { enabled: true }
                    },
                    stroke: { curve: 'smooth', width: 2 },
                    colors: [PSCDashboard.config.colors.inspections],
                    tooltip: { enabled: false }
                };
                
                new ApexCharts(element, options).render();
            } catch (error) {
                console.error(`Error rendering sparkline ${id}:`, error);
            }
        }
    });
}

/**
 * Render Inspection Table
 * FIXED: Proper table rendering with actual data
 */
function renderInspectionTable() {
    const container = document.getElementById('inspectionTableContainer');
    if (!container) return;

    // Sample data structure for inspections
    const inspections = PSCDashboard.data.inspections.length > 0 ? 
        PSCDashboard.data.inspections.slice(0, 10) : [
        {
            id: 1,
            date: '2025-08-11',
            vessel: 'SOO SHIN',
            port: 'Busan',
            type: 'PC(T)C',
            deficiencies: 5,
            outcome: 'Deficiencies Found'
        },
        {
            id: 2,
            date: '2025-07-10',
            vessel: 'DAEBO GLADSTONE',
            port: 'Singapore',
            type: 'Bulk',
            deficiencies: 2,
            outcome: 'Deficiencies Found'
        }
    ];

    const tableHtml = `
        <div class="table-responsive">
            <table class="table table-vcenter">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Vessel</th>
                        <th>Port</th>
                        <th>Type</th>
                        <th>Deficiencies</th>
                        <th>Outcome</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${inspections.map(inspection => `
                        <tr>
                            <td>${inspection.inspection_date || inspection.date}</td>
                            <td>${inspection.vessel_name || inspection.vessel}</td>
                            <td>${inspection.port_name || inspection.port}</td>
                            <td>${inspection.vessel_type || inspection.type}</td>
                            <td><span class="badge bg-warning">${inspection.deficiency_count || inspection.deficiencies}</span></td>
                            <td><span class="badge ${getOutcomeBadgeClass(inspection.inspection_outcome || inspection.outcome)}">${inspection.inspection_outcome || inspection.outcome}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary">View</button>
                                <button class="btn btn-sm btn-outline-secondary">Export</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHtml;
}

/**
 * Render Vessel Table
 * FIXED: Proper table rendering with actual data
 */
function renderVesselTable() {
    const container = document.getElementById('vesselTableContainer');
    if (!container) return;

    const vessels = PSCDashboard.data.vessels.length > 0 ? 
        PSCDashboard.data.vessels.slice(0, 10) : [];

    const tableHtml = `
        <div class="table-responsive">
            <table class="table table-vcenter">
                <thead>
                    <tr>
                        <th>Vessel Name</th>
                        <th>Type</th>
                        <th>Flag State</th>
                        <th>Age</th>
                        <th>DWT</th>
                        <th>Risk Profile</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${vessels.map(vessel => `
                        <tr>
                            <td>${vessel.vessel_name}</td>
                            <td>${vessel.vessel_type}</td>
                            <td>${vessel.flag_state}</td>
                            <td>${Math.round(vessel.age_years)} years</td>
                            <td>${vessel.dwt ? vessel.dwt.toLocaleString() : 'N/A'}</td>
                            <td><span class="badge ${getRiskBadgeClass(vessel.risk_profile)}">${vessel.risk_profile}</span></td>
                            <td><span class="badge bg-success">${vessel.operational_status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-primary">View</button>
                                <button class="btn btn-sm btn-outline-secondary">Inspect</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHtml;
}

/**
 * Utility Functions
 * FIXED: Proper helper functions
 */
function getOutcomeBadgeClass(outcome) {
    switch (outcome) {
        case 'Clean':
        case 'No Deficiencies':
            return 'bg-success';
        case 'Deficiencies Found':
            return 'bg-warning';
        case 'Detention':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function getRiskBadgeClass(risk) {
    switch (risk) {
        case 'LOW':
            return 'bg-success';
        case 'MEDIUM':
            return 'bg-warning';
        case 'HIGH':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

/**
 * Navigation Functions
 * FIXED: Proper navigation handling
 */
function handleChartClick(chartType) {
    console.log('Chart clicked:', chartType);
    
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
        default:
            console.log('Unknown chart type:', chartType);
    }
}

function updateRealTimeData() {
    console.log('Updating real-time chart data');
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }
    
    // Simulate data refresh
    setTimeout(() => {
        if (typeof ApexCharts !== 'undefined') {
            renderMonthlyInspectionChart();
            renderFleetCompositionDonut();
            renderTopDeficiencyBar();
            renderInspectionTrendLine();
            renderMouHeatTable();
            initializeSparklines();
        }
        
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }, 1000);
}

function exportChartData(format = 'png') {
    console.log('Exporting chart data as:', format);
    alert('Chart export feature - would export as ' + format.toUpperCase());
}

/**
 * Initialize Dashboard
 * FIXED: Proper initialization with error handling
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('PSC Dashboard initializing...');
    
    try {
        // Load actual data
        await loadActualData();
        
        // Initialize navigation
        if (typeof NavigationComponent !== 'undefined' && window.NavigationComponent) {
            window.navigation = new NavigationComponent();
            if (window.navigation.updateActiveState) {
                window.navigation.updateActiveState();
            }
        }

        // Initialize components based on current page
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('dashboard.html') || currentPage.endsWith('/')) {
            renderDashboardLayout();
        } else if (currentPage.includes('inspections.html')) {
            renderInspectionListLayout();
        } else if (currentPage.includes('vessels.html')) {
            renderVesselManagementLayout();
        }

        // Set up auto-refresh for dashboard
        if (currentPage.includes('dashboard.html') || currentPage.endsWith('/')) {
            setInterval(updateRealTimeData, 300000); // 5 minutes
        }

        console.log('PSC Dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing PSC Dashboard:', error);
    }
});

/**
 * Additional utility functions for inspection management
 */
function applyInspectionFilters() {
    if (inspectionManager) {
        inspectionManager.applyFilters();
    }
}

function sortInspections(sortBy) {
    if (!inspectionManager) return;
    
    const sortFunctions = {
        'date': (a, b) => new Date(b.inspection_date) - new Date(a.inspection_date),
        'vessel': (a, b) => a.vessel_name.localeCompare(b.vessel_name),
        'deficiencies': (a, b) => b.deficiency_count - a.deficiency_count,
        'outcome': (a, b) => a.inspection_outcome.localeCompare(b.inspection_outcome)
    };
    
    const sortFunction = sortFunctions[sortBy];
    if (sortFunction) {
        inspectionManager.filteredData.sort(sortFunction);
        inspectionManager.renderInspectionTable();
    }
}

function showInspectionDetail(inspectionId) {
    if (inspectionManager) {
        inspectionManager.showInspectionDetail(inspectionId);
    }
}

/**
 * MOU Analysis Functions
 */
function analyzeMouPerformance() {
    if (!inspectionManager) return {};
    
    const mouStats = {};
    const inspections = inspectionManager.inspectionData;
    
    // Group by MOU region
    inspections.forEach(inspection => {
        const mou = inspection.mou_region;
        if (!mouStats[mou]) {
            mouStats[mou] = {
                totalInspections: 0,
                totalDeficiencies: 0,
                detentions: 0,
                cleanInspections: 0
            };
        }
        
        mouStats[mou].totalInspections++;
        mouStats[mou].totalDeficiencies += inspection.deficiency_count;
        
        if (inspection.detention) {
            mouStats[mou].detentions++;
        }
        
        if (inspection.inspection_outcome === 'Clean') {
            mouStats[mou].cleanInspections++;
        }
    });
    
    // Calculate rates
    Object.keys(mouStats).forEach(mou => {
        const stats = mouStats[mou];
        stats.detentionRate = (stats.detentions / stats.totalInspections * 100).toFixed(1);
        stats.cleanRate = (stats.cleanInspections / stats.totalInspections * 100).toFixed(1);
        stats.avgDeficienciesPerInspection = (stats.totalDeficiencies / stats.totalInspections).toFixed(1);
    });
    
    return mouStats;
}

function generateMouComparisonChart() {
    const mouStats = analyzeMouPerformance();
    const mouNames = Object.keys(mouStats);
    
    if (mouNames.length === 0 || typeof ApexCharts === 'undefined') return;
    
    const container = document.getElementById('mouComparisonChart');
    if (!container) return;
    
    const options = {
        series: [{
            name: 'Detention Rate (%)',
            data: mouNames.map(mou => parseFloat(mouStats[mou].detentionRate))
        }, {
            name: 'Clean Rate (%)',
            data: mouNames.map(mou => parseFloat(mouStats[mou].cleanRate))
        }, {
            name: 'Avg Deficiencies',
            data: mouNames.map(mou => parseFloat(mouStats[mou].avgDeficienciesPerInspection))
        }],
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: true }
        },
        colors: ['#e11d48', '#10b981', '#f59e0b'],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded'
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: mouNames
        },
        yaxis: {
            title: { text: 'Percentage / Count' }
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: function (val, opts) {
                    if (opts.seriesIndex === 2) {
                        return val + " deficiencies";
                    }
                    return val + "%";
                }
            }
        },
        legend: {
            position: 'top'
        }
    };
    
    try {
        new ApexCharts(container, options).render();
    } catch (error) {
        console.error('Error rendering MOU comparison chart:', error);
    }
}

/**
 * Enhanced export functionality
 */
function exportAllInspections() {
    if (!inspectionManager) return;
    
    const inspections = inspectionManager.filteredData;
    let csvContent = "Inspection Export Report\n";
    csvContent += "Date,Vessel Name,Type,Port,Country,MOU Region,Deficiencies,Outcome,Detention,Inspector\n";
    
    inspections.forEach(inspection => {
        csvContent += `"${inspection.inspection_date}","${inspection.vessel_name}","${inspection.vessel_type}","${inspection.port_name}","${inspection.port_country}","${inspection.mou_region}","${inspection.deficiency_count}","${inspection.inspection_outcome}","${inspection.detention ? 'Yes' : 'No'}","${inspection.inspector}"\n`;
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psc_inspections_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function exportMouAnalysis() {
    const mouStats = analyzeMouPerformance();
    let csvContent = "MOU Performance Analysis Report\n";
    csvContent += "MOU Region,Total Inspections,Total Deficiencies,Detentions,Clean Inspections,Detention Rate (%),Clean Rate (%),Avg Deficiencies per Inspection\n";
    
    Object.keys(mouStats).forEach(mou => {
        const stats = mouStats[mou];
        csvContent += `"${mou}","${stats.totalInspections}","${stats.totalDeficiencies}","${stats.detentions}","${stats.cleanInspections}","${stats.detentionRate}","${stats.cleanRate}","${stats.avgDeficienciesPerInspection}"\n`;
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mou_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

/**
 * Real-time data update for inspection page
 */
function updateInspectionData() {
    if (inspectionManager) {
        console.log('Refreshing inspection data...');
        inspectionManager.initialize();
    }
}

/**
 * Additional Layout Renderers for Pages
 * FIXED: Added missing functions to prevent "not defined" errors
 */

function renderDeficiencyAnalysisLayout() {
    console.log('Rendering deficiency analysis layout...');
    
    try {
        // Initialize deficiency charts and tables if containers exist
        const chartContainer = document.getElementById('deficiencyChart');
        if (chartContainer && typeof ApexCharts !== 'undefined') {
            renderTopDeficiencyBar();
        }
        
        console.log('Deficiency analysis layout rendered successfully');
    } catch (error) {
        console.error('Error rendering deficiency analysis layout:', error);
    }
}

function renderReportsLayout() {
    console.log('Rendering reports layout...');
    
    try {
        // Initialize reports functionality
        console.log('Reports layout rendered successfully');
    } catch (error) {
        console.error('Error rendering reports layout:', error);
    }
}

function renderSettingsLayout() {
    console.log('Rendering settings layout...');
    
    try {
        // Initialize settings functionality
        console.log('Settings layout rendered successfully');
    } catch (error) {
        console.error('Error rendering settings layout:', error);
    }
}

function renderPortsMapLayout() {
    console.log('Rendering ports map layout...');
    
    try {
        // Initialize ports map functionality
        console.log('Ports map layout rendered successfully');
    } catch (error) {
        console.error('Error rendering ports map layout:', error);
    }
}

function renderRiskAnalysisLayout() {
    console.log('Rendering risk analysis layout...');
    
    try {
        // Initialize risk analysis functionality if available
        if (typeof PSCRiskAnalysis !== 'undefined') {
            PSCRiskAnalysis.init();
        }
        
        console.log('Risk analysis layout rendered successfully');
    } catch (error) {
        console.error('Error rendering risk analysis layout:', error);
    }
}

// Export functions globally to prevent "not defined" errors
window.renderDashboardLayout = renderDashboardLayout;
window.renderInspectionListLayout = renderInspectionListLayout;
window.renderVesselManagementLayout = renderVesselManagementLayout;
window.renderDeficiencyAnalysisLayout = renderDeficiencyAnalysisLayout;
window.renderReportsLayout = renderReportsLayout;
window.renderSettingsLayout = renderSettingsLayout;
window.renderPortsMapLayout = renderPortsMapLayout;
window.renderRiskAnalysisLayout = renderRiskAnalysisLayout;
window.handleChartClick = handleChartClick;
window.updateRealTimeData = updateRealTimeData;
window.exportChartData = exportChartData;
window.applyInspectionFilters = applyInspectionFilters;
window.sortInspections = sortInspections;
window.showInspectionDetail = showInspectionDetail;
window.analyzeMouPerformance = analyzeMouPerformance;
window.generateMouComparisonChart = generateMouComparisonChart;
window.exportAllInspections = exportAllInspections;
window.exportMouAnalysis = exportMouAnalysis;
window.updateInspectionData = updateInspectionData;