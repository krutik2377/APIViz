"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
class ConfigManager {
    constructor() {
        this.config = this.loadDefaultConfig();
        this.loadFromEnvironment();
    }
    loadDefaultConfig() {
        return {
            port: 3001,
            maxDataPoints: 10000,
            enableCors: true,
            enableCompression: true,
            logLevel: 'info',
            samplingRate: 1.0,
            minLatencyThreshold: 10
        };
    }
    loadFromEnvironment() {
        if (process.env.APIVIZ_PORT) {
            this.config.port = parseInt(process.env.APIVIZ_PORT, 10);
        }
        if (process.env.APIVIZ_MAX_DATA_POINTS) {
            this.config.maxDataPoints = parseInt(process.env.APIVIZ_MAX_DATA_POINTS, 10);
        }
        if (process.env.APIVIZ_ENABLE_CORS !== undefined) {
            this.config.enableCors = process.env.APIVIZ_ENABLE_CORS === 'true';
        }
        if (process.env.APIVIZ_ENABLE_COMPRESSION !== undefined) {
            this.config.enableCompression = process.env.APIVIZ_ENABLE_COMPRESSION === 'true';
        }
        if (process.env.APIVIZ_LOG_LEVEL) {
            this.config.logLevel = process.env.APIVIZ_LOG_LEVEL;
        }
        if (process.env.APIVIZ_SAMPLING_RATE) {
            this.config.samplingRate = parseFloat(process.env.APIVIZ_SAMPLING_RATE);
        }
        if (process.env.APIVIZ_MIN_LATENCY_THRESHOLD) {
            this.config.minLatencyThreshold = parseInt(process.env.APIVIZ_MIN_LATENCY_THRESHOLD, 10);
        }
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
    }
    getPort() {
        return this.config.port;
    }
    getMaxDataPoints() {
        return this.config.maxDataPoints;
    }
    isCorsEnabled() {
        return this.config.enableCors;
    }
    isCompressionEnabled() {
        return this.config.enableCompression;
    }
    getLogLevel() {
        return this.config.logLevel;
    }
    getSamplingRate() {
        return this.config.samplingRate;
    }
    getMinLatencyThreshold() {
        return this.config.minLatencyThreshold;
    }
    validateConfig() {
        const errors = [];
        if (this.config.port < 1024 || this.config.port > 65535) {
            errors.push('Port must be between 1024 and 65535');
        }
        if (this.config.maxDataPoints < 100) {
            errors.push('Max data points must be at least 100');
        }
        if (this.config.samplingRate < 0.1 || this.config.samplingRate > 1.0) {
            errors.push('Sampling rate must be between 0.1 and 1.0');
        }
        if (this.config.minLatencyThreshold < 0) {
            errors.push('Minimum latency threshold must be non-negative');
        }
        const validLogLevels = ['debug', 'info', 'warn', 'error'];
        if (!validLogLevels.includes(this.config.logLevel)) {
            errors.push(`Log level must be one of: ${validLogLevels.join(', ')}`);
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map