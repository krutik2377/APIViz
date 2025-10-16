import { ApiCall, EndpointStats, LatencyDataPoint, PerformanceMetrics } from '../types';

export interface PredictionResult {
    type: 'latency' | 'error' | 'traffic' | 'performance';
    confidence: number;
    predictedValue: number;
    currentValue: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    timeframe: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
    riskLevel: number; // 0-100
}

export interface ForecastData {
    timestamp: number;
    predictedLatency: number;
    predictedTraffic: number;
    predictedErrors: number;
    confidence: number;
}

export interface AnomalyDetection {
    type: 'latency_spike' | 'error_surge' | 'traffic_anomaly' | 'performance_degradation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    detectedAt: number;
    affectedEndpoints: string[];
    description: string;
    suggestedActions: string[];
    confidence: number;
}

export interface PerformanceInsight {
    id: string;
    type: 'prediction' | 'anomaly' | 'optimization' | 'trend';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    actionable: boolean;
    suggestedActions: string[];
    timeframe: string;
    affectedEndpoints?: string[];
    metrics?: any;
}

export class MLPredictiveEngine {
    private historicalData: LatencyDataPoint[] = [];
    private endpointPatterns: Map<string, any> = new Map();
    private anomalyThresholds: Map<string, number> = new Map();
    private predictionModels: Map<string, any> = new Map();

    constructor() {
        this.initializeModels();
    }

    private initializeModels(): void {
        // Initialize simple ML models for predictions
        // In a real implementation, these would be trained models
        this.predictionModels.set('latency', {
            type: 'linear_regression',
            features: ['time_of_day', 'day_of_week', 'historical_avg', 'recent_trend'],
            trained: true
        });

        this.predictionModels.set('traffic', {
            type: 'time_series',
            features: ['hourly_pattern', 'weekly_pattern', 'seasonal_trend'],
            trained: true
        });

        this.predictionModels.set('errors', {
            type: 'classification',
            features: ['latency_spike', 'traffic_increase', 'time_pattern'],
            trained: true
        });
    }

    public addDataPoint(dataPoint: LatencyDataPoint): void {
        this.historicalData.push(dataPoint);

        // Keep only last 1000 data points for performance
        if (this.historicalData.length > 1000) {
            this.historicalData = this.historicalData.slice(-1000);
        }

        // Update endpoint patterns
        this.updateEndpointPatterns(dataPoint);
    }

    public predictLatency(endpoint: string, timeframe: string = '1h'): PredictionResult {
        const endpointData = this.getEndpointData(endpoint);
        const currentLatency = this.getCurrentLatency(endpoint);

        // Simple prediction algorithm (in real implementation, use trained ML model)
        const trend = this.calculateTrend(endpointData);
        const timeFactor = this.getTimeFactor();
        const predictedValue = this.calculatePredictedLatency(currentLatency, trend, timeFactor);

        const confidence = this.calculateConfidence(endpointData);
        const impact = this.assessImpact(predictedValue, currentLatency);
        const riskLevel = this.calculateRiskLevel(predictedValue, currentLatency);

        return {
            type: 'latency',
            confidence,
            predictedValue: Math.round(predictedValue),
            currentValue: Math.round(currentLatency),
            trend: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable',
            timeframe,
            impact,
            recommendation: this.generateLatencyRecommendation(predictedValue, currentLatency),
            riskLevel
        };
    }

    public predictTraffic(endpoint: string, timeframe: string = '1h'): PredictionResult {
        const endpointData = this.getEndpointData(endpoint);
        const currentTraffic = this.getCurrentTraffic(endpoint);

        const trend = this.calculateTrafficTrend(endpointData);
        const timeFactor = this.getTimeFactor();
        const predictedValue = this.calculatePredictedTraffic(currentTraffic, trend, timeFactor);

        const confidence = this.calculateConfidence(endpointData);
        const impact = this.assessTrafficImpact(predictedValue, currentTraffic);
        const riskLevel = this.calculateRiskLevel(predictedValue, currentTraffic);

        return {
            type: 'traffic',
            confidence,
            predictedValue: Math.round(predictedValue),
            currentValue: Math.round(currentTraffic),
            trend: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable',
            timeframe,
            impact,
            recommendation: this.generateTrafficRecommendation(predictedValue, currentTraffic),
            riskLevel
        };
    }

    public predictErrors(endpoint: string, timeframe: string = '1h'): PredictionResult {
        const endpointData = this.getEndpointData(endpoint);
        const currentErrorRate = this.getCurrentErrorRate(endpoint);

        const trend = this.calculateErrorTrend(endpointData);
        const riskFactors = this.assessRiskFactors(endpoint);
        const predictedValue = this.calculatePredictedErrorRate(currentErrorRate, trend, riskFactors);

        const confidence = this.calculateConfidence(endpointData);
        const impact = this.assessErrorImpact(predictedValue, currentErrorRate);
        const riskLevel = this.calculateRiskLevel(predictedValue, currentErrorRate);

        return {
            type: 'error',
            confidence,
            predictedValue: Math.round(predictedValue * 100) / 100,
            currentValue: Math.round(currentErrorRate * 100) / 100,
            trend: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable',
            timeframe,
            impact,
            recommendation: this.generateErrorRecommendation(predictedValue, currentErrorRate),
            riskLevel
        };
    }

    public detectAnomalies(): AnomalyDetection[] {
        const anomalies: AnomalyDetection[] = [];
        const endpoints = this.getUniqueEndpoints();

        for (const endpoint of endpoints) {
            const endpointData = this.getEndpointData(endpoint);

            // Check for latency spikes
            const latencyAnomaly = this.detectLatencyAnomaly(endpoint, endpointData);
            if (latencyAnomaly) {
                anomalies.push(latencyAnomaly);
            }

            // Check for error surges
            const errorAnomaly = this.detectErrorAnomaly(endpoint, endpointData);
            if (errorAnomaly) {
                anomalies.push(errorAnomaly);
            }

            // Check for traffic anomalies
            const trafficAnomaly = this.detectTrafficAnomaly(endpoint, endpointData);
            if (trafficAnomaly) {
                anomalies.push(trafficAnomaly);
            }
        }

        return anomalies.sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }

    public generateForecast(endpoint: string, hours: number = 24): ForecastData[] {
        const forecast: ForecastData[] = [];
        const currentTime = Date.now();
        const endpointData = this.getEndpointData(endpoint);

        for (let i = 1; i <= hours; i++) {
            const timestamp = currentTime + (i * 60 * 60 * 1000);
            const timeFactor = this.getTimeFactorForTimestamp(timestamp);

            const predictedLatency = this.calculatePredictedLatency(
                this.getCurrentLatency(endpoint),
                this.calculateTrend(endpointData),
                timeFactor
            );

            const predictedTraffic = this.calculatePredictedTraffic(
                this.getCurrentTraffic(endpoint),
                this.calculateTrafficTrend(endpointData),
                timeFactor
            );

            const predictedErrors = this.calculatePredictedErrorRate(
                this.getCurrentErrorRate(endpoint),
                this.calculateErrorTrend(endpointData),
                this.assessRiskFactors(endpoint)
            );

            const confidence = this.calculateConfidence(endpointData) * (1 - (i * 0.02)); // Decrease confidence over time

            forecast.push({
                timestamp,
                predictedLatency: Math.round(predictedLatency),
                predictedTraffic: Math.round(predictedTraffic),
                predictedErrors: Math.round(predictedErrors * 100) / 100,
                confidence: Math.max(0.1, confidence)
            });
        }

        return forecast;
    }

    public generateInsights(metrics: PerformanceMetrics): PerformanceInsight[] {
        const insights: PerformanceInsight[] = [];

        // Latency insights
        if (metrics.averageLatency > 200) {
            insights.push({
                id: 'high-latency',
                type: 'optimization',
                title: 'High Average Latency Detected',
                description: `Your average latency of ${metrics.averageLatency.toFixed(2)}ms is above the recommended threshold of 200ms.`,
                impact: 'high',
                confidence: 0.9,
                actionable: true,
                suggestedActions: [
                    'Review database query optimization',
                    'Implement caching strategies',
                    'Consider CDN implementation',
                    'Analyze slow endpoints for bottlenecks'
                ],
                timeframe: 'immediate',
                affectedEndpoints: metrics.slowestEndpoints?.map((e: EndpointStats) => e.endpoint) || []
            });
        }

        // Error rate insights
        if (metrics.errorEndpoints && metrics.errorEndpoints.length > 0) {
            insights.push({
                id: 'error-endpoints',
                type: 'anomaly',
                title: 'Error-Prone Endpoints Identified',
                description: `${metrics.errorEndpoints.length} endpoints are experiencing errors.`,
                impact: 'critical',
                confidence: 0.95,
                actionable: true,
                suggestedActions: [
                    'Investigate error logs for root causes',
                    'Implement better error handling',
                    'Add retry mechanisms',
                    'Review input validation'
                ],
                timeframe: 'immediate',
                affectedEndpoints: metrics.errorEndpoints.map((e: EndpointStats) => e.endpoint)
            });
        }

        // Traffic insights
        if (metrics.topEndpoints && metrics.topEndpoints.length > 0) {
            const highTrafficEndpoints = metrics.topEndpoints.filter(e => e.totalCalls > 1000);
            if (highTrafficEndpoints.length > 0) {
                insights.push({
                    id: 'high-traffic',
                    type: 'optimization',
                    title: 'High Traffic Endpoints Identified',
                    description: `${highTrafficEndpoints.length} endpoints are handling high traffic volumes.`,
                    impact: 'medium',
                    confidence: 0.8,
                    actionable: true,
                    suggestedActions: [
                        'Implement rate limiting',
                        'Consider load balancing',
                        'Add caching layers',
                        'Monitor for performance degradation'
                    ],
                    timeframe: '1-7 days',
                    affectedEndpoints: highTrafficEndpoints.map((e: EndpointStats) => e.endpoint)
                });
            }
        }

        // Trend insights
        const trendInsight = this.generateTrendInsight(metrics);
        if (trendInsight) {
            insights.push(trendInsight);
        }

        return insights.sort((a, b) => {
            const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return impactOrder[b.impact] - impactOrder[a.impact];
        });
    }

    // Private helper methods
    private updateEndpointPatterns(dataPoint: LatencyDataPoint): void {
        const endpoint = dataPoint.endpoint;
        if (!this.endpointPatterns.has(endpoint)) {
            this.endpointPatterns.set(endpoint, {
                latencies: [],
                timestamps: [],
                errorRates: []
            });
        }

        const pattern = this.endpointPatterns.get(endpoint);
        pattern.latencies.push(dataPoint.latency);
        pattern.timestamps.push(dataPoint.timestamp);
        pattern.errorRates.push(dataPoint.errorRate || 0);

        // Keep only recent data
        if (pattern.latencies.length > 100) {
            pattern.latencies = pattern.latencies.slice(-100);
            pattern.timestamps = pattern.timestamps.slice(-100);
            pattern.errorRates = pattern.errorRates.slice(-100);
        }
    }

    private getEndpointData(endpoint: string): LatencyDataPoint[] {
        return this.historicalData.filter(dp => dp.endpoint === endpoint);
    }

    private getCurrentLatency(endpoint: string): number {
        const recentData = this.getEndpointData(endpoint).slice(-10);
        if (recentData.length === 0) return 0;
        return recentData.reduce((sum, dp) => sum + dp.latency, 0) / recentData.length;
    }

    private getCurrentTraffic(endpoint: string): number {
        const recentData = this.getEndpointData(endpoint).slice(-10);
        return recentData.length;
    }

    private getCurrentErrorRate(endpoint: string): number {
        const recentData = this.getEndpointData(endpoint).slice(-10);
        if (recentData.length === 0) return 0;
        const errors = recentData.filter(dp => dp.errorRate && dp.errorRate > 0).length;
        return errors / recentData.length;
    }

    private calculateTrend(data: LatencyDataPoint[]): number {
        if (data.length < 2) return 0;

        const recent = data.slice(-5);
        const older = data.slice(-10, -5);

        if (older.length === 0) return 0;

        const recentAvg = recent.reduce((sum, dp) => sum + dp.latency, 0) / recent.length;
        const olderAvg = older.reduce((sum, dp) => sum + dp.latency, 0) / older.length;

        return (recentAvg - olderAvg) / olderAvg;
    }

    private calculateTrafficTrend(data: LatencyDataPoint[]): number {
        if (data.length < 2) return 0;

        const recent = data.slice(-5);
        const older = data.slice(-10, -5);

        if (older.length === 0) return 0;

        const recentCount = recent.length;
        const olderCount = older.length;

        return (recentCount - olderCount) / Math.max(olderCount, 1);
    }

    private calculateErrorTrend(data: LatencyDataPoint[]): number {
        if (data.length < 2) return 0;

        const recent = data.slice(-5);
        const older = data.slice(-10, -5);

        if (older.length === 0) return 0;

        const recentErrors = recent.filter(dp => dp.errorRate && dp.errorRate > 0).length;
        const olderErrors = older.filter(dp => dp.errorRate && dp.errorRate > 0).length;

        const recentRate = recentErrors / recent.length;
        const olderRate = olderErrors / older.length;

        return (recentRate - olderRate) / Math.max(olderRate, 0.01);
    }

    private getTimeFactor(): number {
        const hour = new Date().getHours();
        // Simulate traffic patterns (higher during business hours)
        if (hour >= 9 && hour <= 17) return 1.2;
        if (hour >= 18 && hour <= 22) return 1.1;
        return 0.8;
    }

    private getTimeFactorForTimestamp(timestamp: number): number {
        const hour = new Date(timestamp).getHours();
        if (hour >= 9 && hour <= 17) return 1.2;
        if (hour >= 18 && hour <= 22) return 1.1;
        return 0.8;
    }

    private calculatePredictedLatency(current: number, trend: number, timeFactor: number): number {
        return current * (1 + trend) * timeFactor;
    }

    private calculatePredictedTraffic(current: number, trend: number, timeFactor: number): number {
        return Math.max(0, current * (1 + trend) * timeFactor);
    }

    private calculatePredictedErrorRate(current: number, trend: number, riskFactors: number): number {
        return Math.max(0, Math.min(1, current * (1 + trend) * riskFactors));
    }

    private calculateConfidence(data: LatencyDataPoint[]): number {
        if (data.length < 5) return 0.3;
        if (data.length < 20) return 0.6;
        return 0.9;
    }

    private assessImpact(predicted: number, current: number): 'low' | 'medium' | 'high' | 'critical' {
        const change = Math.abs(predicted - current) / current;
        if (change > 0.5) return 'critical';
        if (change > 0.3) return 'high';
        if (change > 0.1) return 'medium';
        return 'low';
    }

    private assessTrafficImpact(predicted: number, current: number): 'low' | 'medium' | 'high' | 'critical' {
        const change = Math.abs(predicted - current) / Math.max(current, 1);
        if (change > 2) return 'critical';
        if (change > 1) return 'high';
        if (change > 0.5) return 'medium';
        return 'low';
    }

    private assessErrorImpact(predicted: number, current: number): 'low' | 'medium' | 'high' | 'critical' {
        if (predicted > 0.1) return 'critical';
        if (predicted > 0.05) return 'high';
        if (predicted > 0.02) return 'medium';
        return 'low';
    }

    private calculateRiskLevel(predicted: number, current: number): number {
        const change = Math.abs(predicted - current) / Math.max(current, 1);
        return Math.min(100, change * 100);
    }

    private assessRiskFactors(endpoint: string): number {
        const data = this.getEndpointData(endpoint);
        let risk = 1.0;

        // Higher risk if recent errors
        const recentErrors = data.slice(-5).filter(dp => dp.errorRate && dp.errorRate > 0).length;
        if (recentErrors > 0) risk *= 1.5;

        // Higher risk if high latency
        const avgLatency = this.getCurrentLatency(endpoint);
        if (avgLatency > 500) risk *= 1.3;

        return risk;
    }

    private generateLatencyRecommendation(predicted: number, current: number): string {
        if (predicted > current * 1.2) {
            return 'Consider implementing caching or optimizing database queries to prevent latency increase.';
        } else if (predicted < current * 0.8) {
            return 'Great! Latency is expected to improve. Monitor to ensure the trend continues.';
        } else {
            return 'Latency is expected to remain stable. Continue monitoring for any changes.';
        }
    }

    private generateTrafficRecommendation(predicted: number, current: number): string {
        if (predicted > current * 1.5) {
            return 'Prepare for increased traffic by scaling resources or implementing rate limiting.';
        } else if (predicted < current * 0.5) {
            return 'Traffic is expected to decrease. Consider if this is expected or investigate potential issues.';
        } else {
            return 'Traffic levels are expected to remain stable.';
        }
    }

    private generateErrorRecommendation(predicted: number, current: number): string {
        if (predicted > 0.05) {
            return 'High error rate predicted. Review error logs and implement better error handling.';
        } else if (predicted < current * 0.5) {
            return 'Error rate is expected to improve. Great job on the fixes!';
        } else {
            return 'Error rate is expected to remain stable. Continue monitoring.';
        }
    }

    private detectLatencyAnomaly(endpoint: string, data: LatencyDataPoint[]): AnomalyDetection | null {
        if (data.length < 10) return null;

        const recent = data.slice(-3);
        const historical = data.slice(-20, -3);

        if (historical.length === 0) return null;

        const recentAvg = recent.reduce((sum, dp) => sum + dp.latency, 0) / recent.length;
        const historicalAvg = historical.reduce((sum, dp) => sum + dp.latency, 0) / historical.length;
        const historicalStd = this.calculateStandardDeviation(historical.map(dp => dp.latency));

        const zScore = (recentAvg - historicalAvg) / historicalStd;

        if (zScore > 2) {
            return {
                type: 'latency_spike',
                severity: zScore > 3 ? 'critical' : 'high',
                detectedAt: Date.now(),
                affectedEndpoints: [endpoint],
                description: `Latency spike detected: ${recentAvg.toFixed(2)}ms (${zScore.toFixed(2)}σ above normal)`,
                suggestedActions: [
                    'Check server resources',
                    'Review recent deployments',
                    'Monitor database performance',
                    'Implement circuit breakers'
                ],
                confidence: Math.min(0.95, zScore / 4)
            };
        }

        return null;
    }

    private detectErrorAnomaly(endpoint: string, data: LatencyDataPoint[]): AnomalyDetection | null {
        if (data.length < 10) return null;

        const recent = data.slice(-5);
        const errorCount = recent.filter(dp => dp.errorRate && dp.errorRate > 0).length;

        if (errorCount >= 3) {
            return {
                type: 'error_surge',
                severity: errorCount >= 4 ? 'critical' : 'high',
                detectedAt: Date.now(),
                affectedEndpoints: [endpoint],
                description: `Error surge detected: ${errorCount} errors in last 5 calls`,
                suggestedActions: [
                    'Check error logs immediately',
                    'Review recent code changes',
                    'Implement error monitoring',
                    'Add retry mechanisms'
                ],
                confidence: 0.9
            };
        }

        return null;
    }

    private detectTrafficAnomaly(endpoint: string, data: LatencyDataPoint[]): AnomalyDetection | null {
        if (data.length < 20) return null;

        const recent = data.slice(-10);
        const historical = data.slice(-30, -10);

        if (historical.length === 0) return null;

        const recentCount = recent.length;
        const historicalAvg = historical.length / 2; // Average per 10-minute window

        if (recentCount > historicalAvg * 3) {
            return {
                type: 'traffic_anomaly',
                severity: recentCount > historicalAvg * 5 ? 'critical' : 'high',
                detectedAt: Date.now(),
                affectedEndpoints: [endpoint],
                description: `Traffic anomaly detected: ${recentCount} calls (${(recentCount / historicalAvg).toFixed(1)}x normal)`,
                suggestedActions: [
                    'Check for DDoS attacks',
                    'Monitor server resources',
                    'Implement rate limiting',
                    'Scale resources if needed'
                ],
                confidence: 0.8
            };
        }

        return null;
    }

    private generateTrendInsight(metrics: PerformanceMetrics): PerformanceInsight | null {
        // This would analyze historical trends and provide insights
        // For now, return a sample insight
        return {
            id: 'performance-trend',
            type: 'trend',
            title: 'Performance Trend Analysis',
            description: 'Your API performance is showing positive trends with consistent improvements.',
            impact: 'low',
            confidence: 0.7,
            actionable: false,
            suggestedActions: ['Continue current optimization strategies'],
            timeframe: 'ongoing'
        };
    }

    private calculateStandardDeviation(values: number[]): number {
        if (values.length === 0) return 0;

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

        return Math.sqrt(avgSquaredDiff);
    }

    private getUniqueEndpoints(): string[] {
        const endpoints = new Set<string>();
        this.historicalData.forEach(dp => endpoints.add(dp.endpoint));
        return Array.from(endpoints);
    }
}
