import * as vscode from 'vscode';
import { MLPredictiveEngine, PredictionResult, AnomalyDetection, PerformanceInsight } from './MLPredictiveEngine';
import { PerformanceMetrics, EndpointStats } from '../types';

export interface AlertRule {
    id: string;
    name: string;
    description: string;
    type: 'threshold' | 'anomaly' | 'prediction' | 'trend';
    condition: string;
    threshold?: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    endpoints?: string[];
    actions: AlertAction[];
    cooldown: number; // minutes
    lastTriggered?: number;
}

export interface AlertAction {
    type: 'notification' | 'email' | 'webhook' | 'slack' | 'teams' | 'command';
    config: any;
    enabled: boolean;
}

export interface Alert {
    id: string;
    ruleId: string;
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
    resolved: boolean;
    resolvedAt?: number;
    data: any;
    actions: AlertAction[];
}

export interface AlertChannel {
    id: string;
    name: string;
    type: 'email' | 'slack' | 'teams' | 'webhook' | 'discord';
    config: any;
    enabled: boolean;
}

export class SmartAlertingSystem {
    private alerts: Map<string, Alert> = new Map();
    private alertRules: Map<string, AlertRule> = new Map();
    private alertChannels: Map<string, AlertChannel> = new Map();
    private mlEngine: MLPredictiveEngine;
    private eventEmitter = new vscode.EventEmitter<Alert>();
    private anomalyCooldowns: Map<string, number> = new Map(); // Track last anomaly alert time by key
    private lastPredictionAlert: Map<string, number> = new Map(); // Track last prediction alert time by endpoint+type

    public readonly onAlert = this.eventEmitter.event;

    constructor(mlEngine: MLPredictiveEngine) {
        this.mlEngine = mlEngine;
        this.initializeDefaultRules();
        this.initializeDefaultChannels();
    }

    private initializeDefaultRules(): void {
        const defaultRules: AlertRule[] = [
            {
                id: 'high-latency',
                name: 'High Latency Alert',
                description: 'Alert when average latency exceeds threshold',
                type: 'threshold',
                condition: 'average_latency > threshold',
                threshold: 500,
                severity: 'high',
                enabled: true,
                actions: [
                    {
                        type: 'notification',
                        config: { sound: true, persistent: true },
                        enabled: true
                    }
                ],
                cooldown: 15
            },
            {
                id: 'error-rate-spike',
                name: 'Error Rate Spike',
                description: 'Alert when error rate increases significantly',
                type: 'anomaly',
                condition: 'error_rate > 5%',
                threshold: 0.05,
                severity: 'critical',
                enabled: true,
                actions: [
                    {
                        type: 'notification',
                        config: { sound: true, persistent: true },
                        enabled: true
                    },
                    {
                        type: 'slack',
                        config: { channel: '#alerts', mention: '@channel' },
                        enabled: false
                    }
                ],
                cooldown: 5
            },
            {
                id: 'latency-prediction',
                name: 'Latency Prediction Alert',
                description: 'Alert when ML predicts latency will increase',
                type: 'prediction',
                condition: 'predicted_latency > current_latency * 1.5',
                severity: 'medium',
                enabled: true,
                actions: [
                    {
                        type: 'notification',
                        config: { sound: false, persistent: false },
                        enabled: true
                    }
                ],
                cooldown: 30
            },
            {
                id: 'traffic-anomaly',
                name: 'Traffic Anomaly',
                description: 'Alert when traffic patterns are unusual',
                type: 'anomaly',
                condition: 'traffic > normal * 3',
                severity: 'high',
                enabled: true,
                actions: [
                    {
                        type: 'notification',
                        config: { sound: true, persistent: true },
                        enabled: true
                    }
                ],
                cooldown: 10
            },
            {
                id: 'performance-degradation',
                name: 'Performance Degradation',
                description: 'Alert when overall performance score drops',
                type: 'threshold',
                condition: 'performance_score < 70',
                threshold: 70,
                severity: 'medium',
                enabled: true,
                actions: [
                    {
                        type: 'notification',
                        config: { sound: false, persistent: false },
                        enabled: true
                    }
                ],
                cooldown: 60
            }
        ];

        defaultRules.forEach(rule => {
            this.alertRules.set(rule.id, rule);
        });
    }

    private initializeDefaultChannels(): void {
        const defaultChannels: AlertChannel[] = [
            {
                id: 'vscode-notifications',
                name: 'VSCode Notifications',
                type: 'webhook',
                config: {
                    endpoint: 'vscode://notifications',
                    sound: true,
                    persistent: true
                },
                enabled: true
            },
            {
                id: 'email-alerts',
                name: 'Email Alerts',
                type: 'email',
                config: {
                    recipients: ['admin@company.com'],
                    subject: 'APIViz Alert: {title}',
                    template: 'alert-email-template'
                },
                enabled: false
            },
            {
                id: 'slack-alerts',
                name: 'Slack Alerts',
                type: 'slack',
                config: {
                    webhook: 'https://hooks.slack.com/services/...',
                    channel: '#alerts',
                    username: 'APIViz Bot',
                    icon: ':warning:'
                },
                enabled: false
            }
        ];

        defaultChannels.forEach(channel => {
            this.alertChannels.set(channel.id, channel);
        });
    }

    public processMetrics(metrics: PerformanceMetrics): void {
        // Check all enabled rules
        this.alertRules.forEach(rule => {
            if (!rule.enabled) return;

            // Check cooldown
            if (rule.lastTriggered && Date.now() - rule.lastTriggered < rule.cooldown * 60 * 1000) {
                return;
            }

            const shouldTrigger = this.evaluateRule(rule, metrics);
            if (shouldTrigger) {
                this.triggerAlert(rule, metrics);
            }
        });

        // Check for anomalies
        const anomalies = this.mlEngine.detectAnomalies();
        anomalies.forEach(anomaly => {
            this.handleAnomalyWithCooldown(anomaly);
        });

        // Check predictions
        this.checkPredictions(metrics);
    }

    private evaluateRule(rule: AlertRule, metrics: PerformanceMetrics): boolean {
        switch (rule.type) {
            case 'threshold':
                return this.evaluateThresholdRule(rule, metrics);
            case 'anomaly':
                return this.evaluateAnomalyRule(rule, metrics);
            case 'prediction':
                return this.evaluatePredictionRule(rule, metrics);
            case 'trend':
                return this.evaluateTrendRule(rule, metrics);
            default:
                return false;
        }
    }

    private evaluateThresholdRule(rule: AlertRule, metrics: PerformanceMetrics): boolean {
        if (!rule.threshold) return false;

        switch (rule.condition) {
            case 'average_latency > threshold':
                return metrics.averageLatency > rule.threshold;
            case 'performance_score < threshold':
                // Calculate performance score where higher latency = worse performance
                const performanceScore = metrics.averageLatency;
                return performanceScore > rule.threshold; // Performance degrades when score exceeds threshold
            case 'error_rate > threshold':
                const computedErrorRate = metrics.errorRate || 0;
                // Normalize threshold: if <= 1, treat as fraction and convert to percentage
                const normalizedThreshold = rule.threshold <= 1 ? rule.threshold * 100 : rule.threshold;
                return computedErrorRate > normalizedThreshold;
            default:
                return false;
        }
    }

    private evaluateAnomalyRule(rule: AlertRule, metrics: PerformanceMetrics): boolean {
        const anomalies = this.mlEngine.detectAnomalies();
        return anomalies.some(anomaly => {
            if (rule.condition.includes('error_rate') && anomaly.type === 'error_surge') {
                return true;
            }
            if (rule.condition.includes('traffic') && anomaly.type === 'traffic_anomaly') {
                return true;
            }
            return false;
        });
    }

    private evaluatePredictionRule(rule: AlertRule, metrics: PerformanceMetrics): boolean {
        // This would evaluate ML predictions
        // For now, return false as predictions are handled separately
        return false;
    }

    private evaluateTrendRule(rule: AlertRule, metrics: PerformanceMetrics): boolean {
        // This would evaluate trend-based conditions
        return false;
    }

    private triggerAlert(rule: AlertRule, metrics: PerformanceMetrics): void {
        const alert: Alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            title: rule.name,
            message: this.generateAlertMessage(rule, metrics),
            severity: rule.severity,
            timestamp: Date.now(),
            resolved: false,
            data: { metrics, rule },
            actions: rule.actions
        };

        this.alerts.set(alert.id, alert);
        rule.lastTriggered = Date.now();

        // Execute alert actions
        this.executeAlertActions(alert);

        // Emit event
        this.eventEmitter.fire(alert);
    }

    private handleAnomalyWithCooldown(anomaly: AnomalyDetection): void {
        // Create a unique key for this anomaly based on type and affected endpoints
        const anomalyKey = `${anomaly.type}-${anomaly.affectedEndpoints?.sort().join(',') || 'global'}`;
        const now = Date.now();
        const cooldownPeriod = 5 * 60 * 1000; // 5 minutes cooldown

        // Check if we've already alerted for this anomaly recently
        const lastAlertTime = this.anomalyCooldowns.get(anomalyKey);
        if (lastAlertTime && (now - lastAlertTime) < cooldownPeriod) {
            return; // Skip this anomaly due to cooldown
        }

        // Check if there's already an active alert for this anomaly
        const existingAlert = Array.from(this.alerts.values()).find(alert =>
            alert.ruleId === 'anomaly-detection' &&
            !alert.resolved &&
            alert.data?.anomaly?.type === anomaly.type &&
            JSON.stringify(alert.data?.anomaly?.affectedEndpoints?.sort()) ===
            JSON.stringify(anomaly.affectedEndpoints?.sort())
        );

        if (existingAlert) {
            return; // Skip if there's already an active alert for this anomaly
        }

        // Update cooldown and create new alert
        this.anomalyCooldowns.set(anomalyKey, now);
        this.handleAnomaly(anomaly);
    }

    private handleAnomaly(anomaly: AnomalyDetection): void {
        const alert: Alert = {
            id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: 'anomaly-detection',
            title: `Anomaly Detected: ${anomaly.type.replace('_', ' ').toUpperCase()}`,
            message: anomaly.description,
            severity: anomaly.severity,
            timestamp: Date.now(),
            resolved: false,
            data: { anomaly },
            actions: [
                {
                    type: 'notification',
                    config: { sound: true, persistent: true },
                    enabled: true
                }
            ]
        };

        this.alerts.set(alert.id, alert);
        this.executeAlertActions(alert);
        this.eventEmitter.fire(alert);
    }

    private checkPredictions(metrics: PerformanceMetrics): void {
        // Check predictions for each endpoint
        const endpoints = metrics.topEndpoints?.map((e: EndpointStats) => e.endpoint) || [];

        endpoints.forEach((endpoint: string) => {
            const prediction = this.mlEngine.predictLatency(endpoint, '1h');

            if (prediction.riskLevel > 70) {
                this.handlePredictionAlert(endpoint, prediction);
            } else {
                // Clear cooldown if risk level drops below threshold
                const predictionKey = `${endpoint}-latency`;
                this.lastPredictionAlert.delete(predictionKey);
            }
        });
    }

    private handlePredictionAlert(endpoint: string, prediction: any): void {
        const predictionKey = `${endpoint}-${prediction.type}`;
        const now = Date.now();
        const cooldownPeriod = 15 * 60 * 1000; // 15 minutes cooldown

        // Check if we've already alerted for this prediction recently
        const lastAlertTime = this.lastPredictionAlert.get(predictionKey);
        if (lastAlertTime && (now - lastAlertTime) < cooldownPeriod) {
            return; // Skip this prediction due to cooldown
        }

        // Check if there's already an active alert for this prediction
        const existingAlert = Array.from(this.alerts.values()).find(alert =>
            alert.ruleId === 'latency-prediction' &&
            !alert.resolved &&
            alert.data?.endpoint === endpoint &&
            alert.data?.prediction?.type === prediction.type
        );

        if (existingAlert) {
            return; // Skip if there's already an active alert for this prediction
        }

        // Update cooldown and create new alert
        this.lastPredictionAlert.set(predictionKey, now);

        const alert: Alert = {
            id: `prediction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: 'latency-prediction',
            title: `High Risk Prediction: ${endpoint}`,
            message: `ML predicts ${prediction.trend} latency trend with ${prediction.confidence * 100}% confidence. Risk level: ${prediction.riskLevel}%`,
            severity: prediction.impact,
            timestamp: Date.now(),
            resolved: false,
            data: { prediction, endpoint },
            actions: [
                {
                    type: 'notification',
                    config: { sound: false, persistent: false },
                    enabled: true
                }
            ]
        };

        this.alerts.set(alert.id, alert);
        this.executeAlertActions(alert);
        this.eventEmitter.fire(alert);
    }

    private generateAlertMessage(rule: AlertRule, metrics: PerformanceMetrics): string {
        switch (rule.id) {
            case 'high-latency':
                return `Average latency is ${metrics.averageLatency.toFixed(2)}ms, exceeding threshold of ${rule.threshold}ms.`;
            case 'error-rate-spike':
                return `Error rate has spiked to ${metrics.errorEndpoints?.length || 0} endpoints with errors.`;
            case 'performance-degradation':
                return `Performance score has dropped below ${rule.threshold}. Current average latency: ${metrics.averageLatency.toFixed(2)}ms.`;
            default:
                return `Alert triggered: ${rule.description}`;
        }
    }

    private executeAlertActions(alert: Alert): void {
        alert.actions.forEach(action => {
            if (!action.enabled) return;

            switch (action.type) {
                case 'notification':
                    this.sendVSCodeNotification(alert, action.config);
                    break;
                case 'email':
                    this.sendEmail(alert, action.config);
                    break;
                case 'slack':
                    this.sendSlackMessage(alert, action.config);
                    break;
                case 'teams':
                    this.sendTeamsMessage(alert, action.config);
                    break;
                case 'webhook':
                    this.sendWebhook(alert, action.config);
                    break;
                case 'command':
                    this.executeCommand(alert, action.config);
                    break;
            }
        });
    }

    private sendVSCodeNotification(alert: Alert, config: any): void {
        const severityIcons = {
            low: 'ℹ️',
            medium: '⚠️',
            high: '🚨',
            critical: '🔥'
        };

        const icon = severityIcons[alert.severity];
        const message = `${icon} ${alert.title}: ${alert.message}`;

        if (config.persistent) {
            vscode.window.showErrorMessage(message);
        } else {
            vscode.window.showWarningMessage(message);
        }

        if (config.sound) {
            // VSCode doesn't have direct sound control, but we can use status bar
            vscode.window.setStatusBarMessage(`🔔 ${alert.title}`, 5000);
        }
    }

    private sendEmail(alert: Alert, config: any): void {
        // In a real implementation, this would send actual emails
        console.log(`Email alert sent to ${config.recipients.join(', ')}: ${alert.title}`);
    }

    private sendSlackMessage(alert: Alert, config: any): void {
        // In a real implementation, this would send to Slack
        console.log(`Slack message sent to ${config.channel}: ${alert.title}`);
    }

    private sendTeamsMessage(alert: Alert, config: any): void {
        // In a real implementation, this would send to Microsoft Teams
        console.log(`Teams message sent: ${alert.title}`);
    }

    private sendWebhook(alert: Alert, config: any): void {
        // In a real implementation, this would send HTTP requests
        console.log(`Webhook sent to ${config.endpoint}: ${alert.title}`);
    }

    private executeCommand(alert: Alert, config: any): void {
        // In a real implementation, this would execute system commands
        console.log(`Command executed: ${config.command} for alert: ${alert.title}`);
    }

    // Public API methods
    public getAlerts(): Alert[] {
        return Array.from(this.alerts.values()).sort((a, b) => b.timestamp - a.timestamp);
    }

    public getActiveAlerts(): Alert[] {
        return this.getAlerts().filter(alert => !alert.resolved);
    }

    public getAlertRules(): AlertRule[] {
        return Array.from(this.alertRules.values());
    }

    public getAlertChannels(): AlertChannel[] {
        return Array.from(this.alertChannels.values());
    }

    public createAlertRule(rule: Omit<AlertRule, 'id'>): string {
        const id = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newRule: AlertRule = { ...rule, id };
        this.alertRules.set(id, newRule);
        return id;
    }

    public updateAlertRule(id: string, updates: Partial<AlertRule>): boolean {
        const rule = this.alertRules.get(id);
        if (!rule) return false;

        Object.assign(rule, updates);
        this.alertRules.set(id, rule);
        return true;
    }

    public deleteAlertRule(id: string): boolean {
        return this.alertRules.delete(id);
    }

    public resolveAlert(alertId: string): boolean {
        const alert = this.alerts.get(alertId);
        if (!alert) return false;

        alert.resolved = true;
        alert.resolvedAt = Date.now();
        this.alerts.set(alertId, alert);

        // Clean up cooldown tracking when alert is resolved
        this.cleanupCooldownTracking(alert);

        return true;
    }

    private cleanupCooldownTracking(alert: Alert): void {
        // Clean up prediction alert cooldowns
        if (alert.ruleId === 'latency-prediction' && alert.data?.endpoint && alert.data?.prediction?.type) {
            const predictionKey = `${alert.data.endpoint}-${alert.data.prediction.type}`;
            this.lastPredictionAlert.delete(predictionKey);
        }

        // Clean up anomaly alert cooldowns
        if (alert.ruleId === 'anomaly-detection' && alert.data?.anomaly) {
            const anomaly = alert.data.anomaly;
            const anomalyKey = `${anomaly.type}-${anomaly.affectedEndpoints?.sort().join(',') || 'global'}`;
            this.anomalyCooldowns.delete(anomalyKey);
        }
    }

    public createAlertChannel(channel: Omit<AlertChannel, 'id'>): string {
        const id = `channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newChannel: AlertChannel = { ...channel, id };
        this.alertChannels.set(id, newChannel);
        return id;
    }

    public updateAlertChannel(id: string, updates: Partial<AlertChannel>): boolean {
        const channel = this.alertChannels.get(id);
        if (!channel) return false;

        Object.assign(channel, updates);
        this.alertChannels.set(id, channel);
        return true;
    }

    public deleteAlertChannel(id: string): boolean {
        return this.alertChannels.delete(id);
    }

    public getAlertStats(): any {
        const alerts = this.getAlerts();
        const activeAlerts = this.getActiveAlerts();

        return {
            total: alerts.length,
            active: activeAlerts.length,
            resolved: alerts.length - activeAlerts.length,
            bySeverity: {
                low: alerts.filter(a => a.severity === 'low').length,
                medium: alerts.filter(a => a.severity === 'medium').length,
                high: alerts.filter(a => a.severity === 'high').length,
                critical: alerts.filter(a => a.severity === 'critical').length
            },
            rulesEnabled: Array.from(this.alertRules.values()).filter(r => r.enabled).length,
            channelsEnabled: Array.from(this.alertChannels.values()).filter(c => c.enabled).length
        };
    }
}
