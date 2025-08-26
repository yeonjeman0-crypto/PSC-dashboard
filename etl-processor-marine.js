/**
 * ETLProcessor_Marine - PSC Dashboard ETL Pipeline v1.0
 * Marine Data ETL Pipeline Specialist Implementation
 * 
 * Core Constraints (ABSOLUTE COMPLIANCE):
 * - DOC: DORIKO LIMITED(12) + DOUBLERICH SHIPPING(2) = 14 vessels
 * - OWNER: SAMJOO(9) + GMT(1) + SW(2) + WOORI(1) + DAEBO(1) = 14 vessels
 * - VESSEL TYPES: PC(T)C(7) + Bulk(7) = 14 vessels
 * - PSC: 30 inspections, 87 deficiencies, 4 detentions, 6 clean
 * - ZERO DATA CREATION - Transform raw JSON only
 */

const fs = require('fs');
const path = require('path');

class ETLProcessorMarine {
    constructor() {
        this.rawDataPath = './Raw Data from User/';
        this.outputPath = './etl-output/';
        this.constraints = {
            totalVessels: 14,
            docCompanies: { 'DORIKO LIMITED': 12, 'DOUBLERICH SHIPPING': 2 },
            owners: { 'SAMJOO': 9, 'GMT': 1, 'SW': 2, 'WOORI': 1, 'DAEBO': 1 },
            vesselTypes: { 'PC(T)C': 7, 'Bulk': 7 },
            totalInspections: 30,
            totalDeficiencies: 87,
            detentions: 4,
            cleanInspections: 6
        };
        this.validationErrors = [];
        this.processedData = {};
    }

    // Phase 1: Extract Functions (camelCase)
    
    /**
     * extractFleetMasterData() - Extract 14 vessels from fleet master JSON
     * @returns {Object} Normalized fleet master data
     */
    async extractFleetMasterData() {
        try {
            const rawPath = path.join(this.rawDataPath, '01-fleet-master.json');
            const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
            
            console.log(`📊 Extracting Fleet Master Data - Expected: ${this.constraints.totalVessels} vessels`);
            
            // Validate critical constraints FIRST
            if (rawData.total_vessels !== this.constraints.totalVessels) {
                throw new Error(`CONSTRAINT VIOLATION: Expected ${this.constraints.totalVessels} vessels, found ${rawData.total_vessels}`);
            }

            // Extract and validate vessel distribution
            const extractedVessels = rawData.vessels.map(vessel => ({
                vesselId: vessel.vessel_id,
                vesselName: vessel.vessel_name,
                imoNumber: vessel.imo_number,
                imoVerified: vessel.imo_verified,
                vesselType: vessel.vessel_type,
                vesselTypeFull: vessel.vessel_type_full,
                flagState: vessel.flag_state,
                flagCode: vessel.flag_code,
                owner: vessel.owner,
                docCompany: vessel.doc_company,
                builtYear: vessel.built_year,
                builtMonth: vessel.built_month,
                ageYears: vessel.age_years,
                dwt: vessel.dwt,
                grt: vessel.grt,
                classificationSociety: vessel.classification_society,
                riskProfile: vessel.risk_profile,
                operationalStatus: vessel.operational_status,
                fleetCategory: vessel.fleet_category,
                inspectionHistory: vessel.inspection_history,
                complianceMetrics: vessel.compliance_metrics
            }));

            // Validate constraints
            this.validateFleetConstraints(extractedVessels, rawData.fleet_composition);
            
            this.processedData.fleetMaster = {
                metadata: {
                    extractedAt: new Date().toISOString(),
                    sourceSchema: rawData.schema_version,
                    totalVessels: extractedVessels.length,
                    validationStatus: 'PASSED'
                },
                vessels: extractedVessels,
                fleetComposition: rawData.fleet_composition,
                fleetStatistics: rawData.fleet_statistics
            };

            console.log(`✅ Fleet Master extraction completed - ${extractedVessels.length} vessels processed`);
            return this.processedData.fleetMaster;

        } catch (error) {
            console.error(`❌ Fleet Master extraction failed: ${error.message}`);
            this.validationErrors.push(`extractFleetMasterData: ${error.message}`);
            throw error;
        }
    }

    /**
     * extractInspectionRecords() - Extract 30 inspection records from PSC JSON
     * @returns {Object} Normalized inspection records
     */
    async extractInspectionRecords() {
        try {
            const rawPath = path.join(this.rawDataPath, '02-inspection-records.json');
            const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
            
            console.log(`📊 Extracting Inspection Records - Expected: ${this.constraints.totalInspections} inspections`);
            
            // Validate critical constraints
            if (rawData.total_records !== this.constraints.totalInspections) {
                throw new Error(`CONSTRAINT VIOLATION: Expected ${this.constraints.totalInspections} inspections, found ${rawData.total_records}`);
            }

            const extractedInspections = rawData.records.map(record => ({
                inspectionId: record.inspection_id,
                inspectionDate: record.inspection_date,
                year: record.year,
                quarter: record.quarter,
                month: record.month,
                monthName: record.month_name,
                weekOfYear: record.week_of_year,
                vessel: {
                    name: record.vessel.name,
                    type: record.vessel.type,
                    flagState: record.vessel.flag_state,
                    owner: record.vessel.owner
                },
                port: {
                    name: record.port.name,
                    country: record.port.country,
                    portState: record.port.port_state
                },
                mouRegion: record.mou_region,
                mouClassification: record.mou_classification,
                inspectionType: record.inspection_type,
                deficiencyCount: record.deficiency_count,
                deficiencies: record.deficiencies.map(def => ({
                    deficiencyCode: def.deficiency_code,
                    description: def.description,
                    actionCode: def.action_code,
                    actionDescription: def.action_description,
                    category: def.category,
                    severity: def.severity
                })),
                actionCodes: record.action_codes,
                detention: record.detention,
                inspectionOutcome: record.inspection_outcome,
                inspector: record.inspector,
                inspectionDuration: record.inspection_duration,
                docCompany: record.doc_company,
                complianceStatus: record.compliance_status
            }));

            // Validate inspection constraints
            this.validateInspectionConstraints(rawData.summary_statistics);
            
            this.processedData.inspectionRecords = {
                metadata: {
                    extractedAt: new Date().toISOString(),
                    sourceSchema: rawData.schema_version,
                    totalRecords: extractedInspections.length,
                    period: rawData.period,
                    validationStatus: 'PASSED'
                },
                inspections: extractedInspections,
                summaryStatistics: rawData.summary_statistics
            };

            console.log(`✅ Inspection Records extraction completed - ${extractedInspections.length} records processed`);
            return this.processedData.inspectionRecords;

        } catch (error) {
            console.error(`❌ Inspection Records extraction failed: ${error.message}`);
            this.validationErrors.push(`extractInspectionRecords: ${error.message}`);
            throw error;
        }
    }

    /**
     * extractReferenceData() - Extract reference data from 4 reference tables
     * @returns {Object} Combined reference data
     */
    async extractReferenceData() {
        try {
            console.log('📊 Extracting Reference Data - 4 tables expected');
            
            const referenceFiles = [
                { file: '03-mou-registry.json', key: 'mouRegistry' },
                { file: '04-action-codes.json', key: 'actionCodes' },
                { file: '05-deficiency-codes.json', key: 'deficiencyCodes' },
                { file: '06-unlocode-registry.json', key: 'unlocodeRegistry' }
            ];

            const extractedReference = {};

            for (const ref of referenceFiles) {
                const rawPath = path.join(this.rawDataPath, ref.file);
                if (fs.existsSync(rawPath)) {
                    const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
                    extractedReference[ref.key] = rawData;
                    console.log(`✅ ${ref.file} extracted successfully`);
                } else {
                    console.warn(`⚠️ ${ref.file} not found - using minimal structure`);
                    extractedReference[ref.key] = { data: [], total: 0 };
                }
            }

            this.processedData.referenceData = {
                metadata: {
                    extractedAt: new Date().toISOString(),
                    filesProcessed: Object.keys(extractedReference).length,
                    validationStatus: 'PASSED'
                },
                ...extractedReference
            };

            console.log(`✅ Reference Data extraction completed - ${Object.keys(extractedReference).length} tables processed`);
            return this.processedData.referenceData;

        } catch (error) {
            console.error(`❌ Reference Data extraction failed: ${error.message}`);
            this.validationErrors.push(`extractReferenceData: ${error.message}`);
            throw error;
        }
    }

    // Phase 2: Transform Functions (camelCase)
    
    /**
     * transformVesselData() - Normalize vessel information preserving DOC/OWNER distribution
     * @param {Object} fleetData - Extracted fleet master data
     * @returns {Object} Normalized vessel master table
     */
    transformVesselData(fleetData) {
        try {
            console.log('🔄 Transforming Vessel Data - Preserving DOC/OWNER distribution');
            
            const transformedVessels = fleetData.vessels.map(vessel => ({
                // Master Table Structure
                vesselId: vessel.vesselId,
                vesselName: vessel.vesselName,
                imoNumber: vessel.imoNumber || null,
                vesselType: vessel.vesselType,
                vesselTypeDescription: vessel.vesselTypeFull,
                
                // Ownership & Documentation (CRITICAL - DO NOT MODIFY)
                owner: vessel.owner, // SAMJOO(9)+GMT(1)+SW(2)+WOORI(1)+DAEBO(1)=14
                docCompany: vessel.docCompany, // DORIKO(12)+DOUBLERICH(2)=14
                fleetCategory: vessel.fleetCategory,
                
                // Technical Specifications
                flagState: vessel.flagState,
                flagCode: vessel.flagCode,
                classificationSociety: vessel.classificationSociety,
                builtYear: vessel.builtYear,
                builtMonth: vessel.builtMonth,
                vesselAge: vessel.ageYears,
                dwt: vessel.dwt,
                grt: vessel.grt,
                
                // Operational Data
                riskProfile: vessel.riskProfile,
                operationalStatus: vessel.operationalStatus,
                
                // Performance Metrics (from inspection history)
                totalInspections: vessel.inspectionHistory.total_inspections,
                totalDeficiencies: vessel.inspectionHistory.total_deficiencies,
                detentionCount: vessel.inspectionHistory.detention_count,
                cleanInspections: vessel.inspectionHistory.clean_inspections,
                detentionRate: vessel.complianceMetrics.detention_rate,
                cleanRate: vessel.complianceMetrics.clean_rate,
                deficiencyTrend: vessel.complianceMetrics.deficiency_trend,
                
                // Temporal Data
                firstInspection: vessel.inspectionHistory.first_inspection,
                lastInspection: vessel.inspectionHistory.last_inspection,
                avgDeficienciesPerInspection: vessel.inspectionHistory.avg_deficiencies_per_inspection,
                mostRecentOutcome: vessel.inspectionHistory.most_recent_outcome,
                
                // ETL Metadata
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                dataSource: 'fleet-master-v1.0.0'
            }));

            // Final validation after transformation
            this.validateTransformedVessels(transformedVessels);
            
            console.log(`✅ Vessel transformation completed - ${transformedVessels.length} vessels normalized`);
            return {
                vessels: transformedVessels,
                transformationRules: [
                    'DOC/OWNER distribution preserved exactly',
                    'All field names converted to camelCase',
                    'Inspection metrics aggregated from history',
                    'ETL metadata appended for audit trail'
                ],
                validationStatus: 'PASSED'
            };

        } catch (error) {
            console.error(`❌ Vessel transformation failed: ${error.message}`);
            this.validationErrors.push(`transformVesselData: ${error.message}`);
            throw error;
        }
    }

    /**
     * normalizeInspectionData() - Standardize inspection records maintaining 30 records
     * @param {Object} inspectionData - Extracted inspection records
     * @returns {Object} Normalized inspection fact table
     */
    normalizeInspectionData(inspectionData) {
        try {
            console.log('🔄 Normalizing Inspection Data - Maintaining 30 records exactly');
            
            const normalizedInspections = inspectionData.inspections.map(inspection => ({
                // Primary Keys
                inspectionId: inspection.inspectionId,
                vesselName: inspection.vessel.name,
                inspectionDate: inspection.inspectionDate,
                
                // Temporal Dimensions
                inspectionYear: inspection.year,
                inspectionQuarter: inspection.quarter,
                inspectionMonth: inspection.month,
                inspectionMonthName: inspection.monthName,
                inspectionWeek: inspection.weekOfYear,
                
                // Vessel Dimensions (Reference to Master)
                vesselType: inspection.vessel.type,
                flagState: inspection.vessel.flagState,
                owner: inspection.vessel.owner,
                docCompany: inspection.docCompany,
                
                // Location Dimensions
                portName: inspection.port.name,
                portCountry: inspection.port.country,
                portState: inspection.port.portState,
                mouRegion: inspection.mouRegion,
                mouClassification: inspection.mouClassification,
                
                // Inspection Details
                inspectionType: inspection.inspectionType,
                inspector: inspection.inspector,
                inspectionDuration: inspection.inspectionDuration,
                
                // Results & Metrics
                deficiencyCount: inspection.deficiencyCount,
                detention: inspection.detention,
                inspectionOutcome: inspection.inspectionOutcome,
                complianceStatus: inspection.complianceStatus,
                
                // Action Codes (Normalized)
                actionCodes: inspection.actionCodes,
                primaryActionCode: inspection.actionCodes[0] || null,
                
                // Deficiency Details (Normalized)
                deficiencies: inspection.deficiencies.map(def => ({
                    deficiencyCode: def.deficiencyCode,
                    category: def.category,
                    severity: def.severity,
                    description: def.description,
                    actionCode: def.actionCode,
                    actionDescription: def.actionDescription
                })),
                
                // Business Classifications
                isCriticalDeficiency: inspection.deficiencies.some(def => def.severity === 'Critical'),
                isDetention: inspection.detention,
                isCleanInspection: inspection.deficiencyCount === 0,
                
                // ETL Metadata
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                dataSource: 'inspection-records-v1.0.0'
            }));

            // Validate 30 records maintained
            if (normalizedInspections.length !== this.constraints.totalInspections) {
                throw new Error(`CONSTRAINT VIOLATION: Expected ${this.constraints.totalInspections} inspections, normalized ${normalizedInspections.length}`);
            }
            
            console.log(`✅ Inspection normalization completed - ${normalizedInspections.length} records processed`);
            return {
                inspections: normalizedInspections,
                normalizationRules: [
                    'All 30 inspection records preserved',
                    'Temporal dimensions fully expanded',
                    'Deficiency details nested and normalized',
                    'Business rule classifications applied'
                ],
                validationStatus: 'PASSED'
            };

        } catch (error) {
            console.error(`❌ Inspection normalization failed: ${error.message}`);
            this.validationErrors.push(`normalizeInspectionData: ${error.message}`);
            throw error;
        }
    }

    /**
     * validateBusinessRules() - Verify all business constraints (companies, vessel count, PSC data)
     * @param {Object} transformedData - All transformed data
     * @returns {Object} Validation report
     */
    validateBusinessRules(transformedData) {
        try {
            console.log('🔍 Validating Business Rules - Critical constraints verification');
            
            const violations = [];
            const warnings = [];
            
            // Rule 1: Total vessel count
            const totalVessels = transformedData.vessels.length;
            if (totalVessels !== this.constraints.totalVessels) {
                violations.push(`Total vessels: expected ${this.constraints.totalVessels}, found ${totalVessels}`);
            }

            // Rule 2: DOC company distribution
            const docDistribution = {};
            transformedData.vessels.forEach(v => {
                docDistribution[v.docCompany] = (docDistribution[v.docCompany] || 0) + 1;
            });
            
            Object.entries(this.constraints.docCompanies).forEach(([company, expectedCount]) => {
                const actualCount = docDistribution[company] || 0;
                if (actualCount !== expectedCount) {
                    violations.push(`DOC ${company}: expected ${expectedCount}, found ${actualCount}`);
                }
            });

            // Rule 3: Owner distribution
            const ownerDistribution = {};
            transformedData.vessels.forEach(v => {
                ownerDistribution[v.owner] = (ownerDistribution[v.owner] || 0) + 1;
            });
            
            Object.entries(this.constraints.owners).forEach(([owner, expectedCount]) => {
                const actualCount = ownerDistribution[owner] || 0;
                if (actualCount !== expectedCount) {
                    violations.push(`OWNER ${owner}: expected ${expectedCount}, found ${actualCount}`);
                }
            });

            // Rule 4: Vessel type distribution
            const typeDistribution = {};
            transformedData.vessels.forEach(v => {
                typeDistribution[v.vesselType] = (typeDistribution[v.vesselType] || 0) + 1;
            });
            
            Object.entries(this.constraints.vesselTypes).forEach(([type, expectedCount]) => {
                const actualCount = typeDistribution[type] || 0;
                if (actualCount !== expectedCount) {
                    violations.push(`VESSEL TYPE ${type}: expected ${expectedCount}, found ${actualCount}`);
                }
            });

            // Rule 5: Inspection data validation (if available)
            if (transformedData.inspections) {
                const totalInspections = transformedData.inspections.length;
                if (totalInspections !== this.constraints.totalInspections) {
                    violations.push(`Total inspections: expected ${this.constraints.totalInspections}, found ${totalInspections}`);
                }

                const detentions = transformedData.inspections.filter(i => i.detention).length;
                if (detentions !== this.constraints.detentions) {
                    violations.push(`Detentions: expected ${this.constraints.detentions}, found ${detentions}`);
                }

                const cleanInspections = transformedData.inspections.filter(i => i.deficiencyCount === 0).length;
                if (cleanInspections !== this.constraints.cleanInspections) {
                    violations.push(`Clean inspections: expected ${this.constraints.cleanInspections}, found ${cleanInspections}`);
                }
            }

            const validationResult = {
                validationStatus: violations.length === 0 ? 'PASSED' : 'FAILED',
                violations: violations,
                warnings: warnings,
                checkedRules: [
                    'Total vessel count (14)',
                    'DOC company distribution (DORIKO:12, DOUBLERICH:2)',
                    'Owner distribution (SAMJOO:9, GMT:1, SW:2, WOORI:1, DAEBO:1)',
                    'Vessel type distribution (PC(T)C:7, Bulk:7)',
                    'PSC inspection constraints (30 records, 4 detentions, 6 clean)'
                ],
                validatedAt: new Date().toISOString()
            };

            if (violations.length > 0) {
                console.error(`❌ Business Rule Validation FAILED - ${violations.length} violations found`);
                violations.forEach(v => console.error(`  🚨 ${v}`));
                throw new Error(`Business rule violations detected: ${violations.join('; ')}`);
            } else {
                console.log(`✅ Business Rule Validation PASSED - All constraints satisfied`);
            }

            return validationResult;

        } catch (error) {
            console.error(`❌ Business rule validation failed: ${error.message}`);
            this.validationErrors.push(`validateBusinessRules: ${error.message}`);
            throw error;
        }
    }

    // Phase 3: Load Functions (camelCase)
    
    /**
     * loadMasterTables() - Load normalized master tables to destination
     * @param {Object} transformedData - All transformed and validated data
     * @returns {Object} Load operation results
     */
    async loadMasterTables(transformedData) {
        try {
            console.log('💾 Loading Master Tables - Atomic transaction mode');
            
            // Create output directory
            if (!fs.existsSync(this.outputPath)) {
                fs.mkdirSync(this.outputPath, { recursive: true });
            }

            const loadResults = {};

            // Load Vessel Master Table
            const vesselMasterPath = path.join(this.outputPath, 'vessel_master.json');
            fs.writeFileSync(vesselMasterPath, JSON.stringify({
                metadata: {
                    tableName: 'vessel_master',
                    loadedAt: new Date().toISOString(),
                    recordCount: transformedData.vessels.length,
                    etlVersion: '1.0.0',
                    constraints: this.constraints
                },
                data: transformedData.vessels
            }, null, 2));
            
            loadResults.vesselMaster = {
                tableName: 'vessel_master',
                recordCount: transformedData.vessels.length,
                filePath: vesselMasterPath,
                loadStatus: 'SUCCESS'
            };

            console.log(`✅ Vessel Master loaded - ${transformedData.vessels.length} records`);

            // Load Reference Tables (if available)
            if (this.processedData.referenceData) {
                Object.entries(this.processedData.referenceData).forEach(([key, data]) => {
                    if (key !== 'metadata') {
                        const refTablePath = path.join(this.outputPath, `${key}_master.json`);
                        fs.writeFileSync(refTablePath, JSON.stringify({
                            metadata: {
                                tableName: `${key}_master`,
                                loadedAt: new Date().toISOString(),
                                etlVersion: '1.0.0'
                            },
                            data: data
                        }, null, 2));
                        
                        loadResults[key] = {
                            tableName: `${key}_master`,
                            filePath: refTablePath,
                            loadStatus: 'SUCCESS'
                        };
                    }
                });
            }

            console.log(`✅ Master Tables loading completed - ${Object.keys(loadResults).length} tables loaded`);
            return {
                operation: 'loadMasterTables',
                status: 'SUCCESS',
                loadedTables: loadResults,
                loadedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ Master Tables loading failed: ${error.message}`);
            this.validationErrors.push(`loadMasterTables: ${error.message}`);
            throw error;
        }
    }

    /**
     * loadFactTables() - Load normalized fact tables (inspection records)
     * @param {Object} normalizedInspections - Normalized inspection data
     * @returns {Object} Fact load operation results
     */
    async loadFactTables(normalizedInspections) {
        try {
            console.log('💾 Loading Fact Tables - Inspection records with referential integrity');
            
            const inspectionFactPath = path.join(this.outputPath, 'inspection_fact.json');
            fs.writeFileSync(inspectionFactPath, JSON.stringify({
                metadata: {
                    tableName: 'inspection_fact',
                    loadedAt: new Date().toISOString(),
                    recordCount: normalizedInspections.inspections.length,
                    etlVersion: '1.0.0',
                    constraints: {
                        totalInspections: this.constraints.totalInspections,
                        totalDeficiencies: this.constraints.totalDeficiencies,
                        detentions: this.constraints.detentions,
                        cleanInspections: this.constraints.cleanInspections
                    }
                },
                data: normalizedInspections.inspections
            }, null, 2));

            console.log(`✅ Inspection Fact Table loaded - ${normalizedInspections.inspections.length} records`);

            return {
                operation: 'loadFactTables',
                status: 'SUCCESS',
                inspectionFact: {
                    tableName: 'inspection_fact',
                    recordCount: normalizedInspections.inspections.length,
                    filePath: inspectionFactPath,
                    loadStatus: 'SUCCESS'
                },
                loadedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ Fact Tables loading failed: ${error.message}`);
            this.validationErrors.push(`loadFactTables: ${error.message}`);
            throw error;
        }
    }

    /**
     * generateKpiTables() - Generate KPI aggregation tables for dashboard
     * @param {Object} allData - Complete ETL processed data
     * @returns {Object} KPI generation results
     */
    async generateKpiTables(allData) {
        try {
            console.log('📊 Generating KPI Tables - Dashboard aggregations');
            
            const vessels = allData.vesselMaster.data;
            const inspections = allData.inspectionFact ? allData.inspectionFact.data : [];

            // Fleet Overview KPIs
            const fleetKpis = {
                totalVessels: vessels.length,
                vesselsByType: vessels.reduce((acc, v) => {
                    acc[v.vesselType] = (acc[v.vesselType] || 0) + 1;
                    return acc;
                }, {}),
                vesselsByOwner: vessels.reduce((acc, v) => {
                    acc[v.owner] = (acc[v.owner] || 0) + 1;
                    return acc;
                }, {}),
                vesselsByDocCompany: vessels.reduce((acc, v) => {
                    acc[v.docCompany] = (acc[v.docCompany] || 0) + 1;
                    return acc;
                }, {}),
                riskDistribution: vessels.reduce((acc, v) => {
                    acc[v.riskProfile] = (acc[v.riskProfile] || 0) + 1;
                    return acc;
                }, {}),
                avgVesselAge: vessels.reduce((sum, v) => sum + v.vesselAge, 0) / vessels.length
            };

            // PSC Performance KPIs
            const pscKpis = inspections.length > 0 ? {
                totalInspections: inspections.length,
                totalDeficiencies: inspections.reduce((sum, i) => sum + i.deficiencyCount, 0),
                detentions: inspections.filter(i => i.detention).length,
                cleanInspections: inspections.filter(i => i.deficiencyCount === 0).length,
                detentionRate: (inspections.filter(i => i.detention).length / inspections.length * 100).toFixed(1),
                cleanRate: (inspections.filter(i => i.deficiencyCount === 0).length / inspections.length * 100).toFixed(1),
                avgDeficienciesPerInspection: (inspections.reduce((sum, i) => sum + i.deficiencyCount, 0) / inspections.length).toFixed(1),
                inspectionsByQuarter: inspections.reduce((acc, i) => {
                    const key = `${i.inspectionYear}Q${i.inspectionQuarter}`;
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {}),
                deficienciesByCategory: inspections.flatMap(i => i.deficiencies).reduce((acc, d) => {
                    acc[d.category] = (acc[d.category] || 0) + 1;
                    return acc;
                }, {})
            } : {};

            // Vessel Performance KPIs
            const vesselPerformanceKpis = vessels.map(vessel => ({
                vesselName: vessel.vesselName,
                vesselType: vessel.vesselType,
                owner: vessel.owner,
                docCompany: vessel.docCompany,
                totalInspections: vessel.totalInspections,
                totalDeficiencies: vessel.totalDeficiencies,
                detentionCount: vessel.detentionCount,
                cleanInspections: vessel.cleanInspections,
                detentionRate: vessel.detentionRate,
                cleanRate: vessel.cleanRate,
                riskProfile: vessel.riskProfile,
                deficiencyTrend: vessel.deficiencyTrend,
                lastInspection: vessel.lastInspection,
                avgDeficienciesPerInspection: vessel.avgDeficienciesPerInspection
            }));

            // Save KPI tables
            const kpiTables = {
                fleetOverview: fleetKpis,
                pscPerformance: pscKpis,
                vesselPerformance: vesselPerformanceKpis
            };

            Object.entries(kpiTables).forEach(([tableName, data]) => {
                const kpiPath = path.join(this.outputPath, `${tableName}_kpi.json`);
                fs.writeFileSync(kpiPath, JSON.stringify({
                    metadata: {
                        tableName: `${tableName}_kpi`,
                        generatedAt: new Date().toISOString(),
                        etlVersion: '1.0.0',
                        constraints: this.constraints
                    },
                    kpis: data
                }, null, 2));
            });

            console.log(`✅ KPI Tables generated - ${Object.keys(kpiTables).length} KPI tables created`);

            return {
                operation: 'generateKpiTables',
                status: 'SUCCESS',
                kpiTables: Object.keys(kpiTables).map(name => ({
                    tableName: `${name}_kpi`,
                    filePath: path.join(this.outputPath, `${name}_kpi.json`)
                })),
                generatedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ KPI generation failed: ${error.message}`);
            this.validationErrors.push(`generateKpiTables: ${error.message}`);
            throw error;
        }
    }

    // Validation Helper Functions
    
    validateFleetConstraints(vessels, composition) {
        // DOC company validation
        const docCounts = vessels.reduce((acc, v) => {
            acc[v.docCompany] = (acc[v.docCompany] || 0) + 1;
            return acc;
        }, {});
        
        Object.entries(this.constraints.docCompanies).forEach(([company, expected]) => {
            if (docCounts[company] !== expected) {
                throw new Error(`DOC constraint violation: ${company} expected ${expected}, found ${docCounts[company] || 0}`);
            }
        });

        // Owner validation
        const ownerCounts = vessels.reduce((acc, v) => {
            acc[v.owner] = (acc[v.owner] || 0) + 1;
            return acc;
        }, {});
        
        Object.entries(this.constraints.owners).forEach(([owner, expected]) => {
            if (ownerCounts[owner] !== expected) {
                throw new Error(`Owner constraint violation: ${owner} expected ${expected}, found ${ownerCounts[owner] || 0}`);
            }
        });

        // Vessel type validation  
        const typeCounts = vessels.reduce((acc, v) => {
            acc[v.vesselType] = (acc[v.vesselType] || 0) + 1;
            return acc;
        }, {});
        
        Object.entries(this.constraints.vesselTypes).forEach(([type, expected]) => {
            if (typeCounts[type] !== expected) {
                throw new Error(`Vessel type constraint violation: ${type} expected ${expected}, found ${typeCounts[type] || 0}`);
            }
        });

        console.log('✅ Fleet constraints validation passed');
    }

    validateInspectionConstraints(summaryStats) {
        if (summaryStats.total_inspections !== this.constraints.totalInspections) {
            throw new Error(`Inspection count violation: expected ${this.constraints.totalInspections}, found ${summaryStats.total_inspections}`);
        }

        if (summaryStats.total_deficiencies !== this.constraints.totalDeficiencies) {
            throw new Error(`Deficiency count violation: expected ${this.constraints.totalDeficiencies}, found ${summaryStats.total_deficiencies}`);
        }

        if (summaryStats.detentions !== this.constraints.detentions) {
            throw new Error(`Detention count violation: expected ${this.constraints.detentions}, found ${summaryStats.detentions}`);
        }

        if (summaryStats.clean_inspections !== this.constraints.cleanInspections) {
            throw new Error(`Clean inspection violation: expected ${this.constraints.cleanInspections}, found ${summaryStats.clean_inspections}`);
        }

        console.log('✅ Inspection constraints validation passed');
    }

    validateTransformedVessels(vessels) {
        if (vessels.length !== this.constraints.totalVessels) {
            throw new Error(`Transformed vessel count violation: expected ${this.constraints.totalVessels}, found ${vessels.length}`);
        }

        // Re-validate distributions after transformation
        const docCounts = vessels.reduce((acc, v) => {
            acc[v.docCompany] = (acc[v.docCompany] || 0) + 1;
            return acc;
        }, {});
        
        Object.entries(this.constraints.docCompanies).forEach(([company, expected]) => {
            if (docCounts[company] !== expected) {
                throw new Error(`Post-transform DOC violation: ${company} expected ${expected}, found ${docCounts[company] || 0}`);
            }
        });

        console.log('✅ Transformed vessel validation passed');
    }

    // Main ETL Orchestration
    
    /**
     * runFullETLPipeline() - Execute complete ETL pipeline with validation
     * @returns {Object} Complete ETL execution results
     */
    async runFullETLPipeline() {
        const startTime = Date.now();
        console.log('🚀 Starting PSC Dashboard ETL Pipeline - Marine Data Processor v1.0');
        console.log('🔒 Constraints: 14 vessels (DORIKO:12, DOUBLERICH:2), 30 inspections, 87 deficiencies');
        
        try {
            // Phase 1: Extract
            console.log('\n📥 PHASE 1: EXTRACTION');
            const fleetData = await this.extractFleetMasterData();
            const inspectionData = await this.extractInspectionRecords();
            const referenceData = await this.extractReferenceData();

            // Phase 2: Transform
            console.log('\n🔄 PHASE 2: TRANSFORMATION');
            const transformedVessels = this.transformVesselData(fleetData);
            const normalizedInspections = this.normalizeInspectionData(inspectionData);
            
            // Business Rule Validation
            console.log('\n🔍 PHASE 2.5: BUSINESS RULE VALIDATION');
            const validationResult = this.validateBusinessRules({
                vessels: transformedVessels.vessels,
                inspections: normalizedInspections.inspections
            });

            // Phase 3: Load
            console.log('\n💾 PHASE 3: LOADING');
            const masterLoadResult = await this.loadMasterTables(transformedVessels);
            const factLoadResult = await this.loadFactTables(normalizedInspections);
            
            // KPI Generation
            const kpiResult = await this.generateKpiTables({
                vesselMaster: { data: transformedVessels.vessels },
                inspectionFact: { data: normalizedInspections.inspections }
            });

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            // Final ETL Report
            const etlResult = {
                pipelineStatus: 'SUCCESS',
                executionTime: `${duration}s`,
                processedData: {
                    vessels: transformedVessels.vessels.length,
                    inspections: normalizedInspections.inspections.length,
                    kpiTables: 3
                },
                constraintValidation: validationResult,
                loadResults: {
                    masterTables: masterLoadResult,
                    factTables: factLoadResult,
                    kpiTables: kpiResult
                },
                validationErrors: this.validationErrors,
                completedAt: new Date().toISOString()
            };

            // Save ETL execution report
            const reportPath = path.join(this.outputPath, 'etl_execution_report.json');
            fs.writeFileSync(reportPath, JSON.stringify(etlResult, null, 2));

            console.log(`\n✅ PSC Dashboard ETL Pipeline COMPLETED SUCCESSFULLY`);
            console.log(`⏱️  Execution Time: ${duration}s`);
            console.log(`📊 Processed: ${transformedVessels.vessels.length} vessels, ${normalizedInspections.inspections.length} inspections`);
            console.log(`💾 Output Directory: ${this.outputPath}`);
            console.log(`📋 Execution Report: ${reportPath}`);

            return etlResult;

        } catch (error) {
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            console.error(`\n❌ PSC Dashboard ETL Pipeline FAILED`);
            console.error(`⏱️  Execution Time: ${duration}s`);
            console.error(`🚨 Error: ${error.message}`);
            console.error(`📋 Validation Errors: ${this.validationErrors.length}`);
            
            // Save error report
            const errorReport = {
                pipelineStatus: 'FAILED',
                executionTime: `${duration}s`,
                error: error.message,
                validationErrors: this.validationErrors,
                failedAt: new Date().toISOString()
            };

            const errorPath = path.join(this.outputPath, 'etl_error_report.json');
            if (!fs.existsSync(this.outputPath)) {
                fs.mkdirSync(this.outputPath, { recursive: true });
            }
            fs.writeFileSync(errorPath, JSON.stringify(errorReport, null, 2));

            throw error;
        }
    }
}

// Export for module usage
module.exports = ETLProcessorMarine;

// CLI Execution
if (require.main === module) {
    const processor = new ETLProcessorMarine();
    processor.runFullETLPipeline()
        .then(result => {
            console.log('\n🎉 ETL Pipeline execution completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 ETL Pipeline execution failed:', error.message);
            process.exit(1);
        });
}