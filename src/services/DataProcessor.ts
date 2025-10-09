import * as vscode from 'vscode';
import { ApiCall, EndpointStats, LatencyDataPoint, PerformanceMetrics, FilterOptions } from '../types';
import { ConfigurationManager } from './ConfigurationManager';

export class DataProcessor {
    private apiCalls: ApiCall[] = [];
    private endpointStats: Map<string, EndpointStats> = new Map();
    private latencyDataPoints: LatencyDataPoint[] = [];
    private configurationManager: ConfigurationManager;
    private eventEmitter = new vscode.EventEmitter<void>();

    public readonly onDataChanged = this.eventEmitter.event;

    constructor() {
        this.configurationManager = new ConfigurationManager();
    }

    addApiCall(apiCall: ApiCall): void {
        // Apply sampling rate
        if (Math.random() > this.configurationManager.getSamplingRate()) {
            return;
        }

        // Apply latency threshold
        if (apiCall.latency < this.configurationManager.getMinLatencyThreshold()) {
            return;
        }

        // Apply endpoint filters
        if (!this.matchesEndpointFilters(apiCall.url)) {
            return;
        }

        // Add to data arrays
        this.apiCalls.push(apiCall);
        this.latencyDataPoints.push({
            timestamp: apiCall.timestamp,
            latency: apiCall.latency,
            endpoint: apiCall.endpoint
        });

        // Update endpoint stats
        this.updateEndpointStatsForCall(apiCall);

        // Trim data if it exceeds max data points
        this.trimData();

        // Emit change event
        this.eventEmitter.fire();
    }

    updateEndpointStats(stats: EndpointStats[]): void {
        this.endpointStats.clear();
        stats.forEach(stat => {
            this.endpointStats.set(stat.endpoint, stat);
        });
        this.eventEmitter.fire();
    }

    getApiCalls(filter?: FilterOptions): ApiCall[] {
        let filteredCalls = [...this.apiCalls];

        if (filter) {
            // Filter by endpoints
            if (filter.endpoints.length > 0) {
                filteredCalls = filteredCalls.filter(call => 
                    filter.endpoints.some(endpoint => call.endpoint.includes(endpoint))
                );
            }

            // Filter by time range
            if (filter.timeRange) {
                filteredCalls = filteredCalls.filter(call => 
                    call.timestamp >= filter.timeRange!.start && 
                    call.timestamp <= filter.timeRange!.end
                );
            }

            // Filter by latency range
            if (filter.minLatency !== undefined) {
                filteredCalls = filteredCalls.filter(call => call.latency >= filter.minLatency!);
            }
            if (filter.maxLatency !== undefined) {
                filteredCalls = filteredCalls.filter(call => call.latency <= filter.maxLatency!);
            }

            // Filter by status codes
            if (filter.statusCodes.length > 0) {
                filteredCalls = filteredCalls.filter(call => 
                    call.statusCode && filter.statusCodes.includes(call.statusCode)
                );
            }

            // Filter by HTTP methods
            if (filter.methods.length > 0) {
                filteredCalls = filteredCalls.filter(call => 
                    filter.methods.includes(call.method.toUpperCase())
                );
            }
        }

        return filteredCalls;
    }

    getEndpointStats(): EndpointStats[] {
        return Array.from(this.endpointStats.values());
    }

    getLatencyDataPoints(filter?: FilterOptions): LatencyDataPoint[] {
        let filteredPoints = [...this.latencyDataPoints];

        if (filter) {
            // Apply same filters as API calls
            if (filter.endpoints.length > 0) {
                filteredPoints = filteredPoints.filter(point => 
                    filter.endpoints.some(endpoint => point.endpoint.includes(endpoint))
                );
            }

            if (filter.timeRange) {
                filteredPoints = filteredPoints.filter(point => 
                    point.timestamp >= filter.timeRange!.start && 
                    point.timestamp <= filter.timeRange!.end
                );
            }

            if (filter.minLatency !== undefined) {
                filteredPoints = filteredPoints.filter(point => point.latency >= filter.minLatency!);
            }
            if (filter.maxLatency !== undefined) {
                filteredPoints = filteredPoints.filter(point => point.latency <= filter.maxLatency!);
            }
        }

        return filteredPoints;
    }

    getPerformanceMetrics(filter?: FilterOptions): PerformanceMetrics {
        const calls = this.getApiCalls(filter);
        
        if (calls.length === 0) {
            return {
                averageLatency: 0,
                maxLatency: 0,
                minLatency: 0,
                p95Latency: 0,
                p99Latency: 0,
                totalCalls: 0,
                errorRate: 0,
                lastUpdate: Date.now()
            };
        }

        const latencies = calls.map(call => call.latency).sort((a, b) => a - b);
        const errorCalls = calls.filter(call => call.statusCode && call.statusCode >= 400);

        return {
            averageLatency: latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length,
            maxLatency: Math.max(...latencies),
            minLatency: Math.min(...latencies),
            p95Latency: this.calculatePercentile(latencies, 95),
            p99Latency: this.calculatePercentile(latencies, 99),
            totalCalls: calls.length,
            errorRate: (errorCalls.length / calls.length) * 100,
            lastUpdate: Date.now()
        };
    }

    getRecentCalls(count: number = 10): ApiCall[] {
        return this.apiCalls
            .slice(-count)
            .reverse();
    }

    getCallsForEndpoint(endpoint: string, count: number = 50): ApiCall[] {
        return this.apiCalls
            .filter(call => call.endpoint === endpoint)
            .slice(-count)
            .reverse();
    }

    clearData(): void {
        this.apiCalls = [];
        this.endpointStats.clear();
        this.latencyDataPoints = [];
        this.eventEmitter.fire();
    }

    private updateEndpointStatsForCall(apiCall: ApiCall): void {
        const existing = this.endpointStats.get(apiCall.endpoint);
        
        if (existing) {
            // Update existing stats
            const totalCalls = existing.totalCalls + 1;
            const newAverage = ((existing.averageLatency * existing.totalCalls) + apiCall.latency) / totalCalls;
            
            existing.totalCalls = totalCalls;
            existing.averageLatency = newAverage;
            existing.minLatency = Math.min(existing.minLatency, apiCall.latency);
            existing.maxLatency = Math.max(existing.maxLatency, apiCall.latency);
            existing.lastCall = apiCall.timestamp;
            
            if (apiCall.statusCode && apiCall.statusCode >= 400) {
                existing.errorRate = ((existing.errorRate / 100) * existing.totalCalls + 1) / totalCalls * 100;
            }
            
            // Update status based on latency and error rate
            existing.status = this.calculateEndpointStatus(existing);
        } else {
            // Create new stats
            const newStats: EndpointStats = {
                endpoint: apiCall.endpoint,
                totalCalls: 1,
                averageLatency: apiCall.latency,
                minLatency: apiCall.latency,
                maxLatency: apiCall.latency,
                p95Latency: apiCall.latency,
                p99Latency: apiCall.latency,
                errorRate: (apiCall.statusCode && apiCall.statusCode >= 400) ? 100 : 0,
                lastCall: apiCall.timestamp,
                status: 'healthy'
            };
            
            this.endpointStats.set(apiCall.endpoint, newStats);
        }
    }

    private calculateEndpointStatus(stats: EndpointStats): 'healthy' | 'warning' | 'error' {
        if (stats.errorRate > 10 || stats.averageLatency > 1000) {
            return 'error';
        } else if (stats.errorRate > 5 || stats.averageLatency > 500) {
            return 'warning';
        } else {
            return 'healthy';
        }
    }

    private calculatePercentile(sortedArray: number[], percentile: number): number {
        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        return sortedArray[Math.max(0, index)];
    }

    private matchesEndpointFilters(url: string): boolean {
        const filters = this.configurationManager.getEndpointFilters();
        
        if (filters.length === 0) {
            return true;
        }

        return filters.some(filter => {
            // Convert wildcard pattern to regex
            const regexPattern = filter
                .replace(/\*/g, '.*')
                .replace(/\?/g, '.');
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(url);
        });
    }

    private trimData(): void {
        const maxDataPoints = this.configurationManager.getMaxDataPoints();
        
        if (this.apiCalls.length > maxDataPoints) {
            this.apiCalls = this.apiCalls.slice(-maxDataPoints);
        }
        
        if (this.latencyDataPoints.length > maxDataPoints) {
            this.latencyDataPoints = this.latencyDataPoints.slice(-maxDataPoints);
        }
    }
}
