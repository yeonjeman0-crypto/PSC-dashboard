/**
 * PSC Dashboard Data Synchronization Script
 * Purpose: Ensure all 30 inspection records are properly loaded into dashboard
 * Created: 2025-08-26
 */

const fs = require('fs').promises;
const path = require('path');

async function syncDashboardData() {
    console.log('=================================');
    console.log('PSC Dashboard Data Sync Starting');
    console.log('=================================\n');

    try {
        // 1. Load source data
        console.log('📊 Loading source data...');
        const inspectionData = JSON.parse(
            await fs.readFile(
                path.join(__dirname, 'processed_data/operational/inspection_records.json'), 
                'utf8'
            )
        );
        const deficiencyData = JSON.parse(
            await fs.readFile(
                path.join(__dirname, 'processed_data/operational/deficiency_records.json'), 
                'utf8'
            )
        );

        console.log(`✅ Loaded ${inspectionData.inspections.length} inspections`);
        console.log(`✅ Loaded ${deficiencyData.deficiencies.length} deficiencies`);

        // 2. Create port statistics for geographic visualization
        const portStats = {};
        const vesselProfiles = {};

        inspectionData.inspections.forEach(inspection => {
            // Port statistics
            const portKey = inspection.port_name;
            if (!portStats[portKey]) {
                portStats[portKey] = {
                    portName: inspection.port_name,
                    country: inspection.port_country,
                    mouRegion: inspection.mou_region,
                    inspections: 0,
                    detentions: 0,
                    deficiencies: 0,
                    vessels: new Set(),
                    vesselCount: 0,
                    detentionRate: 0,
                    avgDeficiencies: 0,
                    locode: inspection.port_locode
                };
            }
            
            portStats[portKey].inspections++;
            portStats[portKey].deficiencies += inspection.deficiency_count;
            portStats[portKey].vessels.add(inspection.vessel_name);
            if (inspection.detention) {
                portStats[portKey].detentions++;
            }

            // Vessel profiles
            if (!vesselProfiles[inspection.vessel_name]) {
                vesselProfiles[inspection.vessel_name] = {
                    name: inspection.vessel_name,
                    type: inspection.vessel_type,
                    flag: inspection.flag_state,
                    owner: inspection.owner,
                    docCompany: inspection.doc_company,
                    inspections: [],
                    totalDeficiencies: 0,
                    detentions: 0,
                    lastInspection: null,
                    riskScore: 0
                };
            }
            
            vesselProfiles[inspection.vessel_name].inspections.push({
                date: inspection.inspection_date,
                port: inspection.port_name,
                deficiencies: inspection.deficiency_count,
                detention: inspection.detention,
                outcome: inspection.inspection_outcome
            });
            vesselProfiles[inspection.vessel_name].totalDeficiencies += inspection.deficiency_count;
            if (inspection.detention) {
                vesselProfiles[inspection.vessel_name].detentions++;
            }
        });

        // Calculate derived metrics
        Object.keys(portStats).forEach(port => {
            portStats[port].vesselCount = portStats[port].vessels.size;
            portStats[port].vessels = Array.from(portStats[port].vessels);
            portStats[port].detentionRate = 
                (portStats[port].detentions / portStats[port].inspections * 100).toFixed(1);
            portStats[port].avgDeficiencies = 
                (portStats[port].deficiencies / portStats[port].inspections).toFixed(1);
        });

        // Calculate vessel risk scores
        Object.keys(vesselProfiles).forEach(vessel => {
            const profile = vesselProfiles[vessel];
            profile.lastInspection = profile.inspections[profile.inspections.length - 1];
            
            // Risk score calculation
            const detentionRatio = profile.detentions / profile.inspections.length;
            const deficiencyRatio = profile.totalDeficiencies / profile.inspections.length;
            profile.riskScore = (detentionRatio * 50 + deficiencyRatio * 5).toFixed(1);
        });

        // 3. Prepare dashboard-specific data format
        const dashboardData = {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalInspections: inspectionData.inspections.length,
                totalDeficiencies: deficiencyData.deficiencies.length,
                totalDetentions: inspectionData.summary_statistics.detentions,
                totalVessels: Object.keys(vesselProfiles).length,
                dataSource: 'DORIKO LIMITED PSC Management System'
            },
            inspections: inspectionData.inspections,
            deficiencies: deficiencyData.deficiencies,
            vessels: vesselProfiles,
            ports: portStats,
            mouAnalysis: {
                'Tokyo MoU': { inspections: 0, detentions: 0, deficiencies: 0 },
                'Paris MoU': { inspections: 0, detentions: 0, deficiencies: 0 },
                'USCG': { inspections: 0, detentions: 0, deficiencies: 0 },
                'Mediterranean MoU': { inspections: 0, detentions: 0, deficiencies: 0 },
                'Riyadh MoU': { inspections: 0, detentions: 0, deficiencies: 0 }
            },
            timelineData: []
        };

        // MOU analysis
        inspectionData.inspections.forEach(inspection => {
            if (dashboardData.mouAnalysis[inspection.mou_region]) {
                dashboardData.mouAnalysis[inspection.mou_region].inspections++;
                dashboardData.mouAnalysis[inspection.mou_region].deficiencies += inspection.deficiency_count;
                if (inspection.detention) {
                    dashboardData.mouAnalysis[inspection.mou_region].detentions++;
                }
            }
        });

        // Timeline data for visualization
        dashboardData.timelineData = inspectionData.inspections.map(insp => ({
            date: insp.inspection_date,
            vessel: insp.vessel_name,
            port: insp.port_name,
            deficiencies: insp.deficiency_count,
            detention: insp.detention,
            mou: insp.mou_region
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        // 4. Save to dashboard data directory
        const dashboardDataPath = path.join(
            __dirname, 
            'psc-dashboard/src/assets/data/dashboard_data.json'
        );
        
        await fs.writeFile(
            dashboardDataPath, 
            JSON.stringify(dashboardData, null, 2), 
            'utf8'
        );

        console.log('\n✅ Dashboard data synchronized successfully!');
        console.log(`📁 Saved to: ${dashboardDataPath}`);
        console.log('\n📊 Summary:');
        console.log(`   - Total Inspections: ${dashboardData.metadata.totalInspections}`);
        console.log(`   - Total Vessels: ${dashboardData.metadata.totalVessels}`);
        console.log(`   - Total Deficiencies: ${dashboardData.metadata.totalDeficiencies}`);
        console.log(`   - Total Detentions: ${dashboardData.metadata.totalDetentions}`);
        console.log('\n🌐 MOU Distribution:');
        Object.entries(dashboardData.mouAnalysis).forEach(([mou, stats]) => {
            if (stats.inspections > 0) {
                console.log(`   - ${mou}: ${stats.inspections} inspections, ${stats.deficiencies} deficiencies`);
            }
        });

    } catch (error) {
        console.error('❌ Error during synchronization:', error);
    }
}

// Run synchronization
syncDashboardData();
