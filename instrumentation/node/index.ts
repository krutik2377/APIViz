import { IncomingMessage, ServerResponse } from 'http';
import { Request, Response, NextFunction } from 'express';

export interface InstrumentationOptions {
    agentUrl?: string;
    samplingRate?: number;
    minLatencyThreshold?: number;
    endpointFilters?: string[];
    enableLogging?: boolean;
}

export class NodeInstrumentation {
    private options: Required<InstrumentationOptions>;
    private agentUrl: string;

    constructor(options: InstrumentationOptions = {}) {
        this.options = {
            agentUrl: options.agentUrl || 'http://localhost:3001',
            samplingRate: options.samplingRate || 1.0,
            minLatencyThreshold: options.minLatencyThreshold || 10,
            endpointFilters: options.endpointFilters || ['/api/*'],
            enableLogging: options.enableLogging || false
        };

        this.agentUrl = this.options.agentUrl;
    }

    instrumentHttp(): void {
        this.instrumentNodeHttp();
        this.instrumentExpress();
    }

    private instrumentNodeHttp(): void {
        const http = require('http');
        const https = require('https');

        this.instrumentHttpModule(http);
        this.instrumentHttpModule(https);
    }

    private instrumentHttpModule(httpModule: any): void {
        const originalRequest = httpModule.request;
        const originalGet = httpModule.get;

        httpModule.request = (options: any, callback?: any) => {
            return this.wrapRequest(originalRequest, options, callback);
        };

        httpModule.get = (options: any, callback?: any) => {
            return this.wrapRequest(originalGet, options, callback);
        };
    }

    private instrumentExpress(): void {
        // This would be implemented if Express is detected
        // For now, we'll focus on the core HTTP instrumentation
    }

    private wrapRequest(originalMethod: Function, options: any, callback?: any): any {
        const startTime = Date.now();
        const requestId = this.generateRequestId();

        // Extract URL and method
        const url = typeof options === 'string' ? options : options.href || `${options.protocol || 'http:'}//${options.hostname || options.host}${options.path || '/'}`;
        const method = options.method || 'GET';

        // Check if we should instrument this request
        if (!this.shouldInstrument(url)) {
            return originalMethod.call(this, options, callback);
        }

        const req = originalMethod.call(this, options, (res: any) => {
            const endTime = Date.now();
            const latency = endTime - startTime;

            // Process the response
            this.processResponse(requestId, url, method, latency, res, startTime);

            if (callback) {
                callback(res);
            }
        });

        // Handle request errors
        req.on('error', (error: Error) => {
            const endTime = Date.now();
            const latency = endTime - startTime;

            this.processError(requestId, url, method, latency, error, startTime);
        });

        return req;
    }

    private shouldInstrument(url: string): boolean {
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

    private processResponse(
        requestId: string,
        url: string,
        method: string,
        latency: number,
        response: any,
        timestamp: number
    ): void {
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

    private processError(
        requestId: string,
        url: string,
        method: string,
        latency: number,
        error: Error,
        timestamp: number
    ): void {
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

    private extractEndpoint(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname;
        } catch {
            // If URL parsing fails, try to extract path from string
            const match = url.match(/\/[^?#]*/);
            return match ? match[0] : url;
        }
    }

    private async sendToAgent(apiCall: any): Promise<void> {
        try {
            const fetch = require('node-fetch');
            await fetch(`${this.agentUrl}/api/calls`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiCall)
            });
        } catch (error) {
            if (this.options.enableLogging) {
                console.warn('Failed to send API call data to agent:', error);
            }
        }
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Express middleware
export function createExpressMiddleware(options: InstrumentationOptions = {}) {
    const instrumentation = new NodeInstrumentation(options);

    return (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const requestId = instrumentation['generateRequestId']();

        // Override res.end to capture response
        const originalEnd = res.end;
        res.end = function (chunk?: any, encoding?: any, cb?: any) {
            const endTime = Date.now();
            const latency = endTime - startTime;

            // Process the response
            instrumentation['processResponse'](
                requestId,
                req.url,
                req.method,
                latency,
                res,
                startTime
            );

            return originalEnd.call(this, chunk, encoding, cb);
        };

        next();
    };
}

// Auto-instrumentation function
export function instrumentHttp(options: InstrumentationOptions = {}): void {
    const instrumentation = new NodeInstrumentation(options);
    instrumentation.instrumentHttp();

    if (options.enableLogging) {
        console.log('APIViz HTTP instrumentation enabled');
    }
}

// Export for easy use
export default { instrumentHttp, createExpressMiddleware, NodeInstrumentation };
