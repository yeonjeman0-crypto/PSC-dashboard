/**
 * Interactive Map Controller - GeoMapper_Ports
 * Handles click handlers, hover effects, drill-down navigation, and tooltip rendering
 * Integrates coordinate mapping, bubble charts, and regional clustering
 */

class InteractiveMapController {
    constructor() {
        this.portMapper = window.portCoordinateMapper;
        this.geoVisualizer = window.geoVisualizerPorts;
        this.clusteringSystem = window.regionalClusteringSystem;
        
        this.eventHandlers = new Map();
        this.currentSelection = null;
        this.interactionMode = 'default'; // 'default', 'selection', 'comparison'
        this.selectedPorts = new Set();
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Configuration
        this.config = {
            hoverDelay: 150,
            tooltipFadeSpeed: 200,
            zoomLevels: {
                world: 2,
                region: 6,
                port: 12
            },
            animation: {
                duration: 750,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }
        };
        
        console.log('🎯 Interactive Map Controller initialized with full event handling');
    }

    /**
     * Initialize global event listeners
     */
    initializeEventListeners() {
        // Listen for regional clustering events
        window.addEventListener('regionHighlight', this.handleRegionHighlight.bind(this));
        window.addEventListener('regionFilterChange', this.handleRegionFilterChange.bind(this));
        
        // Listen for keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Listen for window resize for responsive adjustments
        window.addEventListener('resize', this.debounce(this.handleWindowResize.bind(this), 250));
        
        console.log('📡 Event listeners initialized');
    }

    /**
     * Handle map click events with detailed drill-down
     * @param {Object} config - Chart click configuration
     * @param {Array} bubbleData - Full bubble chart data
     */
    handleMapClick(config, bubbleData) {
        if (!config || !bubbleData || config.dataPointIndex === undefined) {
            this.clearSelection();
            return;
        }
        
        const clickedPort = bubbleData[config.dataPointIndex];
        if (!clickedPort) return;
        
        console.log('🎯 Port clicked for drill-down:', clickedPort.name);
        
        // Update current selection
        this.currentSelection = clickedPort;
        
        // Handle different interaction modes
        switch (this.interactionMode) {
            case 'selection':
                this.togglePortSelection(clickedPort);
                break;
            case 'comparison':
                this.addPortToComparison(clickedPort);
                break;
            default:
                this.showPortDrillDown(clickedPort);
                break;
        }
        
        // Visual feedback
        this.highlightSelectedPort(clickedPort);
        
        // Emit custom event for other components
        const event = new CustomEvent('portSelected', {
            detail: { port: clickedPort, mode: this.interactionMode }
        });
        window.dispatchEvent(event);
    }

    /**
     * Show detailed port drill-down with navigation options
     */
    showPortDrillDown(port) {
        const drillDownHtml = `
            <div class="modal fade" id="portDrillDownModal" tabindex="-1" aria-labelledby="portDrillDownLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-gradient-primary text-white">
                            <h5 class="modal-title" id="portDrillDownLabel">
                                <span class="me-2">🏗️</span>
                                ${port.name} - Detailed Analysis
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${this.createPortDrillDownContent(port)}
                        </div>
                        <div class="modal-footer">
                            <div class="btn-group me-auto" role="group">
                                <button type="button" class="btn btn-outline-info" onclick="window.interactiveMapController.navigateToInspections('${port.locode}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <rect x="4" y="4" width="16" height="4" rx="1"/>
                                        <rect x="4" y="12" width="6" height="8" rx="1"/>
                                        <rect x="14" y="12" width="6" height="8" rx="1"/>
                                    </svg>
                                    View Inspections
                                </button>
                                <button type="button" class="btn btn-outline-warning" onclick="window.interactiveMapController.navigateToVessels('${port.locode}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1"/>
                                        <path d="M4 18l-1 -3h18l-1 3"/>
                                        <path d="M11 12h7l-7 -9v9"/>
                                        <line x1="8" y1="7" x2="6" y2="12"/>
                                    </svg>
                                    View Vessels
                                </button>
                                <button type="button" class="btn btn-outline-danger" onclick="window.interactiveMapController.navigateToRiskAnalysis('${port.locode}')">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M12 9v2m0 4v.01"/>
                                        <path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.48 0l-7.1 12.25a2 2 0 0 0 1.84 2.75"/>
                                    </svg>
                                    Risk Analysis
                                </button>
                            </div>
                            <button type="button" class="btn btn-secondary" onclick="window.interactiveMapController.addToComparison('${port.locode}')">Add to Compare</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal and show new one
        const existingModal = document.getElementById('portDrillDownModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', drillDownHtml);
        const modal = new bootstrap.Modal(document.getElementById('portDrillDownModal'));
        modal.show();
    }

    /**
     * Create detailed port drill-down content
     */
    createPortDrillDownContent(port) {
        const riskLevel = this.geoVisualizer.calculateRiskLevel(port.detentionRate);
        const riskColor = this.geoVisualizer.getRiskColor(riskLevel);
        
        // Calculate additional metrics
        const avgDeficienciesPerInspection = port.inspections > 0 ? 
            Math.round((port.deficiencies / port.inspections) * 100) / 100 : 0;
        
        const inspectionFrequency = this.calculateInspectionFrequency(port);
        const complianceScore = this.calculateComplianceScore(port);
        
        return `
            <!-- Overview Cards -->
            <div class="row mb-4">
                <div class="col-md-2 col-sm-4">
                    <div class="card text-center bg-primary text-white">
                        <div class="card-body py-3">
                            <div class="h3">${port.inspections}</div>
                            <div class="text-light small">Inspections</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-2 col-sm-4">
                    <div class="card text-center bg-${port.detentions > 0 ? 'warning' : 'success'} text-white">
                        <div class="card-body py-3">
                            <div class="h3">${port.detentions}</div>
                            <div class="text-light small">Detentions</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-2 col-sm-4">
                    <div class="card text-center bg-info text-white">
                        <div class="card-body py-3">
                            <div class="h3">${port.deficiencies}</div>
                            <div class="text-light small">Deficiencies</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-2 col-sm-4">
                    <div class="card text-center" style="background-color: ${riskColor}; color: white;">
                        <div class="card-body py-3">
                            <div class="h3">${port.detentionRate}%</div>
                            <div class="small">Detention Rate</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-2 col-sm-4">
                    <div class="card text-center bg-secondary text-white">
                        <div class="card-body py-3">
                            <div class="h3">${avgDeficienciesPerInspection}</div>
                            <div class="text-light small">Avg Deficiencies</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-2 col-sm-4">
                    <div class="card text-center bg-dark text-white">
                        <div class="card-body py-3">
                            <div class="h3">${complianceScore}</div>
                            <div class="text-light small">Compliance</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Detailed Information -->
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title">Port Information</h6>
                        </div>
                        <div class="card-body">
                            <table class="table table-borderless">
                                <tr><td><strong>Port Name:</strong></td><td>${port.name}</td></tr>
                                <tr><td><strong>UN/LOCODE:</strong></td><td><code>${port.locode}</code></td></tr>
                                <tr><td><strong>MOU Region:</strong></td><td><span class="badge badge-outline text-blue">${port.mouRegion}</span></td></tr>
                                <tr><td><strong>Coordinates:</strong></td><td>${port.y.toFixed(4)}°, ${port.x.toFixed(4)}°</td></tr>
                                <tr><td><strong>Risk Classification:</strong></td><td><span style="color: ${riskColor}; font-weight: bold;">${riskLevel}</span></td></tr>
                                <tr><td><strong>Inspection Frequency:</strong></td><td>${inspectionFrequency}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title">Performance Analysis</h6>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label">Detention Rate</label>
                                <div class="progress">
                                    <div class="progress-bar" style="width: ${port.detentionRate}%; background-color: ${riskColor};" role="progressbar"></div>
                                </div>
                                <small class="text-muted">${port.detentionRate}% detention rate</small>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Compliance Score</label>
                                <div class="progress">
                                    <div class="progress-bar bg-${complianceScore >= 80 ? 'success' : complianceScore >= 60 ? 'warning' : 'danger'}" style="width: ${complianceScore}%" role="progressbar"></div>
                                </div>
                                <small class="text-muted">${complianceScore}/100 compliance score</small>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Inspection Activity</label>
                                <div class="progress">
                                    <div class="progress-bar bg-info" style="width: ${Math.min((port.inspections / 10) * 100, 100)}%" role="progressbar"></div>
                                </div>
                                <small class="text-muted">${port.inspections} total inspections</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Performance Comparison -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title">Regional Comparison</h6>
                        </div>
                        <div class="card-body">
                            ${this.createRegionalComparisonChart(port)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Calculate inspection frequency description
     */
    calculateInspectionFrequency(port) {
        if (port.inspections >= 5) return 'High Activity';
        if (port.inspections >= 3) return 'Moderate Activity';
        if (port.inspections >= 1) return 'Low Activity';
        return 'Inactive';
    }

    /**
     * Calculate compliance score (0-100)
     */
    calculateComplianceScore(port) {
        if (port.inspections === 0) return 0;
        
        const detentionPenalty = port.detentionRate * 0.8;
        const deficiencyPenalty = Math.min((port.deficiencies / port.inspections) * 10, 20);
        const baseScore = 100;
        
        return Math.max(0, Math.round(baseScore - detentionPenalty - deficiencyPenalty));
    }

    /**
     * Create regional comparison chart content
     */
    createRegionalComparisonChart(port) {
        const clusterStats = this.clusteringSystem.getClusteringStats();
        if (!clusterStats) return '<div class="text-muted">Regional data not available</div>';
        
        const regionData = clusterStats.regionSummary.find(r => 
            r.region.includes(port.mouRegion) || port.mouRegion.includes(r.region)
        );
        
        if (!regionData) return '<div class="text-muted">Regional comparison not available</div>';
        
        const portVsRegion = [
            { metric: 'Detention Rate', port: port.detentionRate, region: regionData.detentionRate },
            { metric: 'Performance Grade', port: this.gradeToNumber(this.geoVisualizer.calculateRiskLevel(port.detentionRate)), region: this.gradeToNumber(regionData.performance) }
        ];
        
        return `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>This Port</th>
                            <th>Regional Average</th>
                            <th>Comparison</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${portVsRegion.map(item => `
                            <tr>
                                <td><strong>${item.metric}</strong></td>
                                <td>${item.port}${item.metric === 'Detention Rate' ? '%' : ''}</td>
                                <td>${item.region}${item.metric === 'Detention Rate' ? '%' : ''}</td>
                                <td>
                                    <span class="badge bg-${item.port <= item.region ? 'success' : 'warning'}">
                                        ${item.port <= item.region ? 'Better' : 'Needs Improvement'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Convert grade to number for comparison
     */
    gradeToNumber(grade) {
        const gradeMap = { 'Low': 90, 'Medium-Low': 75, 'Medium': 60, 'High': 40, 'Very High': 20 };
        return gradeMap[grade] || 50;
    }

    /**
     * Navigation functions for drill-down
     */
    navigateToInspections(portLocode) {
        window.location.href = `./inspections.html?port=${portLocode}&highlight=true`;
    }

    navigateToVessels(portLocode) {
        window.location.href = `./vessels.html?port=${portLocode}&highlight=true`;
    }

    navigateToRiskAnalysis(portLocode) {
        window.location.href = `./risk.html?port=${portLocode}&analysis=detailed`;
    }

    /**
     * Handle hover effects with smooth transitions
     */
    handleMapHover(event, config, bubbleData) {
        if (!config || !bubbleData) return;
        
        const hoveredPort = bubbleData[config.dataPointIndex];
        if (!hoveredPort) return;
        
        // Add hover class for CSS transitions
        if (event.target) {
            event.target.classList.add('port-hovered');
            event.target.style.transform = 'scale(1.1)';
            event.target.style.transition = `transform ${this.config.animation.duration}ms ${this.config.animation.easing}`;
        }
        
        // Show enhanced tooltip after delay
        setTimeout(() => {
            if (event.target && event.target.classList.contains('port-hovered')) {
                this.showEnhancedTooltip(event, hoveredPort);
            }
        }, this.config.hoverDelay);
    }

    /**
     * Handle mouse leave events
     */
    handleMapMouseLeave(event) {
        if (event.target) {
            event.target.classList.remove('port-hovered');
            event.target.style.transform = '';
        }
        
        this.hideEnhancedTooltip();
    }

    /**
     * Show enhanced tooltip with more details
     */
    showEnhancedTooltip(event, port) {
        // Implementation would show a more detailed tooltip than the default one
        console.log('📍 Enhanced tooltip for:', port.name);
    }

    /**
     * Hide enhanced tooltip
     */
    hideEnhancedTooltip() {
        // Implementation would hide the enhanced tooltip
        console.log('📍 Hiding enhanced tooltip');
    }

    /**
     * Handle region highlight events
     */
    handleRegionHighlight(event) {
        const { regionId, ports } = event.detail;
        console.log('🎯 Highlighting region:', regionId, 'with', ports.length, 'ports');
        
        // Zoom to region bounds
        this.zoomToRegion(ports);
        
        // Highlight ports visually
        this.highlightPorts(ports);
    }

    /**
     * Handle region filter changes
     */
    handleRegionFilterChange(event) {
        const { activeFilters } = event.detail;
        console.log('🎯 Region filters changed:', activeFilters);
        
        // Filter bubble chart data based on active filters
        if (this.geoVisualizer.currentMapData) {
            this.filterMapData(activeFilters);
        }
    }

    /**
     * Filter map data based on active region filters
     */
    filterMapData(activeFilters) {
        if (!this.geoVisualizer.currentBubbleChart) return;
        
        // If no filters active, show all data
        if (activeFilters.length === 0) {
            this.geoVisualizer.currentBubbleChart.updateOptions({
                series: [{
                    data: this.geoVisualizer.currentMapData
                }]
            });
            return;
        }
        
        // Filter data based on active regions
        const filteredData = this.geoVisualizer.currentMapData.filter(port => 
            activeFilters.includes(port.mouRegion)
        );
        
        this.geoVisualizer.currentBubbleChart.updateOptions({
            series: [{
                data: filteredData
            }]
        });
        
        console.log('📊 Map data filtered:', filteredData.length, 'ports shown');
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + Click for multi-selection
        if (event.ctrlKey || event.metaKey) {
            this.interactionMode = 'selection';
        } else if (event.altKey) {
            this.interactionMode = 'comparison';
        } else {
            this.interactionMode = 'default';
        }
        
        // ESC to clear selection
        if (event.key === 'Escape') {
            this.clearSelection();
        }
        
        // Other shortcuts
        switch (event.key) {
            case 'z':
                if (event.ctrlKey) this.zoomToFit();
                break;
            case 'r':
                if (event.ctrlKey) this.resetMapView();
                break;
            case 'e':
                if (event.ctrlKey) this.exportCurrentView();
                break;
        }
    }

    /**
     * Handle window resize for responsive adjustments
     */
    handleWindowResize() {
        if (this.geoVisualizer.currentBubbleChart) {
            this.geoVisualizer.currentBubbleChart.resize();
        }
        console.log('📱 Map resized for responsive layout');
    }

    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Clear current selection
     */
    clearSelection() {
        this.currentSelection = null;
        this.selectedPorts.clear();
        this.interactionMode = 'default';
        
        // Visual feedback
        document.querySelectorAll('.port-selected').forEach(el => {
            el.classList.remove('port-selected');
        });
        
        console.log('🎯 Selection cleared');
    }

    /**
     * Highlight selected port visually
     */
    highlightSelectedPort(port) {
        // Implementation would add visual highlighting
        console.log('🎯 Port highlighted:', port.name);
    }

    /**
     * Get interaction statistics
     */
    getInteractionStats() {
        return {
            currentSelection: this.currentSelection?.name || null,
            selectedPorts: this.selectedPorts.size,
            interactionMode: this.interactionMode,
            eventsRegistered: this.eventHandlers.size,
            lastInteraction: new Date().toISOString()
        };
    }
}

// Export and initialize
window.InteractiveMapController = InteractiveMapController;
window.interactiveMapController = new InteractiveMapController();

console.log('🎯 Interactive Map Controller ready for advanced user interactions');