/**
 * PSC Dashboard - System Configuration & Deployment
 * SystemIntegrator_PSC Configuration Management
 * Version: 1.0.0 - Production Ready
 */

const PSC_SYSTEM_CONFIG = {
    // System Information
    system: {
        name: 'PSC Fleet Management Dashboard',
        version: '1.0.0',
        buildDate: '2025-08-26',
        environment: 'production',
        author: 'SystemIntegrator_PSC',
        description: 'Integrated PSC inspection management system with 7 specialized modules'
    },
    
    // Performance Targets
    performance: {
        loadTime: {
            initial: 3000,      // 3 seconds max initial load
            subsequent: 500,    // 500ms max subsequent interactions
            api: 200           // 200ms max API response time
        },
        
        coreWebVitals: {
            lcp: 2500,         // Largest Contentful Paint
            fid: 100,          // First Input Delay
            cls: 0.1           // Cumulative Layout Shift
        },
        
        caching: {
            hitRateTarget: 80,  // 80% cache hit rate
            memoryLimit: 100,   // 100MB memory cache limit
            ttl: {
                static: 604800,    // 7 days for static assets
                dynamic: 300,      // 5 minutes for dynamic data
                api: 180          // 3 minutes for API responses
            }
        }
    },
    
    // Module Configuration
    modules: {
        dataArchitect: {
            enabled: true,
            priority: 1,
            config: {
                schemaValidation: true,
                dataIntegrity: true,
                fleetSize: 14,
                inspectionTarget: 30
            }
        },
        
        etlProcessor: {
            enabled: true,
            priority: 2,
            config: {
                batchSize: 100,
                processingInterval: 60000,  // 1 minute
                qualityThreshold: 95,
                dataRetention: 90          // 90 days
            }
        },
        
        uiArchitect: {
            enabled: true,
            priority: 3,
            config: {
                theme: 'tabler',
                responsiveBreakpoints: {
                    mobile: 768,
                    tablet: 1024,
                    desktop: 1280
                },
                animationDuration: 300,
                accessibility: true
            }
        },
        
        chartSpecialist: {
            enabled: true,
            priority: 4,
            config: {
                chartLibrary: 'apexcharts',
                defaultAnimations: true,
                colorScheme: {
                    primary: '#6366f1',
                    secondary: '#f43f5e',
                    success: '#10b981',
                    warning: '#f59e0b',
                    danger: '#ef4444'
                },
                performanceMode: 'optimized'
            }
        },
        
        inspectionAnalyst: {
            enabled: true,
            priority: 5,
            config: {
                mouRegions: ['Paris MoU', 'Tokyo MoU', 'USCG'],
                complianceThreshold: 80,
                riskCategories: ['critical', 'major', 'minor'],
                analysisInterval: 300000    // 5 minutes
            }
        },
        
        riskCalculator: {
            enabled: true,
            priority: 6,
            config: {
                algorithmVersion: '2.1',
                factors: {
                    inspectionHistory: 0.3,
                    deficiencyCount: 0.25,
                    vesselAge: 0.2,
                    flagState: 0.15,
                    vesselType: 0.1
                },
                recalculationInterval: 600000  // 10 minutes
            }
        },
        
        geoMapper: {
            enabled: true,
            priority: 7,
            config: {
                mapProvider: 'leaflet',
                defaultZoom: 6,
                clusterRadius: 50,
                heatmapEnabled: true,
                performanceMode: true
            }
        }
    },
    
    // API Configuration
    api: {
        baseURL: '/api/v1',
        timeout: 10000,           // 10 seconds
        retries: 3,
        authentication: {
            type: 'bearer',
            tokenExpiry: 3600000,    // 1 hour
            refreshThreshold: 300000  // 5 minutes before expiry
        },
        rateLimit: {
            requests: 100,
            windowMs: 60000,         // 1 minute
            skipSuccessfulRequests: true
        },
        compression: true,
        cache: {
            enabled: true,
            defaultTTL: 300000      // 5 minutes
        }
    },
    
    // Database Configuration (for backend deployment)
    database: {
        type: 'postgresql',
        connection: {
            host: 'localhost',
            port: 5432,
            database: 'psc_dashboard',
            ssl: process.env.NODE_ENV === 'production'
        },
        pool: {
            min: 5,
            max: 20,
            acquireTimeoutMillis: 60000,
            createTimeoutMillis: 30000
        },
        backup: {
            enabled: true,
            interval: '0 2 * * *',   // Daily at 2 AM
            retention: 30            // 30 days
        }
    },
    
    // Security Configuration
    security: {
        cors: {
            origin: ['http://localhost:3000', 'https://psc-dashboard.com'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        },
        
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        },
        
        encryption: {
            algorithm: 'aes-256-gcm',
            keyLength: 32,
            saltLength: 16
        }
    },
    
    // Monitoring Configuration
    monitoring: {
        enabled: true,
        healthCheck: {
            interval: 30000,        // 30 seconds
            timeout: 5000,         // 5 seconds
            endpoints: ['/health', '/api/health']
        },
        
        metrics: {
            performance: true,
            errors: true,
            usage: true,
            customEvents: true
        },
        
        alerting: {
            enabled: true,
            thresholds: {
                errorRate: 0.05,      // 5% error rate
                responseTime: 1000,   // 1 second
                memoryUsage: 0.9,     // 90% memory usage
                diskUsage: 0.85       // 85% disk usage
            }
        },
        
        logging: {
            level: 'info',
            format: 'json',
            rotation: {
                maxFiles: 5,
                maxSize: '10m'
            }
        }
    },
    
    // Deployment Configuration
    deployment: {
        strategy: 'blue-green',
        
        environments: {
            development: {
                debug: true,
                hotReload: true,
                sourceMap: true,
                minification: false
            },
            
            staging: {
                debug: false,
                hotReload: false,
                sourceMap: true,
                minification: true,
                ssl: false
            },
            
            production: {
                debug: false,
                hotReload: false,
                sourceMap: false,
                minification: true,
                ssl: true,
                compression: true,
                cdn: 'https://cdn.psc-dashboard.com'
            }
        },
        
        docker: {
            image: 'psc-dashboard:latest',
            ports: {
                http: 3000,
                https: 3443
            },
            volumes: [
                './data:/app/data',
                './logs:/app/logs'
            ],
            environment: [
                'NODE_ENV=production',
                'PORT=3000'
            ]
        },
        
        kubernetes: {
            namespace: 'psc-dashboard',
            replicas: 3,
            resources: {
                requests: {
                    cpu: '100m',
                    memory: '256Mi'
                },
                limits: {
                    cpu: '500m',
                    memory: '512Mi'
                }
            },
            ingress: {
                enabled: true,
                annotations: {
                    'kubernetes.io/ingress.class': 'nginx',
                    'cert-manager.io/cluster-issuer': 'letsencrypt-prod'
                }
            }
        }
    },
    
    // Feature Flags
    features: {
        advancedAnalytics: true,
        exportFunctionality: true,
        realTimeUpdates: true,
        multiLanguage: false,
        darkMode: true,
        offlineMode: false,
        pushNotifications: false
    },
    
    // Integration Configuration
    integrations: {
        externalAPIs: {
            unlocode: {
                enabled: true,
                baseURL: 'https://unece.org/cefact/locode',
                timeout: 5000
            },
            
            mouRegistry: {
                enabled: true,
                baseURL: 'https://mou-registry.org/api',
                timeout: 5000
            }
        },
        
        dataExport: {
            formats: ['json', 'csv', 'excel', 'pdf'],
            maxRecords: 10000,
            compression: true
        },
        
        notifications: {
            email: false,
            webhook: false,
            slack: false
        }
    },
    
    // Localization
    i18n: {
        defaultLanguage: 'en',
        supportedLanguages: ['en'],
        fallbackLanguage: 'en',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        timezone: 'UTC'
    }
};

// Environment-specific configuration override
const getEnvironmentConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    const envConfig = PSC_SYSTEM_CONFIG.deployment.environments[env] || {};
    
    return {
        ...PSC_SYSTEM_CONFIG,
        environment: env,
        ...envConfig
    };
};

// Configuration validation
const validateConfig = (config) => {
    const required = [
        'system.name',
        'system.version',
        'modules.dataArchitect.enabled',
        'api.baseURL'
    ];
    
    const missing = required.filter(path => {
        const value = path.split('.').reduce((obj, key) => obj?.[key], config);
        return value === undefined || value === null;
    });
    
    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
    
    return true;
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        config: PSC_SYSTEM_CONFIG,
        getEnvironmentConfig,
        validateConfig
    };
} else {
    // Browser environment
    window.PSC_CONFIG = PSC_SYSTEM_CONFIG;
    window.getEnvironmentConfig = getEnvironmentConfig;
    window.validateConfig = validateConfig;
}

console.log('⚙️ PSC Dashboard System Configuration loaded successfully');