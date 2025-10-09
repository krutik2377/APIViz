import { ApiCall, EndpointStats, PerformanceMetrics } from '../types';

export interface PerformanceInsight {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    category: 'performance' | 'reliability' | 'optimization' | 'security';
    title: string;
    message: string;
    suggestion: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    confidence: number; // 0-1
    endpoint?: string;
    metrics?: {
        before?: number;
        after?: number;
        improvement?: number;
    };
    action?: {
        type: 'code' | 'config' | 'infrastructure';
        command?: string;
        link?: string;
    };
}

export interface PerformanceScore {
    overall: number; // 0-100
    speed: number;
    reliability: number;
    efficiency: number;
    badge: string;
    rank: string;
    streak: number;
    achievements: Achievement[];
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
    maxProgress: number;
}

export class AIPerformanceAnalyzer {
    private industryBenchmarks = {
        averageLatency: {
            excellent: 50,
            good: 100,
            average: 200,
            poor: 500
        },
        errorRate: {
            excellent: 0.1,
            good: 1,
            average: 5,
            poor: 10
        },
        throughput: {
            excellent: 1000,
            good: 500,
            average: 100,
            poor: 10
        }
    };

    analyzePerformance(
        metrics: PerformanceMetrics,
        endpointStats: EndpointStats[],
        recentCalls: ApiCall[]
    ): PerformanceInsight[] {
        const insights: PerformanceInsight[] = [];

        // Analyze overall performance
        insights.push(...this.analyzeOverallPerformance(metrics));

        // Analyze individual endpoints
        endpointStats.forEach(endpoint => {
            insights.push(...this.analyzeEndpointPerformance(endpoint, recentCalls));
        });

        // Analyze patterns and trends
        insights.push(...this.analyzePatterns(recentCalls));

        // Analyze optimization opportunities
        insights.push(...this.analyzeOptimizationOpportunities(endpointStats, recentCalls));

        // Sort by impact and confidence
        return insights.sort((a, b) => {
            const impactWeight = { critical: 4, high: 3, medium: 2, low: 1 };
            const aWeight = impactWeight[a.impact] * a.confidence;
            const bWeight = impactWeight[b.impact] * b.confidence;
            return bWeight - aWeight;
        });
    }

    calculatePerformanceScore(
        metrics: PerformanceMetrics,
        endpointStats: EndpointStats[],
        recentCalls: ApiCall[]
    ): PerformanceScore {
        const speedScore = this.calculateSpeedScore(metrics);
        const reliabilityScore = this.calculateReliabilityScore(metrics, endpointStats);
        const efficiencyScore = this.calculateEfficiencyScore(endpointStats, recentCalls);

        const overall = Math.round((speedScore + reliabilityScore + efficiencyScore) / 3);

        return {
            overall,
            speed: speedScore,
            reliability: reliabilityScore,
            efficiency: efficiencyScore,
            badge: this.getBadge(overall),
            rank: this.getRank(overall),
            streak: this.calculateStreak(recentCalls),
            achievements: this.getAchievements(metrics, endpointStats, recentCalls)
        };
    }

    private analyzeOverallPerformance(metrics: PerformanceMetrics): PerformanceInsight[] {
        const insights: PerformanceInsight[] = [];

        // Average latency analysis
        if (metrics.averageLatency > this.industryBenchmarks.averageLatency.poor) {
            insights.push({
                id: 'high-latency',
                type: 'error',
                category: 'performance',
                title: 'High Average Latency',
                message: `Your average latency is ${metrics.averageLatency}ms, which is ${this.getLatencyComparison(metrics.averageLatency)}`,
                suggestion: 'Consider implementing caching, database optimization, or code profiling to reduce latency',
                impact: 'high',
                confidence: 0.9,
                action: {
                    type: 'code',
                    command: 'apiviz.profilePerformance'
                }
            });
        } else if (metrics.averageLatency < this.industryBenchmarks.averageLatency.excellent) {
            insights.push({
                id: 'excellent-latency',
                type: 'success',
                category: 'performance',
                title: 'Excellent Performance',
                message: `Your average latency of ${metrics.averageLatency}ms is excellent!`,
                suggestion: 'Keep up the great work! Consider sharing your optimization techniques with the team',
                impact: 'low',
                confidence: 0.95
            });
        }

        // Error rate analysis
        if (metrics.errorRate > this.industryBenchmarks.errorRate.poor) {
            insights.push({
                id: 'high-error-rate',
                type: 'error',
                category: 'reliability',
                title: 'High Error Rate',
                message: `Your error rate is ${metrics.errorRate.toFixed(1)}%, which is concerning`,
                suggestion: 'Implement better error handling, add retry logic, and monitor error patterns',
                impact: 'critical',
                confidence: 0.95,
                action: {
                    type: 'code',
                    command: 'apiviz.analyzeErrors'
                }
            });
        }

        // Total calls analysis
        if (metrics.totalCalls > 10000) {
            insights.push({
                id: 'high-traffic',
                type: 'info',
                category: 'performance',
                title: 'High Traffic Volume',
                message: `You've processed ${metrics.totalCalls} API calls - great traffic!`,
                suggestion: 'Consider implementing rate limiting and monitoring for scalability',
                impact: 'medium',
                confidence: 0.8
            });
        }

        return insights;
    }

    private analyzeEndpointPerformance(endpoint: EndpointStats, recentCalls: ApiCall[]): PerformanceInsight[] {
        const insights: PerformanceInsight[] = [];

        // Slow endpoint analysis
        if (endpoint.averageLatency > 1000) {
            insights.push({
                id: `slow-endpoint-${endpoint.endpoint}`,
                type: 'warning',
                category: 'performance',
                title: 'Slow Endpoint Detected',
                message: `${endpoint.endpoint} has an average latency of ${endpoint.averageLatency}ms`,
                suggestion: 'This endpoint needs optimization. Consider caching, database indexing, or code refactoring',
                impact: 'high',
                confidence: 0.85,
                endpoint: endpoint.endpoint,
                action: {
                    type: 'code',
                    command: 'apiviz.optimizeEndpoint'
                }
            });
        }

        // High error rate endpoint
        if (endpoint.errorRate > 10) {
            insights.push({
                id: `error-endpoint-${endpoint.endpoint}`,
                type: 'error',
                category: 'reliability',
                title: 'Unreliable Endpoint',
                message: `${endpoint.endpoint} has a ${endpoint.errorRate.toFixed(1)}% error rate`,
                suggestion: 'Investigate error patterns and implement better error handling',
                impact: 'critical',
                confidence: 0.9,
                endpoint: endpoint.endpoint
            });
        }

        // Popular endpoint analysis
        if (endpoint.totalCalls > 1000) {
            insights.push({
                id: `popular-endpoint-${endpoint.endpoint}`,
                type: 'info',
                category: 'optimization',
                title: 'High-Traffic Endpoint',
                message: `${endpoint.endpoint} is your most popular endpoint with ${endpoint.totalCalls} calls`,
                suggestion: 'Consider implementing caching or CDN for this high-traffic endpoint',
                impact: 'medium',
                confidence: 0.8,
                endpoint: endpoint.endpoint
            });
        }

        return insights;
    }

    private analyzePatterns(recentCalls: ApiCall[]): PerformanceInsight[] {
        const insights: PerformanceInsight[] = [];

        // Time-based patterns
        const hourlyPatterns = this.analyzeHourlyPatterns(recentCalls);
        if (hourlyPatterns.hasSpikes) {
            insights.push({
                id: 'traffic-spikes',
                type: 'warning',
                category: 'performance',
                title: 'Traffic Spikes Detected',
                message: 'Your API experiences significant traffic spikes during certain hours',
                suggestion: 'Consider implementing auto-scaling or load balancing to handle traffic spikes',
                impact: 'medium',
                confidence: 0.75
            });
        }

        // Latency trends
        const latencyTrend = this.analyzeLatencyTrend(recentCalls);
        if (latencyTrend.isIncreasing) {
            insights.push({
                id: 'latency-trend',
                type: 'warning',
                category: 'performance',
                title: 'Latency Trend Warning',
                message: `Your API latency is increasing by ${latencyTrend.rate.toFixed(1)}ms per hour`,
                suggestion: 'Investigate the cause of increasing latency before it becomes critical',
                impact: 'high',
                confidence: 0.8
            });
        }

        return insights;
    }

    private analyzeOptimizationOpportunities(
        endpointStats: EndpointStats[],
        recentCalls: ApiCall[]
    ): PerformanceInsight[] {
        const insights: PerformanceInsight[] = [];

        // Caching opportunities
        const cacheableEndpoints = endpointStats.filter(stat =>
            stat.totalCalls > 100 &&
            stat.averageLatency > 200 &&
            this.isCacheable(stat.endpoint)
        );

        if (cacheableEndpoints.length > 0) {
            insights.push({
                id: 'caching-opportunity',
                type: 'info',
                category: 'optimization',
                title: 'Caching Opportunity',
                message: `${cacheableEndpoints.length} endpoints could benefit from caching`,
                suggestion: 'Implement Redis or in-memory caching for frequently accessed data',
                impact: 'high',
                confidence: 0.85,
                action: {
                    type: 'infrastructure',
                    link: 'https://redis.io/docs/getting-started/'
                }
            });
        }

        // Database optimization
        const slowEndpoints = endpointStats.filter(stat => stat.averageLatency > 500);
        if (slowEndpoints.length > 0) {
            insights.push({
                id: 'database-optimization',
                type: 'warning',
                category: 'optimization',
                title: 'Database Optimization Needed',
                message: `${slowEndpoints.length} endpoints are slow, likely due to database queries`,
                suggestion: 'Add database indexes, optimize queries, or implement connection pooling',
                impact: 'high',
                confidence: 0.8
            });
        }

        return insights;
    }

    private calculateSpeedScore(metrics: PerformanceMetrics): number {
        const latency = metrics.averageLatency;
        if (latency < 50) return 100;
        if (latency < 100) return 90;
        if (latency < 200) return 75;
        if (latency < 500) return 50;
        return 25;
    }

    private calculateReliabilityScore(metrics: PerformanceMetrics, endpointStats: EndpointStats[]): number {
        const errorRate = metrics.errorRate;
        const avgErrorRate = endpointStats.reduce((sum, stat) => sum + stat.errorRate, 0) / endpointStats.length;

        if (errorRate < 1 && avgErrorRate < 1) return 100;
        if (errorRate < 5 && avgErrorRate < 5) return 80;
        if (errorRate < 10 && avgErrorRate < 10) return 60;
        return 30;
    }

    private calculateEfficiencyScore(endpointStats: EndpointStats[], recentCalls: ApiCall[]): number {
        const totalCalls = recentCalls.length;
        const uniqueEndpoints = endpointStats.length;
        const efficiency = totalCalls / uniqueEndpoints;

        if (efficiency > 1000) return 100;
        if (efficiency > 500) return 80;
        if (efficiency > 100) return 60;
        return 40;
    }

    private getBadge(score: number): string {
        if (score >= 90) return '🏆 Performance Champion';
        if (score >= 80) return '⚡ Lightning Fast';
        if (score >= 70) return '🚀 Speed Demon';
        if (score >= 60) return '💨 Quick & Reliable';
        if (score >= 50) return '🐌 Needs Optimization';
        return '🚨 Critical Issues';
    }

    private getRank(score: number): string {
        if (score >= 90) return 'Top 1%';
        if (score >= 80) return 'Top 10%';
        if (score >= 70) return 'Top 25%';
        if (score >= 60) return 'Above Average';
        if (score >= 50) return 'Average';
        return 'Below Average';
    }

    private calculateStreak(recentCalls: ApiCall[]): number {
        // Calculate consecutive days without critical errors
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        let streak = 0;

        for (let i = 0; i < 30; i++) {
            const dayStart = now - (i * oneDay);
            const dayEnd = dayStart + oneDay;
            const dayCalls = recentCalls.filter(call =>
                call.timestamp >= dayStart && call.timestamp < dayEnd
            );

            const hasErrors = dayCalls.some(call => call.statusCode && call.statusCode >= 500);
            if (hasErrors) break;
            streak++;
        }

        return streak;
    }

    private getAchievements(
        metrics: PerformanceMetrics,
        endpointStats: EndpointStats[],
        recentCalls: ApiCall[]
    ): Achievement[] {
        const achievements: Achievement[] = [];

        // Speed achievements
        if (metrics.averageLatency < 100) {
            achievements.push({
                id: 'speed-demon',
                name: 'Speed Demon',
                description: 'Achieve sub-100ms average latency',
                icon: '⚡',
                unlocked: true,
                progress: 100,
                maxProgress: 100
            });
        }

        // Reliability achievements
        if (metrics.errorRate < 1) {
            achievements.push({
                id: 'reliability-master',
                name: 'Reliability Master',
                description: 'Maintain less than 1% error rate',
                icon: '🛡️',
                unlocked: true,
                progress: 100,
                maxProgress: 100
            });
        }

        // Volume achievements
        if (metrics.totalCalls > 10000) {
            achievements.push({
                id: 'high-traffic',
                name: 'High Traffic Handler',
                description: 'Process over 10,000 API calls',
                icon: '🚦',
                unlocked: true,
                progress: 100,
                maxProgress: 100
            });
        }

        return achievements;
    }

    private getLatencyComparison(latency: number): string {
        if (latency < 50) return 'excellent';
        if (latency < 100) return 'very good';
        if (latency < 200) return 'good';
        if (latency < 500) return 'average';
        return 'poor';
    }

    private isCacheable(endpoint: string): boolean {
        const cacheablePatterns = ['/api/users', '/api/products', '/api/categories'];
        return cacheablePatterns.some(pattern => endpoint.includes(pattern));
    }

    private analyzeHourlyPatterns(calls: ApiCall[]): { hasSpikes: boolean; peakHour: number } {
        const hourlyCounts = new Array(24).fill(0);

        calls.forEach(call => {
            const hour = new Date(call.timestamp).getHours();
            hourlyCounts[hour]++;
        });

        const maxCalls = Math.max(...hourlyCounts);
        const avgCalls = hourlyCounts.reduce((sum, count) => sum + count, 0) / 24;
        const hasSpikes = maxCalls > avgCalls * 2;
        const peakHour = hourlyCounts.indexOf(maxCalls);

        return { hasSpikes, peakHour };
    }

    private analyzeLatencyTrend(calls: ApiCall[]): { isIncreasing: boolean; rate: number } {
        if (calls.length < 10) return { isIncreasing: false, rate: 0 };

        const sortedCalls = calls.sort((a, b) => a.timestamp - b.timestamp);
        const firstHalf = sortedCalls.slice(0, Math.floor(sortedCalls.length / 2));
        const secondHalf = sortedCalls.slice(Math.floor(sortedCalls.length / 2));

        const firstAvg = firstHalf.reduce((sum, call) => sum + call.latency, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, call) => sum + call.latency, 0) / secondHalf.length;

        const timeDiff = (secondHalf[0].timestamp - firstHalf[0].timestamp) / (1000 * 60 * 60); // hours
        const rate = (secondAvg - firstAvg) / timeDiff;

        return { isIncreasing: rate > 10, rate };
    }
}
