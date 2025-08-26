/**
 * PSC Dashboard Comprehensive Functionality Test Suite
 * Tests all critical functions and page functionality
 */

class PSCDashboardTester {
    constructor() {
        this.testResults = {
            integrated_index: { status: 'pending', errors: [], functions: [] },
            dashboard: { status: 'pending', errors: [], functions: [] },
            inspections: { status: 'pending', errors: [], functions: [] },
            vessels: { status: 'pending', errors: [], functions: [] },
            deficiencies: { status: 'pending', errors: [], functions: [] },
            ports_map: { status: 'pending', errors: [], functions: [] },
            risk: { status: 'pending', errors: [], functions: [] },
            reports: { status: 'pending', errors: [], functions: [] },
            settings: { status: 'pending', errors: [], functions: [] }
        };
        
        this.criticalFunctions = [
            'renderDashboardLayout',
            'renderInspectionListLayout', 
            'renderVesselManagementLayout',
            'renderDeficiencyAnalysisLayout',
            'renderPortsMapLayout',
            'renderRiskAssessmentLayout',
            'renderReportsLayout',
            'renderSettingsLayout'
        ];
        
        this.serverUrl = 'http://127.0.0.1:8090';
    }
    
    /**
     * Main test runner
     */
    async runAllTests() {
        console.log('🔍 Starting PSC Dashboard Comprehensive Test Suite...');
        
        try {
            // Test 1: Check integrated-index.html (main entry point)
            await this.testIntegratedIndex();
            
            // Test 2: Test each individual page
            await this.testDashboardPage();
            await this.testInspectionsPage();
            await this.testVesselsPage(); 
            await this.testDeficienciesPage();
            await this.testPortsMapPage();
            await this.testRiskPage();
            await this.testReportsPage();
            await this.testSettingsPage();
            
            // Generate comprehensive report
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }
    
    /**
     * Test integrated-index.html main entry point
     */
    async testIntegratedIndex() {
        console.log('📄 Testing integrated-index.html...');
        
        try {
            const response = await fetch(`${this.serverUrl}/integrated-index.html`);
            const html = await response.text();
            
            const tests = [
                {
                    name: 'HTML Structure',
                    test: () => html.includes('<div id="mainApplication"') && html.includes('<div id="systemLoadingScreen"'),
                    critical: true
                },
                {
                    name: 'Navigation Links', 
                    test: () => html.includes('./src/pages/dashboard.html') && html.includes('./src/pages/inspections.html'),
                    critical: true
                },
                {
                    name: 'JavaScript Dependencies',
                    test: () => html.includes('system-config.js') && html.includes('state-management.js'),
                    critical: true
                },
                {
                    name: 'CSS Dependencies',
                    test: () => html.includes('tabler.min.css') && html.includes('psc-custom.css'),
                    critical: false
                }
            ];
            
            let passed = 0, failed = 0;
            tests.forEach(test => {
                try {
                    if (test.test()) {
                        this.testResults.integrated_index.functions.push(`✅ ${test.name}`);
                        passed++;
                    } else {
                        this.testResults.integrated_index.errors.push(`❌ ${test.name} failed`);
                        failed++;
                    }
                } catch (error) {
                    this.testResults.integrated_index.errors.push(`❌ ${test.name} error: ${error.message}`);
                    failed++;
                }
            });
            
            this.testResults.integrated_index.status = failed === 0 ? 'passed' : 'failed';
            console.log(`✅ integrated-index.html: ${passed} passed, ${failed} failed`);
            
        } catch (error) {
            this.testResults.integrated_index.status = 'failed';
            this.testResults.integrated_index.errors.push(`Network error: ${error.message}`);
            console.error('❌ integrated-index.html test failed:', error);
        }
    }
    
    /**
     * Test dashboard.html page
     */
    async testDashboardPage() {
        console.log('📊 Testing dashboard.html...');
        
        try {
            const response = await fetch(`${this.serverUrl}/src/pages/dashboard.html`);
            const html = await response.text();
            
            const tests = [
                {
                    name: 'Dashboard HTML Structure',
                    test: () => html.includes('<div class="page-body">') && html.includes('KPI Cards'),
                    critical: true
                },
                {
                    name: 'JavaScript Function Call',
                    test: () => html.includes('renderDashboardLayout()') || html.includes('renderDashboardLayout'),
                    critical: true
                },
                {
                    name: 'Chart Containers', 
                    test: () => html.includes('monthly-inspection-chart') && html.includes('top-deficiency-bar'),
                    critical: true
                },
                {
                    name: 'Navigation Elements',
                    test: () => html.includes('navbar') || html.includes('sidebar'),
                    critical: false
                }
            ];
            
            this.runPageTests('dashboard', tests);
            
        } catch (error) {
            this.testResults.dashboard.status = 'failed';
            this.testResults.dashboard.errors.push(`Network error: ${error.message}`);
            console.error('❌ dashboard.html test failed:', error);
        }
    }
    
    /**
     * Test inspections.html page
     */
    async testInspectionsPage() {
        console.log('🔍 Testing inspections.html...');
        
        try {
            const response = await fetch(`${this.serverUrl}/src/pages/inspections.html`);
            const html = await response.text();
            
            const tests = [
                {
                    name: 'Inspections HTML Structure',
                    test: () => html.includes('inspection') && html.includes('<div class="page-body">'),
                    critical: true
                },
                {
                    name: 'JavaScript Function Call',
                    test: () => html.includes('renderInspectionListLayout()') || html.includes('renderInspectionListLayout'),
                    critical: true
                },
                {
                    name: 'Table Structure',
                    test: () => html.includes('<table') || html.includes('inspection-table'),
                    critical: true
                },
                {
                    name: 'Filter Elements',
                    test: () => html.includes('filter') || html.includes('search'),
                    critical: false
                }
            ];
            
            this.runPageTests('inspections', tests);
            
        } catch (error) {
            this.testResults.inspections.status = 'failed';
            this.testResults.inspections.errors.push(`Network error: ${error.message}`);
            console.error('❌ inspections.html test failed:', error);
        }
    }
    
    /**
     * Test vessels.html page
     */
    async testVesselsPage() {
        console.log('🚢 Testing vessels.html...');
        
        try {
            const response = await fetch(`${this.serverUrl}/src/pages/vessels.html`);
            const html = await response.text();
            
            const tests = [
                {
                    name: 'Vessels HTML Structure',
                    test: () => html.includes('vessel') && html.includes('<div class="page-body">'),
                    critical: true
                },
                {
                    name: 'JavaScript Function Call', 
                    test: () => html.includes('renderVesselManagementLayout()') || html.includes('renderVesselManagementLayout'),
                    critical: true
                },
                {
                    name: 'Fleet Elements',
                    test: () => html.includes('fleet') || html.includes('ship'),
                    critical: true
                }
            ];
            
            this.runPageTests('vessels', tests);
            
        } catch (error) {
            this.testResults.vessels.status = 'failed';
            this.testResults.vessels.errors.push(`Network error: ${error.message}`);
            console.error('❌ vessels.html test failed:', error);
        }
    }
    
    /**
     * Test deficiencies.html page
     */  
    async testDeficienciesPage() {
        console.log('⚠️ Testing deficiencies.html...');
        
        try {
            const response = await fetch(`${this.serverUrl}/src/pages/deficiencies.html`);
            const html = await response.text();
            
            const tests = [
                {
                    name: 'Deficiencies HTML Structure',
                    test: () => html.includes('deficien') && html.includes('<div class="page-body">'),
                    critical: true
                },
                {
                    name: 'JavaScript Function Call',
                    test: () => html.includes('renderDeficiencyAnalysisLayout()') || html.includes('renderDeficiencyAnalysisLayout'),
                    critical: true
                }
            ];
            
            this.runPageTests('deficiencies', tests);
            
        } catch (error) {
            this.testResults.deficiencies.status = 'failed';
            this.testResults.deficiencies.errors.push(`Network error: ${error.message}`);
            console.error('❌ deficiencies.html test failed:', error);
        }
    }
    
    /**
     * Test ports-map.html page
     */
    async testPortsMapPage() {
        console.log('🗺️ Testing ports-map.html...');
        
        try {
            const response = await fetch(`${this.serverUrl}/src/pages/ports-map.html`);
            const html = await response.text();
            
            const tests = [
                {
                    name: 'Ports Map HTML Structure',
                    test: () => html.includes('map') && html.includes('<div class="page-body">'),
                    critical: true
                },
                {
                    name: 'JavaScript Function Call',
                    test: () => html.includes('renderPortsMapLayout()') || html.includes('renderPortsMapLayout'),
                    critical: true
                }
            ];
            
            this.runPageTests('ports_map', tests);
            
        } catch (error) {
            this.testResults.ports_map.status = 'failed';
            this.testResults.ports_map.errors.push(`Network error: ${error.message}`);
            console.error('❌ ports-map.html test failed:', error);
        }
    }
    
    /**
     * Test risk.html page
     */
    async testRiskPage() {
        console.log('⚡ Testing risk.html...');
        
        try {
            const response = await fetch(`${this.serverUrl}/src/pages/risk.html`);
            const html = await response.text();
            
            const tests = [
                {
                    name: 'Risk HTML Structure', 
                    test: () => html.includes('risk') && html.includes('<div class="page-body">'),
                    critical: true
                },
                {
                    name: 'JavaScript Function Call',
                    test: () => html.includes('renderRiskAssessmentLayout()') || html.includes('renderRiskAssessmentLayout'),
                    critical: true
                }
            ];
            
            this.runPageTests('risk', tests);
            
        } catch (error) {
            this.testResults.risk.status = 'failed';
            this.testResults.risk.errors.push(`Network error: ${error.message}`);
            console.error('❌ risk.html test failed:', error);
        }
    }
    
    /**
     * Test reports.html page
     */
    async testReportsPage() {
        console.log('📋 Testing reports.html...');
        
        try {
            const response = await fetch(`${this.serverUrl}/src/pages/reports.html`);
            const html = await response.text();
            
            const tests = [
                {
                    name: 'Reports HTML Structure',
                    test: () => html.includes('report') && html.includes('<div class="page-body">'),
                    critical: true
                },
                {
                    name: 'JavaScript Function Call',
                    test: () => html.includes('renderReportsLayout()') || html.includes('renderReportsLayout'),
                    critical: true
                }
            ];
            
            this.runPageTests('reports', tests);
            
        } catch (error) {
            this.testResults.reports.status = 'failed';
            this.testResults.reports.errors.push(`Network error: ${error.message}`);
            console.error('❌ reports.html test failed:', error);
        }
    }
    
    /**
     * Test settings.html page
     */
    async testSettingsPage() {
        console.log('⚙️ Testing settings.html...');
        
        try {
            const response = await fetch(`${this.serverUrl}/src/pages/settings.html`);
            const html = await response.text();
            
            const tests = [
                {
                    name: 'Settings HTML Structure',
                    test: () => html.includes('setting') && html.includes('<div class="page-body">'),
                    critical: true
                },
                {
                    name: 'JavaScript Function Call',
                    test: () => html.includes('renderSettingsLayout()') || html.includes('renderSettingsLayout'),
                    critical: true
                }
            ];
            
            this.runPageTests('settings', tests);
            
        } catch (error) {
            this.testResults.settings.status = 'failed';
            this.testResults.settings.errors.push(`Network error: ${error.message}`);
            console.error('❌ settings.html test failed:', error);
        }
    }
    
    /**
     * Helper method to run tests for a page
     */
    runPageTests(pageName, tests) {
        let passed = 0, failed = 0;
        
        tests.forEach(test => {
            try {
                if (test.test()) {
                    this.testResults[pageName].functions.push(`✅ ${test.name}`);
                    passed++;
                } else {
                    this.testResults[pageName].errors.push(`❌ ${test.name} failed`);
                    failed++;
                }
            } catch (error) {
                this.testResults[pageName].errors.push(`❌ ${test.name} error: ${error.message}`);
                failed++;
            }
        });
        
        this.testResults[pageName].status = failed === 0 ? 'passed' : 'failed';
        console.log(`✅ ${pageName}.html: ${passed} passed, ${failed} failed`);
    }
    
    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 PSC DASHBOARD COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(60));
        
        let totalPages = 0, passedPages = 0, failedPages = 0;
        
        Object.keys(this.testResults).forEach(page => {
            totalPages++;
            const result = this.testResults[page];
            
            if (result.status === 'passed') {
                passedPages++;
                console.log(`\n✅ ${page.replace('_', '-')}.html - PASSED`);
            } else {
                failedPages++;
                console.log(`\n❌ ${page.replace('_', '-')}.html - FAILED`);
            }
            
            if (result.functions.length > 0) {
                console.log('  Functions Working:');
                result.functions.forEach(func => console.log(`    ${func}`));
            }
            
            if (result.errors.length > 0) {
                console.log('  Issues Found:');
                result.errors.forEach(error => console.log(`    ${error}`));
            }
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY STATISTICS');
        console.log('='.repeat(60));
        console.log(`Total Pages Tested: ${totalPages}`);
        console.log(`✅ Passed: ${passedPages} (${((passedPages/totalPages)*100).toFixed(1)}%)`);
        console.log(`❌ Failed: ${failedPages} (${((failedPages/totalPages)*100).toFixed(1)}%)`);
        
        console.log('\n📋 CRITICAL FUNCTIONS STATUS:');
        this.criticalFunctions.forEach(func => {
            const found = Object.values(this.testResults).some(result => 
                result.functions.some(f => f.includes(func)) || 
                result.errors.some(e => e.includes(func))
            );
            console.log(`  ${found ? '✅' : '❌'} ${func}`);
        });
        
        console.log('\n🔍 RECOMMENDATIONS:');
        if (failedPages > 0) {
            console.log('  • Fix JavaScript function definitions');
            console.log('  • Ensure proper script loading order');
            console.log('  • Verify data file availability');
            console.log('  • Check for missing dependencies');
        } else {
            console.log('  • All tests passed! System appears functional');
            console.log('  • Consider performance optimization');
            console.log('  • Add user interaction testing');
        }
        
        return {
            totalPages,
            passedPages,
            failedPages,
            successRate: ((passedPages/totalPages)*100).toFixed(1)
        };
    }
}

// Auto-run tests if script is loaded directly
if (typeof window !== 'undefined' && window.location) {
    console.log('🔍 PSC Dashboard Test Suite loaded - run tester.runAllTests() to start');
    window.PSCDashboardTester = PSCDashboardTester;
    window.tester = new PSCDashboardTester();
} else {
    // Node.js environment
    const tester = new PSCDashboardTester();
    tester.runAllTests();
}