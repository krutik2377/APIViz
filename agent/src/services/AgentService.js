"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
class AgentService {
    constructor(metricsCollector, webSocketManager) {
        this.metricsCollector = metricsCollector;
        this.webSocketManager = webSocketManager;
    }
    processApiCall(apiCall) {
        try {
            // Validate API call data
            if (!this.validateApiCall(apiCall)) {
                console.warn('Invalid API call data received:', apiCall);
                return;
            }
            // Add to metrics collector
            this.metricsCollector.addApiCall(apiCall);
            // Broadcast to connected clients
            this.webSocketManager.broadcastApiCall(apiCall);
            // Update endpoint stats
            this.updateEndpointStatsForCall(apiCall);
        }
        catch (error) {
            console.error('Error processing API call:', error);
        }
    }
    updateEndpointStats(stats) {
        try {
            this.metricsCollector.updateEndpointStats(stats);
            this.webSocketManager.broadcastEndpointStats(stats);
        }
        catch (error) {
            console.error('Error updating endpoint stats:', error);
        }
    }
    validateApiCall(apiCall) {
        return (apiCall &&
            typeof apiCall.id === 'string' &&
            typeof apiCall.url === 'string' &&
            typeof apiCall.method === 'string' &&
            typeof apiCall.latency === 'number' &&
            typeof apiCall.timestamp === 'number' &&
            typeof apiCall.endpoint === 'string' &&
            typeof apiCall.duration === 'number');
    }
    updateEndpointStatsForCall(apiCall) {
        const currentStats = this.metricsCollector.getEndpointStats();
        const endpoint = apiCall.endpoint;
        let existingStats = currentStats.find(stat => stat.endpoint === endpoint);
        if (existingStats) {
            // Update existing stats
            const totalCalls = existingStats.totalCalls + 1;
            const newAverage = ((existingStats.averageLatency * existingStats.totalCalls) + apiCall.latency) / totalCalls;
            existingStats.totalCalls = totalCalls;
            existingStats.averageLatency = newAverage;
            existingStats.minLatency = Math.min(existingStats.minLatency, apiCall.latency);
            existingStats.maxLatency = Math.max(existingStats.maxLatency, apiCall.latency);
            existingStats.lastCall = apiCall.timestamp;
            if (apiCall.statusCode && apiCall.statusCode >= 400) {
                existingStats.errorRate = ((existingStats.errorRate / 100) * existingStats.totalCalls + 1) / totalCalls * 100;
            }
            // Recalculate percentiles
            this.calculatePercentiles(existingStats, apiCall.latency);
            // Update status
            existingStats.status = this.calculateEndpointStatus(existingStats);
        }
        else {
            // Create new stats
            const newStats = {
                endpoint: endpoint,
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
            this.metricsCollector.addEndpointStats(newStats);
        }
        // Broadcast updated stats
        const updatedStats = this.metricsCollector.getEndpointStats();
        this.webSocketManager.broadcastEndpointStats(updatedStats);
    }
    calculatePercentiles(stats, newLatency) {
        // This is a simplified percentile calculation
        // In a real implementation, you'd want to maintain a rolling window of latencies
        const latencies = this.metricsCollector.getLatenciesForEndpoint(stats.endpoint);
        if (latencies.length > 0) {
            const sortedLatencies = latencies.sort((a, b) => a - b);
            stats.p95Latency = this.calculatePercentile(sortedLatencies, 95);
            stats.p99Latency = this.calculatePercentile(sortedLatencies, 99);
        }
    }
    calculatePercentile(sortedArray, percentile) {
        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        return sortedArray[Math.max(0, index)];
    }
    calculateEndpointStatus(stats) {
        if (stats.errorRate > 10 || stats.averageLatency > 1000) {
            return 'error';
        }
        else if (stats.errorRate > 5 || stats.averageLatency > 500) {
            return 'warning';
        }
        else {
            return 'healthy';
        }
    }
    getMetrics() {
        return {
            totalCalls: this.metricsCollector.getTotalCalls(),
            activeEndpoints: this.metricsCollector.getActiveEndpoints(),
            averageLatency: this.metricsCollector.getAverageLatency(),
            uptime: process.uptime(),
            timestamp: Date.now()
        };
    }
}
exports.AgentService = AgentService;
//# sourceMappingURL=AgentService.js.map