/**
 * Regional Clustering System - GeoMapper_Ports
 * Advanced clustering algorithm for dense port areas with MOU region analysis
 * Handles regional clustering, performance comparison, and interactive filtering
 */

class RegionalClusteringSystem {
    constructor() {
        this.mouRegions = {
            'USCG': {
                name: 'US Coast Guard',
                region: 'Americas',
                color: '#4F46E5',
                bounds: { north: 71, south: 25, east: -66, west: -179 }
            },
            'Tokyo': {
                name: 'Tokyo MoU',
                region: 'Asia-Pacific',
                color: '#10B981',
                bounds: { north: 60, south: -50, east: 180, west: 90 }
            },
            'Paris': {
                name: 'Paris MoU',
                region: 'Europe',
                color: '#8B5CF6',
                bounds: { north: 85, south: 30, east: 65, west: -25 }
            },
            'Mediterranean': {
                name: 'Mediterranean MoU',
                region: 'Mediterranean',
                color: '#F59E0B',
                bounds: { north: 47, south: 30, east: 42, west: -10 }
            },
            'Riyadh': {
                name: 'Riyadh MoU',
                region: 'Middle East',
                color: '#EF4444',
                bounds: { north: 40, south: 10, east: 75, west: 25 }
            }
        };
        
        this.clusteringConfig = {
            maxZoom: 12,
            pixelRadius: 60,
            minPointsForCluster: 2,
            expansionRadius: 100,
            performanceThresholds: {
                excellent: 0,      // 0% detention rate
                good: 10,         // <= 10% detention rate
                moderate: 25,     // <= 25% detention rate
                poor: 50,         // <= 50% detention rate
                critical: 100     // > 50% detention rate
            }
        };
        
        this.activeFilters = new Set();
        this.clusterData = null;
        
        console.log('🗺️ Regional Clustering System initialized with MOU region support');
    }

    /**
     * Create regional clusters from port data
     * @param {Array} portData - Port inspection data with coordinates
     * @returns {Object} Clustered data by region
     */
    createRegionalClusters(portData) {
        console.log('🎯 Creating regional clusters for', portData.length, 'ports');
        
        // Group ports by MOU region
        const regionGroups = this.groupPortsByMouRegion(portData);
        
        // Calculate regional statistics
        const regionStats = this.calculateRegionalStatistics(regionGroups);
        
        // Create cluster visualization data
        const clusterVisualization = this.createClusterVisualization(regionGroups, regionStats);
        
        this.clusterData = {
            regionGroups,
            regionStats,
            clusterVisualization,
            totalPorts: portData.length,
            generatedAt: new Date().toISOString()
        };
        
        console.log('✅ Regional clusters created:', Object.keys(regionGroups).length, 'regions');
        return this.clusterData;
    }

    /**
     * Group ports by MOU region
     */
    groupPortsByMouRegion(portData) {
        const groups = {};
        
        // Initialize region groups
        Object.keys(this.mouRegions).forEach(region => {
            groups[region] = {
                ports: [],
                regionInfo: this.mouRegions[region]
            };
        });
        
        // Group ports
        portData.forEach(port => {
            const mouRegion = port.mouRegion || 'Unknown';
            if (groups[mouRegion]) {
                groups[mouRegion].ports.push(port);
            } else {
                // Create unknown region group if needed
                if (!groups['Unknown']) {
                    groups['Unknown'] = {
                        ports: [],
                        regionInfo: {
                            name: 'Unknown Region',
                            region: 'Other',
                            color: '#6B7280',
                            bounds: null
                        }
                    };
                }
                groups['Unknown'].ports.push(port);
            }
        });
        
        // Remove empty groups
        Object.keys(groups).forEach(region => {
            if (groups[region].ports.length === 0) {
                delete groups[region];
            }
        });
        
        return groups;
    }

    /**
     * Calculate regional statistics
     */
    calculateRegionalStatistics(regionGroups) {
        const stats = {};
        
        Object.entries(regionGroups).forEach(([region, data]) => {
            const ports = data.ports;
            const totalInspections = ports.reduce((sum, port) => sum + port.inspections, 0);
            const totalDetentions = ports.reduce((sum, port) => sum + port.detentions, 0);
            const totalDeficiencies = ports.reduce((sum, port) => sum + port.deficiencies, 0);
            
            const detentionRate = totalInspections > 0 ? 
                (totalDetentions / totalInspections) * 100 : 0;
            const avgDeficienciesPerInspection = totalInspections > 0 ? 
                totalDeficiencies / totalInspections : 0;
            
            // Calculate performance grade
            const performanceGrade = this.calculatePerformanceGrade(detentionRate);
            
            // Find busiest port in region
            const busiestPort = ports.reduce((max, port) => 
                port.inspections > max.inspections ? port : max, ports[0]);
            
            // Calculate geographic center
            const center = this.calculateGeographicCenter(ports);
            
            stats[region] = {
                regionName: data.regionInfo.name,
                regionColor: data.regionInfo.color,
                portCount: ports.length,
                totalInspections,
                totalDetentions,
                totalDeficiencies,
                detentionRate: Math.round(detentionRate * 100) / 100,
                avgDeficienciesPerInspection: Math.round(avgDeficienciesPerInspection * 100) / 100,
                performanceGrade,
                busiestPort: {
                    name: busiestPort.name,
                    inspections: busiestPort.inspections,
                    detentionRate: busiestPort.detentionRate
                },
                geographicCenter: center,
                riskProfile: this.calculateRegionRiskProfile(ports)
            };
        });
        
        return stats;
    }

    /**
     * Calculate performance grade based on detention rate
     */
    calculatePerformanceGrade(detentionRate) {
        const thresholds = this.clusteringConfig.performanceThresholds;
        
        if (detentionRate <= thresholds.excellent) return { grade: 'A+', label: 'Excellent', color: '#10B981' };
        if (detentionRate <= thresholds.good) return { grade: 'A', label: 'Good', color: '#34D399' };
        if (detentionRate <= thresholds.moderate) return { grade: 'B', label: 'Moderate', color: '#F59E0B' };
        if (detentionRate <= thresholds.poor) return { grade: 'C', label: 'Poor', color: '#F97316' };
        return { grade: 'D', label: 'Critical', color: '#DC2626' };
    }

    /**
     * Calculate geographic center of ports in region
     */
    calculateGeographicCenter(ports) {
        if (ports.length === 0) return { lat: 0, lng: 0 };
        
        const totalLat = ports.reduce((sum, port) => sum + port.y, 0);
        const totalLng = ports.reduce((sum, port) => sum + port.x, 0);
        
        return {
            lat: totalLat / ports.length,
            lng: totalLng / ports.length
        };
    }

    /**
     * Calculate region risk profile
     */
    calculateRegionRiskProfile(ports) {
        const riskCounts = { low: 0, medium: 0, high: 0 };
        
        ports.forEach(port => {
            if (port.detentionRate === 0) riskCounts.low++;
            else if (port.detentionRate <= 25) riskCounts.medium++;
            else riskCounts.high++;
        });
        
        const total = ports.length;
        return {
            lowRisk: Math.round((riskCounts.low / total) * 100),
            mediumRisk: Math.round((riskCounts.medium / total) * 100),
            highRisk: Math.round((riskCounts.high / total) * 100)
        };
    }

    /**
     * Create cluster visualization data
     */
    createClusterVisualization(regionGroups, regionStats) {
        const visualization = {
            clusters: [],
            connections: [],
            heatmapData: []
        };
        
        // Create cluster markers for each region
        Object.entries(regionStats).forEach(([region, stats]) => {
            const cluster = {
                id: region,
                name: stats.regionName,
                center: stats.geographicCenter,
                color: stats.regionColor,
                size: Math.max(20, Math.sqrt(stats.totalInspections) * 3),
                portCount: stats.portCount,
                performance: stats.performanceGrade,
                detentionRate: stats.detentionRate,
                totalInspections: stats.totalInspections,
                onClick: () => this.handleClusterClick(region, regionGroups[region].ports),
                tooltip: this.createClusterTooltip(stats)
            };
            
            visualization.clusters.push(cluster);
        });
        
        // Create heatmap data for performance visualization
        Object.entries(regionStats).forEach(([region, stats]) => {
            visualization.heatmapData.push({
                region: stats.regionName,
                detentionRate: stats.detentionRate,
                inspections: stats.totalInspections,
                performance: stats.performanceGrade.grade,
                color: stats.performanceGrade.color
            });
        });
        
        return visualization;
    }

    /**
     * Create cluster tooltip content
     */
    createClusterTooltip(stats) {
        return `
            <div class="cluster-tooltip p-3" style="min-width: 220px;">
                <div class="d-flex align-items-center mb-2">
                    <div class="me-2">
                        <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${stats.regionColor};"></div>
                    </div>
                    <strong class="text-primary">${stats.regionName}</strong>
                </div>
                <hr class="my-2">
                <div class="row small">
                    <div class="col-6">
                        <div><strong>Ports:</strong> ${stats.portCount}</div>
                        <div><strong>Inspections:</strong> ${stats.totalInspections}</div>
                        <div><strong>Detentions:</strong> ${stats.totalDetentions}</div>
                    </div>
                    <div class="col-6">
                        <div><strong>Detention Rate:</strong> ${stats.detentionRate}%</div>
                        <div><strong>Grade:</strong> <span style="color: ${stats.performanceGrade.color};">${stats.performanceGrade.grade}</span></div>
                        <div><strong>Status:</strong> ${stats.performanceGrade.label}</div>
                    </div>
                </div>
                <hr class="my-2">
                <div class="small">
                    <div><strong>Busiest Port:</strong> ${stats.busiestPort.name}</div>
                    <div class="text-muted">${stats.busiestPort.inspections} inspections, ${stats.busiestPort.detentionRate}% detention rate</div>
                </div>
                <div class="text-muted mt-2" style="font-size: 0.75rem;">
                    Click to expand region details
                </div>
            </div>
        `;
    }

    /**
     * Handle cluster click events
     */
    handleClusterClick(regionId, ports) {
        console.log('🎯 Region cluster clicked:', regionId, 'with', ports.length, 'ports');
        
        // Show regional analysis modal
        this.showRegionalAnalysisModal(regionId, ports);
        
        // Highlight ports in this region on the main map
        this.highlightRegionPorts(regionId, ports);
    }

    /**
     * Show regional analysis modal
     */
    showRegionalAnalysisModal(regionId, ports) {
        const stats = this.clusterData.regionStats[regionId];
        const regionInfo = this.mouRegions[regionId];
        
        // Create detailed port table
        const portTableRows = ports
            .sort((a, b) => b.inspections - a.inspections)
            .map(port => `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="me-2">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${port.color};"></div>
                            </div>
                            <strong>${port.name}</strong>
                        </div>
                    </td>
                    <td><span class="badge bg-primary text-white">${port.inspections}</span></td>
                    <td><span class="badge ${port.detentions > 0 ? 'bg-warning' : 'bg-success'} text-white">${port.detentions}</span></td>
                    <td><strong class="text-${port.detentionRate > 20 ? 'danger' : 'success'}">${port.detentionRate}%</strong></td>
                    <td><span class="text-muted">${port.deficiencies}</span></td>
                </tr>
            `).join('');
        
        const modalHtml = `
            <div class="modal fade" id="regionalAnalysisModal" tabindex="-1" aria-labelledby="regionalAnalysisModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header" style="background-color: ${stats.regionColor}; color: white;">
                            <h5 class="modal-title" id="regionalAnalysisModalLabel">
                                <span class="me-2">🌏</span>
                                ${stats.regionName} Regional Analysis
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Regional KPIs -->
                            <div class="row mb-4">
                                <div class="col-md-3">
                                    <div class="card text-center">
                                        <div class="card-body py-3">
                                            <div class="h3 text-primary">${stats.portCount}</div>
                                            <div class="text-muted">Ports</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="card text-center">
                                        <div class="card-body py-3">
                                            <div class="h3 text-info">${stats.totalInspections}</div>
                                            <div class="text-muted">Inspections</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="card text-center">
                                        <div class="card-body py-3">
                                            <div class="h3 text-warning">${stats.totalDetentions}</div>
                                            <div class="text-muted">Detentions</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="card text-center">
                                        <div class="card-body py-3">
                                            <div class="h3" style="color: ${stats.performanceGrade.color};">${stats.performanceGrade.grade}</div>
                                            <div class="text-muted">Performance</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Risk Profile -->
                            <div class="row mb-4">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="card-title">Risk Distribution</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-4">
                                                    <div class="d-flex align-items-center">
                                                        <div class="me-2">
                                                            <div style="width: 16px; height: 16px; border-radius: 2px; background-color: #10B981;"></div>
                                                        </div>
                                                        <span>Low Risk: <strong>${stats.riskProfile.lowRisk}%</strong></span>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="d-flex align-items-center">
                                                        <div class="me-2">
                                                            <div style="width: 16px; height: 16px; border-radius: 2px; background-color: #F59E0B;"></div>
                                                        </div>
                                                        <span>Medium Risk: <strong>${stats.riskProfile.mediumRisk}%</strong></span>
                                                    </div>
                                                </div>
                                                <div class="col-md-4">
                                                    <div class="d-flex align-items-center">
                                                        <div class="me-2">
                                                            <div style="width: 16px; height: 16px; border-radius: 2px; background-color: #DC2626;"></div>
                                                        </div>
                                                        <span>High Risk: <strong>${stats.riskProfile.highRisk}%</strong></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Port Details Table -->
                            <div class="row">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6 class="card-title">Port Details</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="table-responsive">
                                                <table class="table table-vcenter table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Port</th>
                                                            <th>Inspections</th>
                                                            <th>Detentions</th>
                                                            <th>Detention Rate</th>
                                                            <th>Deficiencies</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${portTableRows}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-primary" onclick="window.regionalClusteringSystem.exportRegionalData('${regionId}')">
                                Export Regional Data
                            </button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal and add new one
        const existingModal = document.getElementById('regionalAnalysisModal');
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = new bootstrap.Modal(document.getElementById('regionalAnalysisModal'));
        modal.show();
    }

    /**
     * Highlight ports in a specific region
     */
    highlightRegionPorts(regionId, ports) {
        // This would interact with the main bubble chart to highlight specific ports
        console.log('🎯 Highlighting', ports.length, 'ports in region:', regionId);
        
        // Emit custom event for other components to listen to
        const event = new CustomEvent('regionHighlight', {
            detail: { regionId, ports }
        });
        window.dispatchEvent(event);
    }

    /**
     * Create MOU region filter controls
     */
    renderMouRegionFilters() {
        if (!this.clusterData) return;
        
        const filtersContainer = document.getElementById('mouRegionFilters');
        if (!filtersContainer) return;
        
        const stats = this.clusterData.regionStats;
        
        const filtersHtml = `
            <div class="card">
                <div class="card-header">
                    <h6 class="card-title">MOU Region Filters</h6>
                    <div class="card-actions">
                        <button class="btn btn-outline-primary btn-sm" onclick="window.regionalClusteringSystem.clearAllFilters()">
                            Clear All
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        ${Object.entries(stats).map(([region, stat]) => `
                            <div class="col-md-4 col-sm-6 mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="${region}" 
                                           id="filter_${region}" onchange="window.regionalClusteringSystem.toggleRegionFilter('${region}')">
                                    <label class="form-check-label d-flex align-items-center" for="filter_${region}">
                                        <div class="me-2">
                                            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${stat.regionColor};"></div>
                                        </div>
                                        <div>
                                            <strong>${stat.regionName}</strong><br>
                                            <small class="text-muted">${stat.portCount} ports, ${stat.performanceGrade.grade} grade</small>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        filtersContainer.innerHTML = filtersHtml;
    }

    /**
     * Toggle region filter
     */
    toggleRegionFilter(regionId) {
        if (this.activeFilters.has(regionId)) {
            this.activeFilters.delete(regionId);
        } else {
            this.activeFilters.add(regionId);
        }
        
        console.log('🎯 Region filter toggled:', regionId, 'Active filters:', [...this.activeFilters]);
        
        // Emit filter change event
        const event = new CustomEvent('regionFilterChange', {
            detail: { activeFilters: [...this.activeFilters] }
        });
        window.dispatchEvent(event);
    }

    /**
     * Clear all region filters
     */
    clearAllFilters() {
        this.activeFilters.clear();
        
        // Uncheck all filter checkboxes
        document.querySelectorAll('[id^="filter_"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Emit filter change event
        const event = new CustomEvent('regionFilterChange', {
            detail: { activeFilters: [] }
        });
        window.dispatchEvent(event);
    }

    /**
     * Export regional data
     */
    exportRegionalData(regionId) {
        if (!this.clusterData || !this.clusterData.regionStats[regionId]) {
            console.warn('No regional data available for export');
            return;
        }
        
        const regionStats = this.clusterData.regionStats[regionId];
        const regionPorts = this.clusterData.regionGroups[regionId].ports;
        
        const exportData = {
            regionInfo: {
                id: regionId,
                name: regionStats.regionName,
                exportDate: new Date().toISOString()
            },
            summary: regionStats,
            ports: regionPorts.map(port => ({
                name: port.name,
                locode: port.locode,
                country: port.name.split(', ')[1] || 'N/A',
                inspections: port.inspections,
                detentions: port.detentions,
                detentionRate: port.detentionRate,
                deficiencies: port.deficiencies,
                coordinates: { lat: port.y, lng: port.x }
            }))
        };
        
        // Create downloadable file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `psc-regional-data-${regionId}-${new Date().getTime()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log('📁 Regional data exported for:', regionStats.regionName);
    }

    /**
     * Get clustering statistics
     */
    getClusteringStats() {
        if (!this.clusterData) return null;
        
        return {
            totalRegions: Object.keys(this.clusterData.regionStats).length,
            totalPorts: this.clusterData.totalPorts,
            activeFilters: [...this.activeFilters],
            generatedAt: this.clusterData.generatedAt,
            regionSummary: Object.entries(this.clusterData.regionStats).map(([region, stats]) => ({
                region: stats.regionName,
                ports: stats.portCount,
                performance: stats.performanceGrade.grade,
                detentionRate: stats.detentionRate
            }))
        };
    }
}

// Export and initialize
window.RegionalClusteringSystem = RegionalClusteringSystem;
window.regionalClusteringSystem = new RegionalClusteringSystem();

console.log('🗺️ Regional Clustering System initialized with MOU region analysis');