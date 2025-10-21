"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instrumentHttp = exports.createExpressMiddleware = exports.NodeInstrumentation = void 0;
class NodeInstrumentation {
    constructor(options = {}) {
        this.options = {
            agentUrl: options.agentUrl || 'http://localhost:3001',
            samplingRate: options.samplingRate || 1.0,
            minLatencyThreshold: options.minLatencyThreshold || 10,
            endpointFilters: options.endpointFilters || ['/api/*'],
            enableLogging: options.enableLogging || false
        };
        this.agentUrl = this.options.agentUrl;
    }
    instrumentHttp() {
        this.instrumentNodeHttp();
        this.instrumentExpress();
    }
    instrumentNodeHttp() {
        const http = require('http');
        const https = require('https');
        this.instrumentHttpModule(http);
        this.instrumentHttpModule(https);
    }
    instrumentHttpModule(httpModule) {
        const originalRequest = httpModule.request;
        const originalGet = httpModule.get;
        httpModule.request = (options, callback) => {
            return this.wrapRequest(originalRequest, options, callback);
        };
        httpModule.get = (options, callback) => {
            return this.wrapRequest(originalGet, options, callback);
        };
    }
    instrumentExpress() {
        // This would be implemented if Express is detected
        // For now, we'll focus on the core HTTP instrumentation
    }
    wrapRequest(originalMethod, options, callback) {
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        // Extract URL and method
        const url = typeof options === 'string' ? options : options.href || `${options.protocol || 'http:'}//${options.hostname || options.host}${options.path || '/'}`;
        const method = options.method || 'GET';
        // Check if we should instrument this request
        if (!this.shouldInstrument(url)) {
            return originalMethod.call(this, options, callback);
        }
        const req = originalMethod.call(this, options, (res) => {
            const endTime = Date.now();
            const latency = endTime - startTime;
            // Process the response
            this.processResponse(requestId, url, method, latency, res, startTime);
            if (callback) {
                callback(res);
            }
        });
        // Handle request errors
        req.on('error', (error) => {
            const endTime = Date.now();
            const latency = endTime - startTime;
            this.processError(requestId, url, method, latency, error, startTime);
        });
        return req;
    }
    shouldInstrument(url) {
        // Apply sampling rate
        if (Math.random() > this.options.samplingRate) {
            return false;
        }
        // Apply endpoint filters
        if (this.options.endpointFilters.length > 0) {
            return this.options.endpointFilters.some(filter => {
                const regexPattern = filter.replace(/\*/g, '.*').replace(/\?/g, '.');
                const regex = new RegExp(`^${regexPattern}$`);
                return regex.test(url);
            });
        }
        return true;
    }
    processResponse(requestId, url, method, latency, response, timestamp) {
        if (latency < this.options.minLatencyThreshold) {
            return;
        }
        const apiCall = {
            id: requestId,
            url: url,
            method: method,
            latency: latency,
            timestamp: timestamp,
            statusCode: response.statusCode,
            endpoint: this.extractEndpoint(url),
            duration: latency
        };
        this.sendToAgent(apiCall);
    }
    processError(requestId, url, method, latency, error, timestamp) {
        if (latency < this.options.minLatencyThreshold) {
            return;
        }
        const apiCall = {
            id: requestId,
            url: url,
            method: method,
            latency: latency,
            timestamp: timestamp,
            statusCode: 0,
            error: error.message,
            endpoint: this.extractEndpoint(url),
            duration: latency
        };
        this.sendToAgent(apiCall);
    }
    extractEndpoint(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname;
        }
        catch {
            // If URL parsing fails, try to extract path from string
            const match = url.match(/\/[^?#]*/);
            return match ? match[0] : url;
        }
    }
    async sendToAgent(apiCall) {
        try {
            const fetch = require('node-fetch');
            await fetch(`${this.agentUrl}/api/calls`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiCall)
            });
        }
        catch (error) {
            if (this.options.enableLogging) {
                console.warn('Failed to send API call data to agent:', error);
            }
        }
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.NodeInstrumentation = NodeInstrumentation;
// Express middleware
function createExpressMiddleware(options = {}) {
    const instrumentation = new NodeInstrumentation(options);
    return (req, res, next) => {
        const startTime = Date.now();
        const requestId = instrumentation['generateRequestId']();
        // Override res.end to capture response
        const originalEnd = res.end;
        res.end = function (chunk, encoding, cb) {
            const endTime = Date.now();
            const latency = endTime - startTime;
            // Process the response
            instrumentation['processResponse'](requestId, req.url, req.method, latency, res, startTime);
            return originalEnd.call(this, chunk, encoding, cb);
        };
        next();
    };
}
exports.createExpressMiddleware = createExpressMiddleware;
// Auto-instrumentation function
function instrumentHttp(options = {}) {
    const instrumentation = new NodeInstrumentation(options);
    instrumentation.instrumentHttp();
    if (options.enableLogging) {
        console.log('APIViz HTTP instrumentation enabled');
    }
}
exports.instrumentHttp = instrumentHttp;
// Export for easy use
exports.default = { instrumentHttp, createExpressMiddleware, NodeInstrumentation };
//# sourceMappingURL=index.js.map