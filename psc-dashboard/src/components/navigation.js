/**
 * Navigation Component for PSC Dashboard
 * Tabler-based responsive navigation with active state management
 */
class NavigationComponent {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.navigationItems = [
            { id: 'dashboard', title: 'Dashboard', href: './dashboard.html', icon: 'home', badge: null },
            { id: 'inspections', title: 'Inspections', href: './inspections.html', icon: 'check-circle', badge: '30' },
            { id: 'deficiencies', title: 'Deficiencies', href: './deficiencies.html', icon: 'alert-triangle', badge: '87' },
            { id: 'vessels', title: 'Vessels', href: './vessels.html', icon: 'anchor', badge: '14' },
            { id: 'ports-map', title: 'Ports Map', href: './ports-map.html', icon: 'map-pin', badge: null },
            { id: 'risk', title: 'Risk Analysis', href: './risk.html', icon: 'shield-alert', badge: null },
            { id: 'reports', title: 'Reports', href: './reports.html', icon: 'file-text', badge: null },
            { id: 'settings', title: 'Settings', href: './settings.html', icon: 'settings', badge: null }
        ];
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('dashboard.html')) return 'dashboard';
        if (path.includes('inspections.html')) return 'inspections';
        if (path.includes('deficiencies.html')) return 'deficiencies';
        if (path.includes('vessels.html')) return 'vessels';
        if (path.includes('ports-map.html')) return 'ports-map';
        if (path.includes('risk.html')) return 'risk';
        if (path.includes('reports.html')) return 'reports';
        if (path.includes('settings.html')) return 'settings';
        return 'dashboard';
    }

    getIconSVG(iconName) {
        const icons = {
            'home': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l-2 0l9 -9l9 9l-2 0"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"/><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>',
            'check-circle': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 12l2 2l4 -4"/><path d="M21 12c0 4.97 -4.03 9 -9 9s-9 -4.03 -9 -9s4.03 -9 9 -9s9 4.03 9 9"/>',
            'alert-triangle': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v2m0 4v.01"/><path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"/>',
            'anchor': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1"/><path d="M4 18l-1 -3h18l-1 3"/><path d="M11 12h7l-7 -9v9"/><path d="M8 7l-2 5"/>',
            'map-pin': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/><path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/>',
            'shield-alert': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
            'file-text': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path d="M9 9l1 0"/><path d="M9 13l6 0"/><path d="M9 17l6 0"/>',
            'settings': '<path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>'
        };
        return icons[iconName] || icons['home'];
    }

    render() {
        const navItems = this.navigationItems.map(item => {
            const isActive = this.currentPage === item.id;
            const activeClass = isActive ? 'active' : '';
            const badge = item.badge ? `(${item.badge})` : '';
            
            return `
                <li class="nav-item ${activeClass}">
                    <a class="nav-link" href="${item.href}">
                        <span class="nav-link-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                ${this.getIconSVG(item.icon)}
                            </svg>
                        </span>
                        <span class="nav-link-title">${item.title} ${badge}</span>
                    </a>
                </li>
            `;
        }).join('');

        return `
            <aside class="navbar navbar-vertical navbar-expand-lg" data-bs-theme="dark">
                <div class="container-fluid">
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar-menu">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <h1 class="navbar-brand navbar-brand-autodark">
                        <a href="./dashboard.html">
                            <div style="display: inline-block; width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 6px; margin-right: 8px; position: relative; top: -2px;">
                                <svg xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; color: white; position: absolute; top: 6px; left: 6px;" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M2 20a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1a2.4 2.4 0 0 1 2 -1a2.4 2.4 0 0 1 2 1a2.4 2.4 0 0 0 2 1a2.4 2.4 0 0 0 2 -1"/>
                                    <path d="M4 18l-1 -3h18l-1 3"/>
                                    <path d="M11 12h7l-7 -9v9"/>
                                    <path d="M8 7l-2 5"/>
                                </svg>
                            </div>
                            PSC Dashboard
                        </a>
                    </h1>
                    
                    <div class="collapse navbar-collapse" id="sidebar-menu">
                        <ul class="navbar-nav pt-lg-3">
                            ${navItems}
                        </ul>
                    </div>
                </div>
            </aside>
        `;
    }

    updateActiveState() {
        this.currentPage = this.getCurrentPage();
        const sidebar = document.querySelector('.navbar-vertical');
        if (sidebar) {
            sidebar.innerHTML = this.render().replace(/<aside[^>]*>|<\/aside>/g, '');
        }
    }
}

// Export for use in other modules
window.NavigationComponent = NavigationComponent;