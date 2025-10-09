export interface BrowserInstrumentationOptions {
    agentUrl?: string;
    samplingRate?: number;
    minLatencyThreshold?: number;
    endpointFilters?: string[];
    enableLogging?: boolean;
}

export class BrowserInstrumentation {
    private options: Required<BrowserInstrumentationOptions>;
    private agentUrl: string;
    private originalFetch: typeof fetch;
    private originalXHR: typeof XMLHttpRequest;

    constructor(options: BrowserInstrumentationOptions = {}) {
        this.options = {
            agentUrl: options.agentUrl || 'http://localhost:3001',
            samplingRate: options.samplingRate || 1.0,
            minLatencyThreshold: options.minLatencyThreshold || 10,
            endpointFilters: options.endpointFilters || ['/api/*'],
            enableLogging: options.enableLogging || false
        };

        this.agentUrl = this.options.agentUrl;
        this.originalFetch = window.fetch;
        this.originalXHR = window.XMLHttpRequest;
    }

    instrumentFetch(): void {
        const self = this;

        window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
            return self.wrapFetch(input, init);
        };
    }

    instrumentXHR(): void {
        const self = this;
        const OriginalXHR = this.originalXHR;

        function InstrumentedXHR() {
            const xhr = new OriginalXHR();
            const startTime = Date.now();
            const requestId = self.generateRequestId();

            // Extract URL and method
            let url = '';
            let method = 'GET';

            const originalOpen = xhr.open;
            xhr.open = function (methodStr: string, urlStr: string, async?: boolean, user?: string | null, password?: string | null) {
                url = urlStr;
                method = methodStr.toUpperCase();
                return originalOpen.call(this, methodStr, urlStr, async, user, password);
            };

            const originalSend = xhr.send;
            xhr.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
                // Check if we should instrument this request
                if (self.shouldInstrument(url)) {
                    const originalOnLoad = xhr.onload;
                    const originalOnError = xhr.onerror;

                    xhr.onload = function (event: Event) {
                        const endTime = Date.now();
                        const latency = endTime - startTime;

                        self.processResponse(requestId, url, method, latency, xhr, startTime);

                        if (originalOnLoad) {
                            originalOnLoad.call(this, event);
                        }
                    };

                    xhr.onerror = function (event: Event) {
                        const endTime = Date.now();
                        const latency = endTime - startTime;

                        self.processError(requestId, url, method, latency, new Error('XHR Error'), startTime);

                        if (originalOnError) {
                            originalOnError.call(this, event);
                        }
                    };
                }

                return originalSend.call(this, body);
            };

            return xhr;
        }

        // Copy static properties
        Object.setPrototypeOf(InstrumentedXHR, OriginalXHR);
        Object.defineProperty(InstrumentedXHR, 'prototype', {
            value: OriginalXHR.prototype,
            writable: false
        });

        window.XMLHttpRequest = InstrumentedXHR as any;
    }

    instrumentAxios(): void {
        // This would require axios to be available
        if (typeof window !== 'undefined' && (window as any).axios) {
            const axios = (window as any).axios;
            const self = this;

            // Intercept requests
            axios.interceptors.request.use((config: any) => {
                config.metadata = { startTime: Date.now(), requestId: self.generateRequestId() };
                return config;
            });

            // Intercept responses
            axios.interceptors.response.use(
                (response: any) => {
                    const endTime = Date.now();
                    const latency = endTime - response.config.metadata.startTime;
                    const requestId = response.config.metadata.requestId;

                    if (self.shouldInstrument(response.config.url)) {
                        self.processResponse(
                            requestId,
                            response.config.url,
                            response.config.method.toUpperCase(),
                            latency,
                            response,
                            response.config.metadata.startTime
                        );
                    }

                    return response;
                },
                (error: any) => {
                    if (error.config && error.config.metadata) {
                        const endTime = Date.now();
                        const latency = endTime - error.config.metadata.startTime;
                        const requestId = error.config.metadata.requestId;

                        if (self.shouldInstrument(error.config.url)) {
                            self.processError(
                                requestId,
                                error.config.url,
                                error.config.method.toUpperCase(),
                                latency,
                                error,
                                error.config.metadata.startTime
                            );
                        }
                    }

                    return Promise.reject(error);
                }
            );
        }
    }

    private async wrapFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
        const startTime = Date.now();
        const requestId = this.generateRequestId();

        // Extract URL and method
        const url = typeof input === 'string' ? input : input.toString();
        const method = (init?.method || 'GET').toUpperCase();

        // Check if we should instrument this request
        if (!this.shouldInstrument(url)) {
            return this.originalFetch(input, init);
        }

        try {
            const response = await this.originalFetch(input, init);
            const endTime = Date.now();
            const latency = endTime - startTime;

            this.processResponse(requestId, url, method, latency, response, startTime);

            return response;
        } catch (error) {
            const endTime = Date.now();
            const latency = endTime - startTime;

            this.processError(requestId, url, method, latency, error as Error, startTime);

            throw error;
        }
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
            statusCode: response.status || response.statusCode,
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

    restore(): void {
        window.fetch = this.originalFetch;
        window.XMLHttpRequest = this.originalXHR;
    }
}

// Auto-instrumentation functions
export function instrumentFetch(options: BrowserInstrumentationOptions = {}): void {
    const instrumentation = new BrowserInstrumentation(options);
    instrumentation.instrumentFetch();

    if (options.enableLogging) {
        console.log('APIViz fetch instrumentation enabled');
    }
}

export function instrumentXHR(options: BrowserInstrumentationOptions = {}): void {
    const instrumentation = new BrowserInstrumentation(options);
    instrumentation.instrumentXHR();

    if (options.enableLogging) {
        console.log('APIViz XHR instrumentation enabled');
    }
}

export function instrumentAxios(options: BrowserInstrumentationOptions = {}): void {
    const instrumentation = new BrowserInstrumentation(options);
    instrumentation.instrumentAxios();

    if (options.enableLogging) {
        console.log('APIViz axios instrumentation enabled');
    }
}

export function instrumentAll(options: BrowserInstrumentationOptions = {}): void {
    const instrumentation = new BrowserInstrumentation(options);
    instrumentation.instrumentFetch();
    instrumentation.instrumentXHR();
    instrumentation.instrumentAxios();

    if (options.enableLogging) {
        console.log('APIViz browser instrumentation enabled');
    }
}

// Export for easy use
export default {
    instrumentFetch,
    instrumentXHR,
    instrumentAxios,
    instrumentAll,
    BrowserInstrumentation
};
