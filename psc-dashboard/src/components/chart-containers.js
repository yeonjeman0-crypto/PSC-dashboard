/**
 * Chart Container Component for PSC Dashboard
 * Responsive chart containers for data visualization
 */
class ChartContainerComponent {
    constructor() {
        this.charts = new Map();
        this.defaultOptions = {
            chart: {
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: false,
                        zoom: false,
                        zoomin: false,
                        zoomout: false,
                        pan: false,
                        reset: false
                    }
                },
                animations: {
                    enabled: true,
                    speed: 800
                }
            },
            theme: {
                mode: 'light'
            },
            colors: ['#6366f1', '#f43f5e', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#84cc16']
        };
    }

    renderChartContainer(id, title, height = '400px', actions = null) {
        const actionsHtml = actions ? `
            <div class="card-actions">
                ${actions}
            </div>
        ` : '';

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${title}</h3>
                    ${actionsHtml}
                </div>
                <div class="card-body">
                    <div id="${id}" style="height: ${height};"></div>
                </div>
            </div>
        `;
    }

    createBarChart(containerId, data, options = {}) {
        const chartOptions = {
            ...this.defaultOptions,
            series: [{
                name: 'Count',
                data: data.values
            }],
            chart: {
                ...this.defaultOptions.chart,
                type: 'bar',
                height: options.height || 400
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    horizontal: options.horizontal || false,
                    dataLabels: {
                        position: 'top'
                    }
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
                categories: data.categories,
                position: 'bottom',
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                crosshairs: {
                    fill: {
                        type: "gradient",
                        gradient: {
                            colorFrom: "#D8E3F0",
                            colorTo: "#BED1E6",
                            stops: [0, 100],
                            opacityFrom: 0.4,
                            opacityTo: 0.5,
                        }
                    }
                }
            },
            yaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false,
                }
            },
            ...options
        };

        this.renderChart(containerId, chartOptions);
    }

    createLineChart(containerId, data, options = {}) {
        const chartOptions = {
            ...this.defaultOptions,
            series: data.series,
            chart: {
                ...this.defaultOptions.chart,
                type: 'line',
                height: options.height || 350,
                zoom: {
                    enabled: false
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            grid: {
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5
                },
            },
            xaxis: {
                categories: data.categories
            },
            ...options
        };

        this.renderChart(containerId, chartOptions);
    }

    createDonutChart(containerId, data, options = {}) {
        const chartOptions = {
            ...this.defaultOptions,
            series: data.values,
            chart: {
                ...this.defaultOptions.chart,
                type: 'donut',
                height: options.height || 300
            },
            labels: data.labels,
            plotOptions: {
                pie: {
                    startAngle: -90,
                    endAngle: 270,
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            total: {
                                showAlways: true,
                                show: true
                            }
                        }
                    }
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
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }],
            ...options
        };

        this.renderChart(containerId, chartOptions);
    }

    createHeatmapChart(containerId, data, options = {}) {
        const chartOptions = {
            ...this.defaultOptions,
            series: data.series,
            chart: {
                ...this.defaultOptions.chart,
                type: 'heatmap',
                height: options.height || 300
            },
            dataLabels: {
                enabled: true
            },
            colors: ["#6366f1"],
            xaxis: {
                categories: data.categories
            },
            plotOptions: {
                heatmap: {
                    shadeIntensity: 0.5,
                    radius: 0,
                    useFillColorAsStroke: true,
                    colorScale: {
                        ranges: [{
                            from: 0,
                            to: 0,
                            color: '#ffffff'
                        }, {
                            from: 1,
                            to: 3,
                            color: '#10b981'
                        }, {
                            from: 4,
                            to: 7,
                            color: '#f59e0b'
                        }, {
                            from: 8,
                            to: 15,
                            color: '#f43f5e'
                        }]
                    }
                }
            },
            ...options
        };

        this.renderChart(containerId, chartOptions);
    }

    createAreaChart(containerId, data, options = {}) {
        const chartOptions = {
            ...this.defaultOptions,
            series: data.series,
            chart: {
                ...this.defaultOptions.chart,
                type: 'area',
                height: options.height || 350,
                stacked: options.stacked || false
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    opacityFrom: 0.6,
                    opacityTo: 0.1,
                    stops: [0, 100]
                }
            },
            xaxis: {
                categories: data.categories
            },
            ...options
        };

        this.renderChart(containerId, chartOptions);
    }

    renderChart(containerId, options) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Chart container not found: ${containerId}`);
            return;
        }

        if (typeof ApexCharts === 'undefined') {
            console.error('ApexCharts library not loaded');
            container.innerHTML = '<div class="text-center text-muted p-4">Chart library not available</div>';
            return;
        }

        // Destroy existing chart if it exists
        if (this.charts.has(containerId)) {
            this.charts.get(containerId).destroy();
        }

        try {
            const chart = new ApexCharts(container, options);
            this.charts.set(containerId, chart);
            chart.render();
        } catch (error) {
            console.error(`Error rendering chart ${containerId}:`, error);
            container.innerHTML = '<div class="text-center text-muted p-4">Error loading chart</div>';
        }
    }

    updateChart(containerId, series, categories = null) {
        const chart = this.charts.get(containerId);
        if (chart) {
            if (categories) {
                chart.updateOptions({
                    xaxis: { categories }
                });
            }
            chart.updateSeries(series);
        }
    }

    destroyChart(containerId) {
        const chart = this.charts.get(containerId);
        if (chart) {
            chart.destroy();
            this.charts.delete(containerId);
        }
    }

    destroyAllCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    exportChart(containerId, format = 'png', filename = 'chart') {
        const chart = this.charts.get(containerId);
        if (chart) {
            chart.dataURI().then(uri => {
                const link = document.createElement('a');
                link.href = uri.imgURI;
                link.download = `${filename}.${format}`;
                link.click();
            }).catch(error => {
                console.error('Error exporting chart:', error);
            });
        }
    }

    resizeCharts() {
        // Resize all charts when window resizes
        this.charts.forEach(chart => {
            chart.resize();
        });
    }
}

// Initialize chart container component and add window resize handler
document.addEventListener('DOMContentLoaded', function() {
    window.chartContainer = new ChartContainerComponent();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.chartContainer) {
            window.chartContainer.resizeCharts();
        }
    });
});

// Export for use in other modules
window.ChartContainerComponent = ChartContainerComponent;