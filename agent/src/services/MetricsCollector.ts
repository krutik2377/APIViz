import { ApiCall, EndpointStats, LatencyDataPoint } from '../../types';

export class MetricsCollector {
    private apiCalls: ApiCall[] = [];
    private endpointStats: Map<string, EndpointStats> = new Map();
    private latencyDataPoints: LatencyDataPoint[] = [];
    private maxDataPoints = 10000; // Configurable limit

    addApiCall(apiCall: ApiCall): void {
        this.apiCalls.push(apiCall);
        this.latencyDataPoints.push({
            timestamp: apiCall.timestamp,
            latency: apiCall.latency,
            endpoint: apiCall.endpoint
        });

        // Trim data if it exceeds max data points
        this.trimData();
    }

    addEndpointStats(stats: EndpointStats): void {
        this.endpointStats.set(stats.endpoint, stats);
    }

    updateEndpointStats(stats: EndpointStats[]): void {
        this.endpointStats.clear();
        stats.forEach(stat => {
            this.endpointStats.set(stat.endpoint, stat);
        });
    }

    getApiCalls(): ApiCall[] {
        return [...this.apiCalls];
    }

    getRecentCalls(count: number = 50): ApiCall[] {
        return this.apiCalls
            .slice(-count)
            .reverse();
    }

    getCallsForEndpoint(endpoint: string, count: number = 100): ApiCall[] {
        return this.apiCalls
            .filter(call => call.endpoint === endpoint)
            .slice(-count)
            .reverse();
    }

    getEndpointStats(): EndpointStats[] {
        return Array.from(this.endpointStats.values());
    }

    getLatencyDataPoints(): LatencyDataPoint[] {
        return [...this.latencyDataPoints];
    }

    getLatenciesForEndpoint(endpoint: string): number[] {
        return this.latencyDataPoints
            .filter(point => point.endpoint === endpoint)
            .map(point => point.latency);
    }

    getTotalCalls(): number {
        return this.apiCalls.length;
    }

    getActiveEndpoints(): number {
        return this.endpointStats.size;
    }

    getAverageLatency(): number {
        if (this.latencyDataPoints.length === 0) {
            return 0;
        }

        const totalLatency = this.latencyDataPoints.reduce((sum, point) => sum + point.latency, 0);
        return totalLatency / this.latencyDataPoints.length;
    }

    getPerformanceMetrics(timeWindow?: { start: number; end: number }) {
        let calls = this.apiCalls;

        if (timeWindow) {
            calls = calls.filter(call =>
                call.timestamp >= timeWindow.start &&
                call.timestamp <= timeWindow.end
            );
        }

        if (calls.length === 0) {
            return {
                totalCalls: 0,
                averageLatency: 0,
                minLatency: 0,
                maxLatency: 0,
                p95Latency: 0,
                p99Latency: 0,
                errorRate: 0
            };
        }

        const latencies = calls.map(call => call.latency).sort((a, b) => a - b);
        const errorCalls = calls.filter(call => call.statusCode && call.statusCode >= 400);

        return {
            totalCalls: calls.length,
            averageLatency: latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length,
            minLatency: Math.min(...latencies),
            maxLatency: Math.max(...latencies),
            p95Latency: this.calculatePercentile(latencies, 95),
            p99Latency: this.calculatePercentile(latencies, 99),
            errorRate: (errorCalls.length / calls.length) * 100
        };
    }

    getTopEndpoints(count: number = 10): EndpointStats[] {
        return Array.from(this.endpointStats.values())
            .sort((a, b) => b.totalCalls - a.totalCalls)
            .slice(0, count);
    }

    getSlowestEndpoints(count: number = 10): EndpointStats[] {
        return Array.from(this.endpointStats.values())
            .sort((a, b) => b.averageLatency - a.averageLatency)
            .slice(0, count);
    }

    getErrorEndpoints(): EndpointStats[] {
        return Array.from(this.endpointStats.values())
            .filter(stat => stat.errorRate > 0)
            .sort((a, b) => b.errorRate - a.errorRate);
    }

    clearData(): void {
        this.apiCalls = [];
        this.endpointStats.clear();
        this.latencyDataPoints = [];
    }

    private calculatePercentile(sortedArray: number[], percentile: number): number {
        if (sortedArray.length === 0) {
            return 0;
        }

        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        return sortedArray[Math.max(0, index)];
    }

    private trimData(): void {
        if (this.apiCalls.length > this.maxDataPoints) {
            this.apiCalls = this.apiCalls.slice(-this.maxDataPoints);
        }

        if (this.latencyDataPoints.length > this.maxDataPoints) {
            this.latencyDataPoints = this.latencyDataPoints.slice(-this.maxDataPoints);
        }
    }

    setMaxDataPoints(maxPoints: number): void {
        this.maxDataPoints = maxPoints;
        this.trimData();
    }

    getMetrics() {
        return {
            totalCalls: this.getTotalCalls(),
            activeEndpoints: this.getActiveEndpoints(),
            averageLatency: this.getAverageLatency(),
            performanceMetrics: this.getPerformanceMetrics(),
            topEndpoints: this.getTopEndpoints(),
            slowestEndpoints: this.getSlowestEndpoints(),
            errorEndpoints: this.getErrorEndpoints(),
            recentCalls: this.getRecentCalls(10),
            endpointStats: this.getEndpointStats()
        };
    }
}
