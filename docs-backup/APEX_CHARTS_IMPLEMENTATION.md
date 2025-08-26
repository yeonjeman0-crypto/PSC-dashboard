# PSC Dashboard - ApexCharts Implementation

## Overview

This document describes the comprehensive ApexCharts implementation for the PSC (Port State Control) Maritime Dashboard, featuring proper camelCase naming conventions, real-time data integration, and interactive visualizations.

## Architecture

### Core Components

1. **ChartSpecialistApex** (`chart-specialist-apex.js`)
   - Primary ApexCharts visualization specialist
   - Implements all chart types with proper camelCase naming
   - Handles real-time data updates and interactive features

2. **KpiCardsApex** (`kpi-cards-apex.js`)
   - Specialized component for 9 KPI card visualizations
   - Integrates sparklines, gauge charts, and radial bars
   - Provides comprehensive KPI metrics display

3. **DashboardIntegrationApex** (`dashboard-integration-apex.js`)
   - Orchestrates complete dashboard initialization
   - Manages real-time updates and user interactions
   - Provides backward compatibility with existing functions

4. **ApexChartsValidator** (`validation-apex-charts.js`)
   - Comprehensive testing and validation suite
   - Ensures proper chart initialization and data loading
   - Provides debugging and error reporting capabilities

## Implementation Details

### Naming Conventions

All functions use proper camelCase naming as required:

- **Chart Binding Functions**: `bindKpiChart()`, `bindBarChart()`, `bindHeatTable()`
- **Event Handlers**: `handleChartClick()`, `handleDataHover()` 
- **Update Functions**: `updateRealTimeData()`, `updateKpiCards()`
- **Utility Functions**: `createGaugeOptions()`, `createSparklineOptions()`

### KPI Card Charts (9 Charts Implemented)

1. **Total Inspections** - Sparkline trend chart (`sparkline-inspections`)
2. **Deficiency Rate** - Gauge chart showing rate out of 5 (`gauge-deficiency-rate`)
3. **Detention Rate** - Progress/radial bar chart (`progress-detention-rate`)
4. **Clean Rate** - Radial bar chart (`radial-clean-rate`)
5. **Fleet Coverage** - Donut chart showing coverage percentage (`donut-fleet-coverage`)
6. **High Risk Vessels** - Stacked bar chart by vessel type (`bar-high-risk-vessels`)
7. **DOC Companies** - Comparison chart (`comparison-doc-companies`)
8. **MOU Regions** - Distribution pie chart (`pie-mou-regions`)
9. **Monthly Trend** - Line sparkline chart (`sparkline-monthly-trend`)

### Advanced Dashboard Charts

- **Top 10 Deficiency Bar Chart** - Horizontal/vertical bar chart with sorting
- **Monthly Inspection Trend** - Multi-series line chart
- **Fleet Composition Donut** - Vessel type distribution
- **MOU Heat Map** - Color-coded deficiency rates by region and month
- **Port Bubble Map** - Geographic visualization (placeholder implementation)

### Data Integration

The implementation uses actual data from the processed_data folder:

```javascript
// Data sources
- processed_data/analytics/inspection_fact.json (primary)
- processed_data/core_master/vessel_master.json
- processed_data/operational/inspection_records.json
- processed_data/operational/deficiency_records.json
```

**Actual Data Points Used:**
- 14 vessels total
- 30 inspections
- 87 deficiencies  
- 4 detentions (13.3% detention rate)
- 6 clean inspections (20% clean rate)
- 2.9 average deficiencies per inspection

### Real-time Updates

The system implements intelligent real-time updates:

```javascript
// Automatic updates every 5 minutes
setInterval(() => {
    dashboardIntegration.updateRealTimeData();
}, 300000);

// Manual refresh capability
function manualRefresh() {
    dashboardIntegration.updateRealTimeData();
}
```

### Interactive Features

- **Click Handlers**: Drill-down navigation to detailed views
- **Hover Events**: Enhanced tooltips and data highlighting
- **Export Functionality**: PNG/SVG/JSON export capabilities
- **Loading Indicators**: Visual feedback during data updates
- **Error Handling**: Graceful degradation when data unavailable

## PSC Color Palette

Consistent brand colors used throughout:

```javascript
pscColors = {
    primary: '#6366f1',    // Indigo - Inspections
    secondary: '#f43f5e',  // Rose - Deficiencies  
    tertiary: '#8b5cf6',   // Purple - Detentions
    accent: '#f59e0b',     // Amber - Warnings
    success: '#10b981',    // Emerald - Success
    danger: '#ef4444',     // Red - Critical
    info: '#3b82f6'        // Blue - Information
}
```

## Usage

### Basic Initialization

The dashboard initializes automatically when the DOM loads:

```javascript
document.addEventListener('DOMContentLoaded', async function() {
    const dashboardIntegration = new DashboardIntegrationApex();
    await dashboardIntegration.initializeDashboard();
});
```

### Manual Chart Creation

```javascript
// Create KPI chart
chartSpecialist.bindKpiChart('container-id', 'sparklineInspections', data);

// Create bar chart
chartSpecialist.bindBarChart('container-id', 'topDeficiencies', data);

// Create heat table
chartSpecialist.bindHeatTable('container-id', data);
```

### Event Handling

```javascript
// Handle chart clicks
function handleChartClick(chartType, dataIndex) {
    dashboardIntegration.handleChartClick(chartType, dataIndex);
}

// Update data in real-time
function updateRealTimeData() {
    dashboardIntegration.updateRealTimeData();
}

// Export charts
function exportChartData(format) {
    dashboardIntegration.exportChartData(format);
}
```

## Performance Optimization

- **Lazy Loading**: Charts render only when visible
- **Data Caching**: Processed data cached for efficient access
- **Instance Management**: Chart instances tracked for updates
- **Memory Management**: Proper cleanup on destroy

## Error Handling

Comprehensive error handling ensures robust operation:

- Graceful fallback to static data if API unavailable
- Chart container validation before rendering
- ApexCharts dependency checking
- Loading state management
- User-friendly error messages

## Validation and Testing

Run the validation suite to verify implementation:

```javascript
// Check dashboard status
console.log(getDashboardStatus());

// Run validation tests
const validator = new ApexChartsValidator();
const results = await validator.runCompleteValidation();

// Export validation report
validator.exportValidationReport();
```

## Browser Compatibility

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **ApexCharts**: Version 3.44.0+
- **Responsive design**: Mobile and tablet support
- **Progressive enhancement**: Falls back gracefully

## File Structure

```
psc-dashboard/
├── src/
│   ├── assets/js/
│   │   ├── chart-specialist-apex.js      # Core charting engine
│   │   ├── dashboard-integration-apex.js  # Dashboard orchestration
│   │   └── validation-apex-charts.js     # Testing and validation
│   ├── components/
│   │   └── kpi-cards-apex.js             # KPI card components
│   └── pages/
│       └── dashboard.html                # Updated main dashboard
├── processed_data/                       # Actual PSC data
└── APEX_CHARTS_IMPLEMENTATION.md        # This documentation
```

## Debug Commands

Use these commands in the browser console:

```javascript
// Check dashboard status
getDashboardStatus()

// Manual refresh
manualRefresh()

// Get validation report
apexChartsValidationReport

// Check chart instances
window.chartSpecialist.chartInstances.size

// View cached data
Array.from(window.chartSpecialist.dataCache.keys())
```

## Next Steps

1. **Mapping Integration**: Implement full geographic bubble map
2. **Advanced Analytics**: Add predictive analytics features  
3. **Export Enhancement**: Add PDF and Excel export options
4. **Mobile Optimization**: Enhance mobile responsiveness
5. **API Integration**: Connect to live PSC data feeds

## Support

For issues or questions regarding the ApexCharts implementation:

1. Check browser console for error messages
2. Run validation suite to identify problems
3. Verify data file accessibility
4. Ensure ApexCharts library is loaded

The implementation provides comprehensive logging for debugging and monitoring purposes.