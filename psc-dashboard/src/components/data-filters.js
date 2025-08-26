/**
 * Data Filter Component for PSC Dashboard
 * Advanced filtering interface for data tables and lists
 */
class FilterComponent {
    constructor() {
        this.activeFilters = {};
        this.filterOptions = {
            vesselType: ['PC(T)C', 'Bulk'],
            flagState: ['Panama', 'Korea', 'Marshall Islands', 'China', 'Slovenia', 'Libya', 'United States', 'Greece', 'Netherlands'],
            riskProfile: ['HIGH', 'MEDIUM', 'LOW'],
            mouRegion: ['Tokyo MoU', 'Paris MoU', 'USCG', 'Non-MOU'],
            inspectionType: ['Initial', 'Follow-up', 'Expanded'],
            complianceStatus: ['Compliant', 'Non-Compliant', 'Detained'],
            deficiencyCategory: ['Fire Safety', 'Navigation Equipment', 'Life Saving Appliances', 'Radio Communications', 'Safety of Navigation'],
            severity: ['Critical', 'High', 'Medium', 'Low']
        };
    }

    renderFilterPanel(filterTypes = ['vesselType', 'flagState', 'riskProfile']) {
        const filterGroups = filterTypes.map(filterType => {
            const options = this.filterOptions[filterType] || [];
            const optionElements = options.map(option => `
                <label class="form-check">
                    <input class="form-check-input" type="checkbox" value="${option}" 
                           data-filter-type="${filterType}" onchange="window.filterComponent.updateFilter('${filterType}', '${option}', this.checked)">
                    <span class="form-check-label">${option}</span>
                </label>
            `).join('');

            return `
                <div class="mb-3">
                    <label class="form-label">${this.formatFilterLabel(filterType)}</label>
                    <div class="form-selectgroup form-selectgroup-boxes d-flex flex-column">
                        ${optionElements}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Filters</h3>
                    <div class="card-actions">
                        <button class="btn btn-sm btn-outline-secondary" onclick="window.filterComponent.clearAllFilters()">
                            Clear All
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    ${filterGroups}
                    <div class="mt-3">
                        <button class="btn btn-primary w-100" onclick="window.filterComponent.applyFilters()">
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuickFilters(filterTypes = ['vesselType', 'riskProfile']) {
        const quickFilterButtons = filterTypes.map(filterType => {
            const options = this.filterOptions[filterType] || [];
            const buttons = options.map(option => `
                <button class="btn btn-sm btn-outline-primary me-2 mb-2" 
                        data-filter-type="${filterType}" 
                        data-filter-value="${option}"
                        onclick="window.filterComponent.toggleQuickFilter('${filterType}', '${option}', this)">
                    ${option}
                </button>
            `).join('');
            
            return `
                <div class="mb-3">
                    <h6>${this.formatFilterLabel(filterType)}</h6>
                    <div class="btn-list">
                        ${buttons}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Quick Filters</h3>
                </div>
                <div class="card-body">
                    ${quickFilterButtons}
                </div>
            </div>
        `;
    }

    renderDateRangeFilter() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Date Range</h3>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label">From Date</label>
                            <input type="date" class="form-control" id="dateFrom" value="2025-01-01" 
                                   onchange="window.filterComponent.updateDateRange()">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">To Date</label>
                            <input type="date" class="form-control" id="dateTo" value="2025-12-31"
                                   onchange="window.filterComponent.updateDateRange()">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSearchFilter(placeholder = "Search vessels, inspections, deficiencies...") {
        return `
            <div class="card">
                <div class="card-body">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="${placeholder}" 
                               id="searchInput" onkeyup="window.filterComponent.handleSearch(this.value)">
                        <button class="btn btn-primary" type="button" onclick="window.filterComponent.executeSearch()">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0"/>
                                <path d="m21 21l-6 -6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    formatFilterLabel(filterType) {
        const labels = {
            vesselType: 'Vessel Type',
            flagState: 'Flag State',
            riskProfile: 'Risk Profile',
            mouRegion: 'MOU Region',
            inspectionType: 'Inspection Type',
            complianceStatus: 'Compliance Status',
            deficiencyCategory: 'Deficiency Category',
            severity: 'Severity'
        };
        return labels[filterType] || filterType;
    }

    updateFilter(filterType, value, isChecked) {
        if (!this.activeFilters[filterType]) {
            this.activeFilters[filterType] = [];
        }

        if (isChecked) {
            if (!this.activeFilters[filterType].includes(value)) {
                this.activeFilters[filterType].push(value);
            }
        } else {
            this.activeFilters[filterType] = this.activeFilters[filterType].filter(v => v !== value);
            if (this.activeFilters[filterType].length === 0) {
                delete this.activeFilters[filterType];
            }
        }

        this.updateFilterBadges();
    }

    toggleQuickFilter(filterType, value, buttonElement) {
        const isActive = buttonElement.classList.contains('active');
        
        if (isActive) {
            buttonElement.classList.remove('active', 'btn-primary');
            buttonElement.classList.add('btn-outline-primary');
            this.updateFilter(filterType, value, false);
        } else {
            buttonElement.classList.add('active', 'btn-primary');
            buttonElement.classList.remove('btn-outline-primary');
            this.updateFilter(filterType, value, true);
        }

        this.applyFilters();
    }

    updateDateRange() {
        const dateFrom = document.getElementById('dateFrom')?.value;
        const dateTo = document.getElementById('dateTo')?.value;
        
        if (dateFrom && dateTo) {
            this.activeFilters.dateRange = { from: dateFrom, to: dateTo };
            this.applyFilters();
        }
    }

    handleSearch(searchTerm) {
        this.searchTerm = searchTerm;
        // Debounce search to avoid too many calls
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.executeSearch();
        }, 300);
    }

    executeSearch() {
        if (this.searchTerm) {
            this.activeFilters.search = this.searchTerm;
        } else {
            delete this.activeFilters.search;
        }
        this.applyFilters();
    }

    applyFilters() {
        // Emit custom event with filter data
        const filterEvent = new CustomEvent('filtersApplied', {
            detail: {
                filters: { ...this.activeFilters },
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(filterEvent);

        // Update URL with filter parameters
        this.updateUrlParams();
    }

    clearAllFilters() {
        this.activeFilters = {};
        this.searchTerm = '';
        
        // Clear all checkboxes
        document.querySelectorAll('input[data-filter-type]').forEach(input => {
            input.checked = false;
        });
        
        // Clear quick filter buttons
        document.querySelectorAll('button[data-filter-type]').forEach(button => {
            button.classList.remove('active', 'btn-primary');
            button.classList.add('btn-outline-primary');
        });
        
        // Clear search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        this.updateFilterBadges();
        this.applyFilters();
    }

    updateFilterBadges() {
        const badgeContainer = document.getElementById('filterBadges');
        if (!badgeContainer) return;

        const badges = Object.entries(this.activeFilters).map(([filterType, values]) => {
            if (filterType === 'search') {
                return `<span class="badge bg-secondary me-1">Search: ${values}</span>`;
            } else if (filterType === 'dateRange') {
                return `<span class="badge bg-info me-1">Date: ${values.from} to ${values.to}</span>`;
            } else {
                return values.map(value => 
                    `<span class="badge bg-primary me-1">${this.formatFilterLabel(filterType)}: ${value}</span>`
                ).join('');
            }
        }).join('');

        badgeContainer.innerHTML = badges;
    }

    updateUrlParams() {
        const params = new URLSearchParams();
        Object.entries(this.activeFilters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                params.set(key, value.join(','));
            } else if (typeof value === 'object') {
                params.set(key, JSON.stringify(value));
            } else {
                params.set(key, value);
            }
        });

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState(null, '', newUrl);
    }

    loadFiltersFromUrl() {
        const params = new URLSearchParams(window.location.search);
        params.forEach((value, key) => {
            if (key === 'dateRange') {
                try {
                    this.activeFilters[key] = JSON.parse(value);
                } catch (e) {
                    console.warn('Invalid dateRange parameter:', value);
                }
            } else if (value.includes(',')) {
                this.activeFilters[key] = value.split(',');
            } else {
                this.activeFilters[key] = value;
            }
        });
        
        this.applyFilters();
    }
}

// Export for use in other modules
window.FilterComponent = FilterComponent;