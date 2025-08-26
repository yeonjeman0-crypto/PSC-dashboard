/**
 * KPI Cards Component for PSC Dashboard
 * Responsive KPI display cards with metrics and sparklines
 */
class KpiCardComponent {
    constructor() {
        this.cardTemplates = {
            vessels: {
                title: 'Total Vessels',
                value: '14',
                color: 'var(--psc-success)',
                details: ['PC(T)C: 7 vessels', 'Bulk: 7 vessels'],
                sparkline: 'sparkline-vessels'
            },
            inspections: {
                title: 'Total Inspections',
                value: '30',
                color: 'var(--psc-inspections)',
                details: ['Clean: 6 (20%)', 'With Deficiencies: 24'],
                sparkline: 'sparkline-inspections'
            },
            deficiencies: {
                title: 'Total Deficiencies',
                value: '87',
                color: 'var(--psc-deficiencies)',
                details: ['Avg per Inspection: 2.9', 'Critical: 24 deficiencies'],
                sparkline: 'sparkline-deficiencies'
            },
            deficiencyRate: {
                title: 'Deficiency Rate',
                value: '290%',
                color: '#f59e0b',
                details: ['87 def / 30 inspections', 'Above industry avg'],
                sparkline: 'sparkline-deficiency-rate'
            },
            detentions: {
                title: 'Total Detentions',
                value: '4',
                color: 'var(--psc-detention)',
                details: ['YOUNG SHIN, HAE SHIN', 'SEA COEN detained'],
                sparkline: 'sparkline-detentions'
            },
            detentionRate: {
                title: 'Detention Rate',
                value: '13.3%',
                color: 'var(--psc-detention)',
                details: ['4 detentions / 30 inspections', 'High risk fleet'],
                sparkline: 'sparkline-detention-rate'
            },
            avgDefPerVessel: {
                title: 'Avg Def per Vessel',
                value: '6.2',
                color: '#f59e0b',
                details: ['87 def / 14 vessels', 'Needs improvement'],
                sparkline: 'sparkline-avg-def-vessel'
            },
            topDefCode: {
                title: 'Top Def Code',
                value: '15150',
                color: 'var(--psc-deficiencies)',
                details: ['Fire Safety: 15 occurrences', '17% of all deficiencies'],
                sparkline: 'sparkline-top-def-code'
            },
            highRiskShips: {
                title: 'High Risk Ships',
                value: '7',
                color: 'var(--psc-deficiencies)',
                details: ['50% of fleet at risk', 'Detention or 5+ deficiencies'],
                sparkline: 'sparkline-high-risk'
            }
        };
    }

    renderCard(cardType, data = null) {
        const template = this.cardTemplates[cardType];
        if (!template) {
            console.error(`Unknown KPI card type: ${cardType}`);
            return '';
        }

        // Use actual data if provided, otherwise use template defaults
        const cardData = data || template;
        const details = cardData.details.map(detail => `
            <div class="d-flex mb-2">
                <div>${detail}</div>
            </div>
        `).join('');

        return `
            <div class="col-sm-6 col-lg-3">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-center">
                            <div class="subheader">${cardData.title}</div>
                            <div class="ms-auto">
                                <div class="chart-sparkline chart-sparkline-sm" id="${template.sparkline}"></div>
                            </div>
                        </div>
                        <div class="h1 mb-3" style="color: ${cardData.color}">${cardData.value}</div>
                        ${details}
                    </div>
                </div>
            </div>
        `;
    }

    renderDashboardKpis(actualData = null) {
        const row1Cards = ['vessels', 'inspections', 'deficiencies', 'deficiencyRate'];
        const row2Cards = ['detentions', 'detentionRate', 'avgDefPerVessel', 'topDefCode'];
        const row3Cards = ['highRiskShips'];

        const renderRow = (cards, rowClass = 'row row-deck row-cards mb-3') => {
            const cardHtml = cards.map(cardType => this.renderCard(cardType, actualData ? actualData[cardType] : null)).join('');
            return `
                <div class="${rowClass}" id="kpiCardsContainer">
                    ${cardHtml}
                </div>
            `;
        };

        return `
            ${renderRow(row1Cards)}
            ${renderRow(row2Cards)}
            ${renderRow(row3Cards)}
        `;
    }

    updateCardValue(cardType, newValue, newDetails = null) {
        const cardElement = document.querySelector(`#kpiCardsContainer [data-card-type="${cardType}"]`);
        if (cardElement) {
            const valueElement = cardElement.querySelector('.h1');
            if (valueElement) {
                valueElement.textContent = newValue;
            }
            
            if (newDetails) {
                const detailsElements = cardElement.querySelectorAll('.d-flex');
                newDetails.forEach((detail, index) => {
                    if (detailsElements[index]) {
                        detailsElements[index].querySelector('div').textContent = detail;
                    }
                });
            }
        }
    }

    initializeSparklines() {
        // Initialize sparkline charts for KPI cards
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
            if (element && typeof ApexCharts !== 'undefined') {
                const options = {
                    series: [{
                        data: data
                    }],
                    chart: {
                        type: 'line',
                        width: 80,
                        height: 20,
                        sparkline: {
                            enabled: true
                        }
                    },
                    stroke: {
                        curve: 'smooth',
                        width: 2
                    },
                    colors: ['#6366f1'],
                    tooltip: {
                        enabled: false
                    }
                };
                
                new ApexCharts(element, options).render();
            }
        });
    }
}

// Export for use in other modules
window.KpiCardComponent = KpiCardComponent;