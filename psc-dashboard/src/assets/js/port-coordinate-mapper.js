/**
 * Port Coordinate Mapper - GeoMapper_Ports
 * UN/LOCODE-based port location mapping system
 * Maps actual ports from inspection data to WGS84 coordinates
 */

class PortCoordinateMapper {
    constructor() {
        // WGS84 coordinates for actual ports from inspection data
        this.portCoordinates = {
            // Americas - USCG Region
            'USSFO': { lat: 37.7749, lng: -122.4194, port_name: 'San Francisco', country: 'United States' },
            'USBCI': { lat: 38.0336, lng: -122.2711, port_name: 'Benecia', country: 'United States' },
            
            // Asia Pacific - Tokyo MoU Region  
            'CNZOS': { lat: 30.0160, lng: 122.2070, port_name: 'Zhoushan', country: 'China' },
            'CNTXG': { lat: 39.0842, lng: 117.2017, port_name: 'Tianjin', country: 'China' },
            'KRINC': { lat: 37.4563, lng: 126.7052, port_name: 'Incheon', country: 'South Korea' },
            'TWKHH': { lat: 22.6273, lng: 120.3014, port_name: 'Kaohsiung', country: 'Taiwan' },
            'KRMAS': { lat: 35.1977, lng: 128.5764, port_name: 'Masan', country: 'South Korea' },
            
            // Europe - Paris MoU Region
            'SIKOP': { lat: 45.5479, lng: 13.7297, port_name: 'Koper', country: 'Slovenia' },
            
            // Mediterranean/Middle East
            'LYMSQ': { lat: 32.3744, lng: 15.0878, port_name: 'Misurata', country: 'Libya' },
            'SAJED': { lat: 21.4858, lng: 39.1925, port_name: 'Jeddah', country: 'Saudi Arabia' }
        };
        
        // MOU region definitions
        this.mouRegions = {
            'USCG': { name: 'US Coast Guard', color: '#4F46E5' },
            'Tokyo': { name: 'Tokyo MoU', color: '#10B981' },
            'Paris': { name: 'Paris MoU', color: '#8B5CF6' },
            'Mediterranean': { name: 'Mediterranean MoU', color: '#F59E0B' },
            'Riyadh': { name: 'Riyadh MoU', color: '#EF4444' }
        };
    }

    /**
     * Map port locations from UN/LOCODE
     * @param {string} locode - UN/LOCODE (e.g., "USSFO")
     * @returns {Object|null} Coordinate data or null if not found
     */
    mapPortLocation(locode) {
        if (!locode || typeof locode !== 'string') {
            console.warn('Invalid UN/LOCODE provided:', locode);
            return null;
        }

        const coordinates = this.portCoordinates[locode.toUpperCase()];
        if (!coordinates) {
            console.warn(`Coordinates not found for UN/LOCODE: ${locode}`);
            return null;
        }

        return {
            locode: locode.toUpperCase(),
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            port_name: coordinates.port_name,
            country: coordinates.country,
            valid: this.validateCoordinates(coordinates.lat, coordinates.lng)
        };
    }

    /**
     * Validate WGS84 coordinates
     * @param {number} lat - Latitude (-90 to 90)
     * @param {number} lng - Longitude (-180 to 180)
     * @returns {boolean} True if valid WGS84 coordinates
     */
    validateCoordinates(lat, lng) {
        return (
            typeof lat === 'number' && 
            typeof lng === 'number' &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180 &&
            !isNaN(lat) && !isNaN(lng)
        );
    }

    /**
     * Get all available port coordinates
     * @returns {Array} Array of port location objects
     */
    getAllPortLocations() {
        return Object.entries(this.portCoordinates).map(([locode, coords]) => ({
            locode,
            latitude: coords.lat,
            longitude: coords.lng,
            port_name: coords.port_name,
            country: coords.country
        }));
    }

    /**
     * Get MOU region information
     * @param {string} mouRegion - MOU region name
     * @returns {Object|null} MOU region data
     */
    getMouRegionInfo(mouRegion) {
        return this.mouRegions[mouRegion] || null;
    }

    /**
     * Group ports by MOU region
     * @returns {Object} Ports grouped by MOU region
     */
    getPortsByMouRegion() {
        const grouped = {};
        
        // Initialize MOU regions
        Object.keys(this.mouRegions).forEach(region => {
            grouped[region] = [];
        });

        // Group ports (you would get MOU from inspection data)
        // This is a simplified mapping for demo purposes
        const mouMapping = {
            'USSFO': 'USCG', 'USBCI': 'USCG',
            'CNZOS': 'Tokyo', 'CNTXG': 'Tokyo', 'KRINC': 'Tokyo', 'TWKHH': 'Tokyo', 'KRMAS': 'Tokyo',
            'SIKOP': 'Paris',
            'LYMSQ': 'Mediterranean',
            'SAJED': 'Riyadh'
        };

        Object.entries(this.portCoordinates).forEach(([locode, coords]) => {
            const mouRegion = mouMapping[locode] || 'Unknown';
            if (grouped[mouRegion]) {
                grouped[mouRegion].push({
                    locode,
                    ...coords
                });
            }
        });

        return grouped;
    }

    /**
     * Calculate bubble size for inspection count
     * Uses square root scaling for better visual distribution
     * @param {number} inspectionCount - Number of inspections
     * @param {number} maxInspections - Maximum inspections for scaling
     * @returns {number} Bubble radius in pixels
     */
    calculateBubbleSize(inspectionCount, maxInspections = 10) {
        const minRadius = 8;  // Minimum bubble size
        const maxRadius = 35; // Maximum bubble size
        
        if (inspectionCount <= 0) return minRadius;
        
        // Square root scaling for better visual distribution
        const normalizedValue = Math.sqrt(inspectionCount) / Math.sqrt(maxInspections);
        return minRadius + (maxRadius - minRadius) * Math.min(normalizedValue, 1);
    }

    /**
     * Calculate color based on detention rate
     * Continuous color interpolation from green to red
     * @param {number} detentionRate - Detention rate (0-100)
     * @returns {string} CSS color value
     */
    calculateDetentionColor(detentionRate) {
        if (detentionRate <= 0) return '#10B981'; // Green for no detentions
        if (detentionRate >= 100) return '#DC2626'; // Red for 100% detention rate
        
        // Linear interpolation between green and red
        const ratio = detentionRate / 100;
        const red = Math.round(16 + (220 - 16) * ratio);
        const green = Math.round(185 - (185 - 38) * ratio);
        const blue = Math.round(129 - (129 - 38) * ratio);
        
        return `rgb(${red}, ${green}, ${blue})`;
    }

    /**
     * Create bubble chart data point
     * @param {Object} portData - Port inspection data
     * @param {number} maxInspections - Maximum inspections for scaling
     * @returns {Object} Bubble chart data point
     */
    createBubbleDataPoint(portData, maxInspections) {
        const coordinates = this.mapPortLocation(portData.port_locode);
        
        if (!coordinates) {
            console.warn(`Cannot create bubble for port: ${portData.port_name} (${portData.port_locode})`);
            return null;
        }

        const detentionRate = portData.detentions > 0 ? 
            (portData.detentions / portData.inspections) * 100 : 0;

        return {
            x: coordinates.longitude,
            y: coordinates.latitude,
            z: this.calculateBubbleSize(portData.inspections, maxInspections),
            name: `${coordinates.port_name}, ${coordinates.country}`,
            locode: coordinates.locode,
            inspections: portData.inspections,
            detentions: portData.detentions,
            detentionRate: Math.round(detentionRate * 100) / 100,
            mouRegion: portData.mou_region,
            deficiencies: portData.deficiencies || 0,
            color: this.calculateDetentionColor(detentionRate)
        };
    }

    /**
     * Process inspection data for bubble chart
     * @param {Array} inspectionData - Raw inspection data
     * @returns {Array} Processed bubble chart data
     */
    processInspectionDataForBubbleChart(inspectionData) {
        // Group inspections by port
        const portStats = {};
        
        inspectionData.forEach(inspection => {
            const locode = inspection.port_locode;
            if (!portStats[locode]) {
                portStats[locode] = {
                    port_name: inspection.port_name,
                    port_locode: locode,
                    country: inspection.port_country,
                    mou_region: inspection.mou_region,
                    inspections: 0,
                    detentions: 0,
                    deficiencies: 0
                };
            }
            
            portStats[locode].inspections++;
            if (inspection.detention) {
                portStats[locode].detentions++;
            }
            portStats[locode].deficiencies += inspection.deficiency_count || 0;
        });

        // Find max inspections for scaling
        const maxInspections = Math.max(...Object.values(portStats).map(p => p.inspections));
        
        // Create bubble chart data points
        return Object.values(portStats)
            .map(portData => this.createBubbleDataPoint(portData, maxInspections))
            .filter(point => point !== null);
    }

    /**
     * Get port statistics summary
     * @param {Array} bubbleData - Processed bubble chart data
     * @returns {Object} Port statistics
     */
    getPortStatistics(bubbleData) {
        const totalPorts = bubbleData.length;
        const totalInspections = bubbleData.reduce((sum, port) => sum + port.inspections, 0);
        const totalDetentions = bubbleData.reduce((sum, port) => sum + port.detentions, 0);
        const overallDetentionRate = totalInspections > 0 ? (totalDetentions / totalInspections) * 100 : 0;
        
        // Group by MOU regions
        const mouStats = {};
        bubbleData.forEach(port => {
            const mou = port.mouRegion;
            if (!mouStats[mou]) {
                mouStats[mou] = { ports: 0, inspections: 0, detentions: 0 };
            }
            mouStats[mou].ports++;
            mouStats[mou].inspections += port.inspections;
            mouStats[mou].detentions += port.detentions;
        });

        return {
            totalPorts,
            totalInspections,
            totalDetentions,
            overallDetentionRate: Math.round(overallDetentionRate * 100) / 100,
            mouRegionStats: mouStats,
            topPortsByInspections: bubbleData
                .sort((a, b) => b.inspections - a.inspections)
                .slice(0, 5),
            highRiskPorts: bubbleData
                .filter(port => port.detentionRate > 0)
                .sort((a, b) => b.detentionRate - a.detentionRate)
        };
    }
}

// Export for use in other modules
window.PortCoordinateMapper = PortCoordinateMapper;

// Initialize global instance
window.portCoordinateMapper = new PortCoordinateMapper();

console.log('🗺️ PortCoordinateMapper initialized with', Object.keys(window.portCoordinateMapper.portCoordinates).length, 'ports');