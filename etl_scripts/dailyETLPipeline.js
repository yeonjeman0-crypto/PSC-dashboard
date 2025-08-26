/**
 * ETLProcessor_Marine - Daily ETL Pipeline Orchestrator
 * Coordinates full ETL pipeline execution with comprehensive error recovery
 * 
 * @author ETLProcessor_Marine v1.0
 * @date 2025-08-25
 */

const fs = require('fs').promises;
const path = require('path');
const { FleetMasterExtractor } = require('./extractFleetMasterData');
const { InspectionDataTransformer } = require('./transformInspectionData');
const { MasterTablesLoader } = require('./loadToMasterTables');

class DailyETLPipeline {
    constructor(config = {}) {
        this.config = {
            inputPath: config.inputPath || '../Raw Data from User/',
            outputPath: config.outputPath || '../processed_data/',
            logPath: config.logPath || '../logs/',
            logLevel: config.logLevel || 'INFO',
            enableNotifications: config.enableNotifications !== false,
            rollbackOnError: config.rollbackOnError !== false,
            maxRetries: config.maxRetries || 3,
            retryDelayMs: config.retryDelayMs || 5000
        };

        this.pipelineStats = {
            pipelineStartTime: null,
            pipelineEndTime: null,
            totalProcessingTime: 0,
            stagesCompleted: 0,
            stagesFailed: 0,
            totalRetries: 0,
            extractionStats: null,
            transformationStats: null,
            loadingStats: null,
            validationResults: null
        };

        this.stageResults = {
            extraction: null,
            transformation: null,
            loading: null,
            validation: null
        };
    }

    /**
     * Main daily ETL pipeline execution
     */
    async executeDailyETLPipeline() {
        try {
            this.pipelineStats.pipelineStartTime = new Date();
            await this.initializePipeline();

            this.logInfo('=== DAILY ETL PIPELINE STARTED ===');
            this.logInfo(`Processing marine data for ${new Date().toISOString().split('T')[0]}`);

            // Stage 1: Extract Fleet Master Data
            await this.executeWithRetry('extraction', 'Fleet Master Data Extraction', async () => {
                const extractor = new FleetMasterExtractor({
                    inputPath: this.config.inputPath,
                    outputPath: this.config.outputPath,
                    logLevel: this.config.logLevel
                });
                
                this.stageResults.extraction = await extractor.extractFleetMasterData();
                this.pipelineStats.extractionStats = this.stageResults.extraction;
                return this.stageResults.extraction;
            });

            // Stage 2: Transform Inspection Data
            await this.executeWithRetry('transformation', 'Inspection Data Transformation', async () => {
                const transformer = new InspectionDataTransformer({
                    inputPath: this.config.inputPath,
                    outputPath: this.config.outputPath,
                    logLevel: this.config.logLevel
                });
                
                this.stageResults.transformation = await transformer.transformInspectionData();
                this.pipelineStats.transformationStats = this.stageResults.transformation;
                return this.stageResults.transformation;
            });

            // Stage 3: Load to Master Tables and Generate KPIs
            await this.executeWithRetry('loading', 'Master Tables Loading & KPI Generation', async () => {
                const loader = new MasterTablesLoader({
                    inputPath: this.config.outputPath,
                    outputPath: path.join(this.config.outputPath, 'analytics'),
                    logLevel: this.config.logLevel
                });
                
                this.stageResults.loading = await loader.loadToMasterTables();
                this.pipelineStats.loadingStats = this.stageResults.loading;
                return this.stageResults.loading;
            });

            // Stage 4: Validate Complete Pipeline
            await this.executeWithRetry('validation', 'Pipeline Data Validation', async () => {
                this.stageResults.validation = await this.validateCompletePipeline();
                this.pipelineStats.validationResults = this.stageResults.validation;
                return this.stageResults.validation;
            });

            // Finalize pipeline
            await this.finalizePipeline();

            this.logInfo('=== DAILY ETL PIPELINE COMPLETED SUCCESSFULLY ===');
            return this.getPipelineSummary();

        } catch (error) {
            await this.handlePipelineFailure(error);
            throw new ETLPipelineError(`Daily ETL pipeline failed: ${error.message}`);
        }
    }

    /**
     * Initialize pipeline with pre-execution checks
     */
    async initializePipeline() {
        try {
            // Create necessary directories
            await this.ensureDirectoryExists(this.config.outputPath);
            await this.ensureDirectoryExists(this.config.logPath);
            await this.ensureDirectoryExists(path.join(this.config.outputPath, 'core_master'));
            await this.ensureDirectoryExists(path.join(this.config.outputPath, 'operational'));
            await this.ensureDirectoryExists(path.join(this.config.outputPath, 'reference'));
            await this.ensureDirectoryExists(path.join(this.config.outputPath, 'analytics'));
            await this.ensureDirectoryExists(path.join(this.config.outputPath, 'quality'));

            // Validate input files exist
            await this.validateInputFiles();

            // Initialize logging
            await this.initializeLogging();

            this.logInfo('Pipeline initialization completed successfully');

        } catch (error) {
            throw new Error(`Pipeline initialization failed: ${error.message}`);
        }
    }

    /**
     * Validate required input files exist
     */
    async validateInputFiles() {
        const requiredFiles = [
            '01-fleet-master.json',
            '02-inspection-records.json',
            '03-mou-registry.json',
            '04-action-codes.json',
            '05-deficiency-codes.json',
            '06-unlocode-registry.json'
        ];

        for (const fileName of requiredFiles) {
            const filePath = path.join(this.config.inputPath, fileName);
            try {
                await fs.access(filePath);
                this.logInfo(`Validated input file: ${fileName}`);
            } catch (error) {
                throw new Error(`Required input file missing: ${fileName}`);
            }
        }
    }

    /**
     * Initialize comprehensive logging system
     */
    async initializeLogging() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.logFileName = `daily-etl-${timestamp}.log`;
        this.logFilePath = path.join(this.config.logPath, this.logFileName);
        
        // Create initial log entry
        const logHeader = `
===========================================
ETLProcessor_Marine Daily Pipeline Log
Started: ${new Date().toISOString()}
Configuration: ${JSON.stringify(this.config, null, 2)}
===========================================
`;
        
        await fs.writeFile(this.logFilePath, logHeader);
    }

    /**
     * Execute stage with retry logic and error recovery
     */
    async executeWithRetry(stageName, stageDescription, stageFunction) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                this.logInfo(`Starting ${stageDescription} (Attempt ${attempt}/${this.config.maxRetries})`);
                
                const stageStartTime = new Date();
                const result = await stageFunction();
                const stageEndTime = new Date();
                const stageDuration = stageEndTime - stageStartTime;

                this.logInfo(`${stageDescription} completed successfully in ${stageDuration}ms`);
                this.pipelineStats.stagesCompleted++;
                
                return result;

            } catch (error) {
                lastError = error;
                this.pipelineStats.totalRetries++;
                
                this.logError(`STAGE_FAILED`, error);
                this.logError(`${stageDescription} failed (Attempt ${attempt}/${this.config.maxRetries}): ${error.message}`);

                if (attempt < this.config.maxRetries) {
                    this.logInfo(`Retrying ${stageDescription} in ${this.config.retryDelayMs}ms...`);
                    await this.delay(this.config.retryDelayMs);
                } else {
                    this.pipelineStats.stagesFailed++;
                    
                    if (this.config.rollbackOnError) {
                        await this.rollbackStage(stageName);
                    }
                    
                    throw new ETLStageError(`${stageDescription} failed after ${this.config.maxRetries} attempts: ${error.message}`);
                }
            }
        }
    }

    /**
     * Validate complete pipeline data consistency
     */
    async validateCompletePipeline() {
        try {
            this.logInfo('Starting comprehensive pipeline validation...');

            const validationResults = {
                validation_timestamp: new Date().toISOString(),
                data_consistency_checks: [],
                referential_integrity_checks: [],
                business_rule_validations: [],
                data_quality_metrics: {},
                overall_status: 'UNKNOWN',
                critical_issues: 0,
                warnings: 0,
                recommendations: []
            };

            // Validate vessel count consistency
            await this.validateVesselCountConsistency(validationResults);

            // Validate inspection data integrity
            await this.validateInspectionDataIntegrity(validationResults);

            // Validate KPI calculation accuracy
            await this.validateKPICalculations(validationResults);

            // Calculate overall validation status
            validationResults.overall_status = this.calculateValidationStatus(validationResults);

            this.logInfo(`Pipeline validation completed. Status: ${validationResults.overall_status}`);
            
            // Write validation report
            await this.writeValidationReport(validationResults);
            
            return validationResults;

        } catch (error) {
            throw new Error(`Pipeline validation failed: ${error.message}`);
        }
    }

    /**
     * Validate vessel count consistency across all stages
     */
    async validateVesselCountConsistency(validationResults) {
        try {
            // Read vessel counts from each stage
            const vesselMasterData = await this.readJsonFile('core_master/vessel_master.json');
            const inspectionData = await this.readJsonFile('operational/inspection_records.json');
            const analyticsData = await this.readJsonFile('analytics/inspection_fact.json');

            const vesselMasterCount = vesselMasterData.total_vessels;
            const uniqueInspectedVessels = new Set(inspectionData.inspections.map(i => i.vessel_name)).size;
            const analyticsFleetCount = analyticsData.fleet_kpis.total_vessels;

            const check = {
                check_name: 'vessel_count_consistency',
                status: 'PASSED',
                details: {
                    vessel_master_count: vesselMasterCount,
                    unique_inspected_vessels: uniqueInspectedVessels,
                    analytics_fleet_count: analyticsFleetCount
                },
                issues: []
            };

            if (vesselMasterCount !== analyticsFleetCount) {
                check.status = 'FAILED';
                check.issues.push(`Vessel count mismatch: master=${vesselMasterCount}, analytics=${analyticsFleetCount}`);
                validationResults.critical_issues++;
            }

            validationResults.data_consistency_checks.push(check);

        } catch (error) {
            validationResults.critical_issues++;
            validationResults.data_consistency_checks.push({
                check_name: 'vessel_count_consistency',
                status: 'ERROR',
                error: error.message
            });
        }
    }

    /**
     * Validate inspection data integrity
     */
    async validateInspectionDataIntegrity(validationResults) {
        try {
            const inspectionData = await this.readJsonFile('operational/inspection_records.json');
            
            let integrityIssues = 0;
            
            inspectionData.inspections.forEach(inspection => {
                // Check for required fields
                if (!inspection.vessel_name || !inspection.inspection_date || inspection.deficiency_count === undefined) {
                    integrityIssues++;
                }
                
                // Check data type consistency
                if (typeof inspection.deficiency_count !== 'number' || inspection.deficiency_count < 0) {
                    integrityIssues++;
                }
                
                // Check business rules
                if (inspection.inspection_outcome === 'Clean' && inspection.deficiency_count > 0) {
                    integrityIssues++;
                }
                
                if (inspection.detention === true && inspection.deficiency_count === 0) {
                    integrityIssues++;
                }
            });

            const check = {
                check_name: 'inspection_data_integrity',
                status: integrityIssues === 0 ? 'PASSED' : 'FAILED',
                total_inspections_checked: inspectionData.inspections.length,
                integrity_violations: integrityIssues
            };

            if (integrityIssues > 0) {
                validationResults.critical_issues += integrityIssues;
            }

            validationResults.referential_integrity_checks.push(check);

        } catch (error) {
            validationResults.critical_issues++;
            validationResults.referential_integrity_checks.push({
                check_name: 'inspection_data_integrity',
                status: 'ERROR',
                error: error.message
            });
        }
    }

    /**
     * Validate KPI calculation accuracy
     */
    async validateKPICalculations(validationResults) {
        try {
            const inspectionData = await this.readJsonFile('operational/inspection_records.json');
            const analyticsData = await this.readJsonFile('analytics/inspection_fact.json');

            // Manually calculate key metrics and compare
            const manualCalcs = {
                total_inspections: inspectionData.inspections.length,
                total_deficiencies: inspectionData.inspections.reduce((sum, i) => sum + i.deficiency_count, 0),
                detentions: inspectionData.inspections.filter(i => i.detention === true).length,
                clean_inspections: inspectionData.inspections.filter(i => i.inspection_outcome === 'Clean').length
            };

            const analyticsCalcs = {
                total_inspections: analyticsData.fleet_kpis.total_inspections,
                total_deficiencies: analyticsData.compliance_kpis.total_deficiencies,
                detentions: analyticsData.compliance_kpis.detentions,
                clean_inspections: analyticsData.compliance_kpis.clean_inspections
            };

            const check = {
                check_name: 'kpi_calculation_accuracy',
                status: 'PASSED',
                manual_calculations: manualCalcs,
                analytics_calculations: analyticsCalcs,
                discrepancies: []
            };

            // Check each calculation
            Object.keys(manualCalcs).forEach(key => {
                if (manualCalcs[key] !== analyticsCalcs[key]) {
                    check.status = 'FAILED';
                    check.discrepancies.push({
                        metric: key,
                        expected: manualCalcs[key],
                        actual: analyticsCalcs[key]
                    });
                    validationResults.critical_issues++;
                }
            });

            validationResults.business_rule_validations.push(check);

        } catch (error) {
            validationResults.critical_issues++;
            validationResults.business_rule_validations.push({
                check_name: 'kpi_calculation_accuracy',
                status: 'ERROR',
                error: error.message
            });
        }
    }

    /**
     * Calculate overall validation status
     */
    calculateValidationStatus(validationResults) {
        if (validationResults.critical_issues > 0) {
            return 'FAILED';
        }
        
        if (validationResults.warnings > 5) {
            return 'WARNING';
        }
        
        return 'PASSED';
    }

    /**
     * Write comprehensive validation report
     */
    async writeValidationReport(validationResults) {
        try {
            const reportPath = path.join(this.config.outputPath, 'quality', 'daily_validation_report.json');
            
            const report = {
                ...validationResults,
                pipeline_execution_summary: this.getPipelineSummary(),
                generated_at: new Date().toISOString()
            };

            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            this.logInfo('Validation report written successfully');

        } catch (error) {
            this.logError('VALIDATION_REPORT_FAILED', error);
        }
    }

    /**
     * Rollback stage changes on failure
     */
    async rollbackStage(stageName) {
        try {
            this.logInfo(`Initiating rollback for stage: ${stageName}`);

            switch (stageName) {
                case 'extraction':
                    await this.rollbackExtractionStage();
                    break;
                case 'transformation':
                    await this.rollbackTransformationStage();
                    break;
                case 'loading':
                    await this.rollbackLoadingStage();
                    break;
                default:
                    this.logInfo(`No rollback procedure defined for stage: ${stageName}`);
            }

            this.logInfo(`Rollback completed for stage: ${stageName}`);

        } catch (error) {
            this.logError('ROLLBACK_FAILED', error);
        }
    }

    /**
     * Rollback extraction stage
     */
    async rollbackExtractionStage() {
        const filesToRemove = [
            'core_master/vessel_master.json',
            'core_master/owner_master.json',
            'core_master/doc_company_master.json'
        ];

        for (const file of filesToRemove) {
            try {
                await fs.unlink(path.join(this.config.outputPath, file));
            } catch (error) {
                // File may not exist, continue
            }
        }
    }

    /**
     * Rollback transformation stage
     */
    async rollbackTransformationStage() {
        const filesToRemove = [
            'operational/inspection_records.json',
            'operational/deficiency_records.json'
        ];

        for (const file of filesToRemove) {
            try {
                await fs.unlink(path.join(this.config.outputPath, file));
            } catch (error) {
                // File may not exist, continue
            }
        }
    }

    /**
     * Rollback loading stage
     */
    async rollbackLoadingStage() {
        const filesToRemove = [
            'analytics/inspection_fact.json'
        ];

        for (const file of filesToRemove) {
            try {
                await fs.unlink(path.join(this.config.outputPath, file));
            } catch (error) {
                // File may not exist, continue
            }
        }
    }

    /**
     * Handle complete pipeline failure
     */
    async handlePipelineFailure(error) {
        try {
            this.pipelineStats.pipelineEndTime = new Date();
            this.pipelineStats.totalProcessingTime = this.pipelineStats.pipelineEndTime - this.pipelineStats.pipelineStartTime;

            this.logError('PIPELINE_FAILED', error);
            
            // Send notifications if enabled
            if (this.config.enableNotifications) {
                await this.notifyAdministrators(error);
            }

            // Write failure report
            await this.writeFailureReport(error);

        } catch (reportError) {
            this.logError('FAILURE_REPORT_FAILED', reportError);
        }
    }

    /**
     * Finalize successful pipeline execution
     */
    async finalizePipeline() {
        try {
            this.pipelineStats.pipelineEndTime = new Date();
            this.pipelineStats.totalProcessingTime = this.pipelineStats.pipelineEndTime - this.pipelineStats.pipelineStartTime;

            // Write success report
            await this.writeSuccessReport();

            // Send notifications if enabled
            if (this.config.enableNotifications) {
                await this.notifySuccess();
            }

            this.logInfo(`Pipeline completed in ${this.pipelineStats.totalProcessingTime}ms`);

        } catch (error) {
            this.logError('FINALIZATION_FAILED', error);
        }
    }

    /**
     * Write success report
     */
    async writeSuccessReport() {
        try {
            const reportPath = path.join(this.config.outputPath, 'quality', 'daily_pipeline_success.json');
            
            const report = {
                pipeline_status: 'SUCCESS',
                execution_summary: this.getPipelineSummary(),
                data_quality_summary: {
                    extraction_quality: this.stageResults.extraction?.data_quality_score || 'N/A',
                    transformation_quality: this.stageResults.transformation?.data_quality_score || 'N/A',
                    loading_quality: this.stageResults.loading?.data_quality_score || 'N/A',
                    validation_status: this.stageResults.validation?.overall_status || 'N/A'
                },
                generated_at: new Date().toISOString()
            };

            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        } catch (error) {
            this.logError('SUCCESS_REPORT_FAILED', error);
        }
    }

    /**
     * Write failure report
     */
    async writeFailureReport(error) {
        try {
            const reportPath = path.join(this.config.outputPath, 'quality', 'daily_pipeline_failure.json');
            
            const report = {
                pipeline_status: 'FAILED',
                execution_summary: this.getPipelineSummary(),
                failure_details: {
                    error_message: error.message,
                    error_stack: error.stack,
                    failed_at: new Date().toISOString()
                },
                generated_at: new Date().toISOString()
            };

            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        } catch (reportError) {
            this.logError('FAILURE_REPORT_WRITE_FAILED', reportError);
        }
    }

    /**
     * Notify administrators of pipeline status
     */
    async notifyAdministrators(error = null) {
        try {
            const status = error ? 'FAILED' : 'SUCCESS';
            const message = error ? 
                `Daily ETL Pipeline FAILED: ${error.message}` :
                `Daily ETL Pipeline completed successfully`;

            // In a real implementation, this would send emails, Slack messages, etc.
            this.logInfo(`NOTIFICATION: ${message}`);

        } catch (notificationError) {
            this.logError('NOTIFICATION_FAILED', notificationError);
        }
    }

    async notifySuccess() {
        await this.notifyAdministrators();
    }

    // Utility methods
    async readJsonFile(relativePath) {
        const filePath = path.join(this.config.outputPath, relativePath);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    }

    async ensureDirectoryExists(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getPipelineSummary() {
        return {
            pipeline_status: this.pipelineStats.stagesFailed > 0 ? 'FAILED' : 'SUCCESS',
            total_processing_time_ms: this.pipelineStats.totalProcessingTime,
            stages_completed: this.pipelineStats.stagesCompleted,
            stages_failed: this.pipelineStats.stagesFailed,
            total_retries: this.pipelineStats.totalRetries,
            stage_results: {
                extraction: this.stageResults.extraction,
                transformation: this.stageResults.transformation,
                loading: this.stageResults.loading,
                validation: this.stageResults.validation
            },
            executed_at: this.pipelineStats.pipelineStartTime?.toISOString(),
            completed_at: this.pipelineStats.pipelineEndTime?.toISOString()
        };
    }

    // Logging methods
    async logInfo(message) {
        const logMessage = `[INFO] [${new Date().toISOString()}] DailyETLPipeline: ${message}`;
        
        if (this.config.logLevel === 'INFO' || this.config.logLevel === 'DEBUG') {
            console.log(logMessage);
        }

        if (this.logFilePath) {
            try {
                await fs.appendFile(this.logFilePath, logMessage + '\n');
            } catch (error) {
                console.error('Failed to write to log file:', error.message);
            }
        }
    }

    async logError(code, error) {
        const logMessage = `[ERROR] [${new Date().toISOString()}] DailyETLPipeline [${code}]: ${error.message}`;
        
        console.error(logMessage);
        if (this.config.logLevel === 'DEBUG') {
            console.error(error.stack);
        }

        if (this.logFilePath) {
            try {
                await fs.appendFile(this.logFilePath, logMessage + '\n');
                if (this.config.logLevel === 'DEBUG') {
                    await fs.appendFile(this.logFilePath, error.stack + '\n');
                }
            } catch (logError) {
                console.error('Failed to write error to log file:', logError.message);
            }
        }
    }
}

// Custom error classes
class ETLPipelineError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ETLPipelineError';
    }
}

class ETLStageError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ETLStageError';
    }
}

module.exports = { DailyETLPipeline, ETLPipelineError, ETLStageError };

// CLI execution
if (require.main === module) {
    const pipeline = new DailyETLPipeline();
    pipeline.executeDailyETLPipeline()
        .then(summary => {
            console.log('=== PIPELINE EXECUTION SUMMARY ===');
            console.log(JSON.stringify(summary, null, 2));
            process.exit(0);
        })
        .catch(error => {
            console.error('=== PIPELINE EXECUTION FAILED ===');
            console.error(error.message);
            process.exit(1);
        });
}