import * as vscode from 'vscode';
import { MLPredictiveEngine, PredictionResult, AnomalyDetection, PerformanceInsight, ForecastData } from '../services/MLPredictiveEngine';
import { SmartAlertingSystem, Alert, AlertRule, AlertChannel } from '../services/SmartAlertingSystem';
import { DataProcessor } from '../services/DataProcessor';

export class PredictiveAnalyticsWebview {
    private panel: vscode.WebviewPanel | undefined;
    private mlEngine: MLPredictiveEngine;
    private alertingSystem: SmartAlertingSystem;
    private dataProcessor: DataProcessor;

    constructor(dataProcessor: DataProcessor) {
        this.dataProcessor = dataProcessor;
        this.mlEngine = new MLPredictiveEngine();
        this.alertingSystem = new SmartAlertingSystem(this.mlEngine);
    }

    public createWebview(context: vscode.ExtensionContext): vscode.WebviewPanel {
        this.panel = vscode.window.createWebviewPanel(
            'apivizPredictiveAnalytics',
            'APIViz Predictive Analytics',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getWebviewContent();

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'getPredictions':
                        this.sendPredictions();
                        break;
                    case 'getForecast':
                        this.sendForecast(message.endpoint, message.hours);
                        break;
                    case 'getAnomalies':
                        this.sendAnomalies();
                        break;
                    case 'getAlerts':
                        this.sendAlerts();
                        break;
                    case 'getInsights':
                        this.sendInsights();
                        break;
                    case 'createAlertRule':
                        this.createAlertRule(message.rule);
                        break;
                    case 'updateAlertRule':
                        this.updateAlertRule(message.id, message.updates);
                        break;
                    case 'resolveAlert':
                        this.resolveAlert(message.alertId);
                        break;
                    case 'testPrediction':
                        this.testPrediction(message.endpoint);
                        break;
                }
            },
            undefined,
            context.subscriptions
        );

        // Send initial data
        this.sendInitialData();

        // Set up data refresh
        const refreshInterval = setInterval(() => {
            if (this.panel && this.panel.visible) {
                this.updateMLData();
                this.sendPredictions();
                this.sendAnomalies();
                this.sendAlerts();
            }
        }, 5000);

        this.panel.onDidDispose(() => {
            clearInterval(refreshInterval);
        });

        return this.panel;
    }

    private updateMLData(): void {
        const latencyData = this.dataProcessor.getLatencyDataPoints();
        latencyData.forEach(dataPoint => {
            this.mlEngine.addDataPoint(dataPoint);
        });

        const metrics = this.dataProcessor.getPerformanceMetrics();
        this.alertingSystem.processMetrics(metrics);
    }

    private sendInitialData(): void {
        this.updateMLData();
        this.sendPredictions();
        this.sendAnomalies();
        this.sendAlerts();
        this.sendInsights();
    }

    private sendPredictions(): void {
        if (!this.panel) return;

        const endpoints = this.dataProcessor.getEndpointStats().map(e => e.endpoint);
        const predictions: PredictionResult[] = [];

        endpoints.forEach(endpoint => {
            predictions.push(this.mlEngine.predictLatency(endpoint, '1h'));
            predictions.push(this.mlEngine.predictTraffic(endpoint, '1h'));
            predictions.push(this.mlEngine.predictErrors(endpoint, '1h'));
        });

        this.panel.webview.postMessage({
            type: 'predictions',
            data: predictions
        });
    }

    private sendForecast(endpoint: string, hours: number = 24): void {
        if (!this.panel) return;

        const forecast = this.mlEngine.generateForecast(endpoint, hours);
        this.panel.webview.postMessage({
            type: 'forecast',
            data: { endpoint, forecast }
        });
    }

    private sendAnomalies(): void {
        if (!this.panel) return;

        const anomalies = this.mlEngine.detectAnomalies();
        this.panel.webview.postMessage({
            type: 'anomalies',
            data: anomalies
        });
    }

    private sendAlerts(): void {
        if (!this.panel) return;

        const alerts = this.alertingSystem.getAlerts();
        const alertRules = this.alertingSystem.getAlertRules();
        const alertChannels = this.alertingSystem.getAlertChannels();
        const alertStats = this.alertingSystem.getAlertStats();

        this.panel.webview.postMessage({
            type: 'alerts',
            data: { alerts, alertRules, alertChannels, alertStats }
        });
    }

    private sendInsights(): void {
        if (!this.panel) return;

        const metrics = this.dataProcessor.getPerformanceMetrics();
        const insights = this.mlEngine.generateInsights(metrics);

        this.panel.webview.postMessage({
            type: 'insights',
            data: insights
        });
    }

    private createAlertRule(rule: any): void {
        const ruleId = this.alertingSystem.createAlertRule(rule);
        vscode.window.showInformationMessage(`Alert rule "${rule.name}" created successfully! 🎯`);
        this.sendAlerts();
    }

    private updateAlertRule(id: string, updates: any): void {
        const success = this.alertingSystem.updateAlertRule(id, updates);
        if (success) {
            vscode.window.showInformationMessage('Alert rule updated successfully! ✅');
            this.sendAlerts();
        } else {
            vscode.window.showErrorMessage('Failed to update alert rule! ❌');
        }
    }

    private resolveAlert(alertId: string): void {
        const success = this.alertingSystem.resolveAlert(alertId);
        if (success) {
            vscode.window.showInformationMessage('Alert resolved! ✅');
            this.sendAlerts();
        } else {
            vscode.window.showErrorMessage('Failed to resolve alert! ❌');
        }
    }

    private testPrediction(endpoint: string): void {
        const prediction = this.mlEngine.predictLatency(endpoint, '1h');
        vscode.window.showInformationMessage(
            `Prediction for ${endpoint}: ${prediction.predictedValue}ms (${prediction.confidence * 100}% confidence) 🎯`
        );
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APIViz Predictive Analytics</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .tabs {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 30px;
        }
        
        .tab {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .tab:hover, .tab.active {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .card h2 {
            margin-top: 0;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .prediction-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .prediction-card {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 15px;
            padding: 20px;
            border-left: 5px solid;
        }
        
        .prediction-card.latency {
            border-left-color: #007bff;
        }
        
        .prediction-card.traffic {
            border-left-color: #28a745;
        }
        
        .prediction-card.error {
            border-left-color: #dc3545;
        }
        
        .prediction-value {
            font-size: 2em;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .prediction-confidence {
            background: #e9ecef;
            border-radius: 20px;
            padding: 5px 15px;
            font-size: 0.9em;
            display: inline-block;
            margin: 10px 0;
        }
        
        .trend-indicator {
            display: flex;
            align-items: center;
            gap: 5px;
            margin: 10px 0;
        }
        
        .trend-up {
            color: #dc3545;
        }
        
        .trend-down {
            color: #28a745;
        }
        
        .trend-stable {
            color: #6c757d;
        }
        
        .anomaly-list {
            display: grid;
            gap: 15px;
        }
        
        .anomaly-item {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            border-left: 5px solid;
        }
        
        .anomaly-item.critical {
            border-left-color: #dc3545;
            background: #f8d7da;
        }
        
        .anomaly-item.high {
            border-left-color: #fd7e14;
            background: #fff3cd;
        }
        
        .anomaly-item.medium {
            border-left-color: #ffc107;
            background: #fff3cd;
        }
        
        .anomaly-item.low {
            border-left-color: #28a745;
            background: #d4edda;
        }
        
        .alert-list {
            display: grid;
            gap: 15px;
        }
        
        .alert-item {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            border-left: 5px solid;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .alert-item.critical {
            border-left-color: #dc3545;
            background: #f8d7da;
        }
        
        .alert-item.high {
            border-left-color: #fd7e14;
            background: #fff3cd;
        }
        
        .alert-item.medium {
            border-left-color: #ffc107;
            background: #fff3cd;
        }
        
        .alert-item.low {
            border-left-color: #28a745;
            background: #d4edda;
        }
        
        .alert-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background 0.3s ease;
        }
        
        .btn:hover {
            background: #0056b3;
        }
        
        .btn-success {
            background: #28a745;
        }
        
        .btn-success:hover {
            background: #1e7e34;
        }
        
        .btn-danger {
            background: #dc3545;
        }
        
        .btn-danger:hover {
            background: #c82333;
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .btn-secondary:hover {
            background: #545b62;
        }
        
        .insight-list {
            display: grid;
            gap: 15px;
        }
        
        .insight-item {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            border-left: 5px solid;
        }
        
        .insight-item.critical {
            border-left-color: #dc3545;
        }
        
        .insight-item.high {
            border-left-color: #fd7e14;
        }
        
        .insight-item.medium {
            border-left-color: #ffc107;
        }
        
        .insight-item.low {
            border-left-color: #28a745;
        }
        
        .insight-actions {
            margin-top: 15px;
        }
        
        .insight-actions ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .insight-actions li {
            margin: 5px 0;
        }
        
        .chart-container {
            position: relative;
            height: 400px;
            margin: 20px 0;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
        }
        
        .form-group textarea {
            height: 100px;
            resize: vertical;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔮 APIViz Predictive Analytics</h1>
            <p>AI-powered predictions, anomaly detection, and smart alerting for your API performance</p>
        </div>
        
        <div class="tabs">
            <button class="tab active" onclick="showTab('predictions')">🎯 Predictions</button>
            <button class="tab" onclick="showTab('anomalies')">🚨 Anomalies</button>
            <button class="tab" onclick="showTab('alerts')">🔔 Alerts</button>
            <button class="tab" onclick="showTab('insights')">💡 Insights</button>
            <button class="tab" onclick="showTab('forecast')">📈 Forecast</button>
        </div>
        
        <!-- Predictions Tab -->
        <div id="predictions" class="tab-content active">
            <div class="card">
                <h2>🎯 ML Predictions</h2>
                <div id="predictions-content">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Loading predictions...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Anomalies Tab -->
        <div id="anomalies" class="tab-content">
            <div class="card">
                <h2>🚨 Anomaly Detection</h2>
                <div id="anomalies-content">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Scanning for anomalies...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Alerts Tab -->
        <div id="alerts" class="tab-content">
            <div class="card">
                <h2>🔔 Smart Alerts</h2>
                <div id="alerts-content">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Loading alerts...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Insights Tab -->
        <div id="insights" class="tab-content">
            <div class="card">
                <h2>💡 AI Insights</h2>
                <div id="insights-content">
                    <div class="loading">
                        <div class="spinner"></div>
                        <p>Generating insights...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Forecast Tab -->
        <div id="forecast" class="tab-content">
            <div class="card">
                <h2>📈 Performance Forecast</h2>
                <div class="form-group">
                    <label for="forecast-endpoint">Select Endpoint:</label>
                    <select id="forecast-endpoint">
                        <option value="">Loading endpoints...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="forecast-hours">Forecast Hours:</label>
                    <select id="forecast-hours">
                        <option value="6">6 hours</option>
                        <option value="12">12 hours</option>
                        <option value="24" selected>24 hours</option>
                        <option value="48">48 hours</option>
                        <option value="72">72 hours</option>
                    </select>
                </div>
                <button class="btn" onclick="generateForecast()">Generate Forecast</button>
                <div id="forecast-content">
                    <div class="no-data">
                        <p>Select an endpoint and click "Generate Forecast" to see predictions</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentTab = 'predictions';
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'predictions':
                    updatePredictions(message.data);
                    break;
                case 'anomalies':
                    updateAnomalies(message.data);
                    break;
                case 'alerts':
                    updateAlerts(message.data);
                    break;
                case 'insights':
                    updateInsights(message.data);
                    break;
                case 'forecast':
                    updateForecast(message.data);
                    break;
            }
        });
        
        function showTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
            currentTab = tabName;
            
            // Request data for the tab
            switch (tabName) {
                case 'predictions':
                    vscode.postMessage({ command: 'getPredictions' });
                    break;
                case 'anomalies':
                    vscode.postMessage({ command: 'getAnomalies' });
                    break;
                case 'alerts':
                    vscode.postMessage({ command: 'getAlerts' });
                    break;
                case 'insights':
                    vscode.postMessage({ command: 'getInsights' });
                    break;
            }
        }
        
        function updatePredictions(predictions) {
            const content = document.getElementById('predictions-content');
            
            if (predictions.length === 0) {
                content.innerHTML = '<div class="no-data"><p>No predictions available yet. Start monitoring your APIs!</p></div>';
                return;
            }
            
            const groupedPredictions = groupPredictionsByEndpoint(predictions);
            
            let html = '<div class="prediction-grid">';
            
            Object.keys(groupedPredictions).forEach(endpoint => {
                const endpointPredictions = groupedPredictions[endpoint];
                
                endpointPredictions.forEach(prediction => {
                    const trendIcon = getTrendIcon(prediction.trend);
                    const trendClass = getTrendClass(prediction.trend);
                    
                    html += \`
                        <div class="prediction-card \${prediction.type}">
                            <h3>\${endpoint}</h3>
                            <div class="prediction-value">\${prediction.predictedValue}\${getUnit(prediction.type)}</div>
                            <div class="prediction-confidence">Confidence: \${(prediction.confidence * 100).toFixed(1)}%</div>
                            <div class="trend-indicator \${trendClass}">
                                \${trendIcon} \${prediction.trend.toUpperCase()}
                            </div>
                            <p><strong>Impact:</strong> \${prediction.impact.toUpperCase()}</p>
                            <p><strong>Risk Level:</strong> \${prediction.riskLevel}%</p>
                            <p><strong>Recommendation:</strong> \${prediction.recommendation}</p>
                        </div>
                    \`;
                });
            });
            
            html += '</div>';
            content.innerHTML = html;
        }
        
        function updateAnomalies(anomalies) {
            const content = document.getElementById('anomalies-content');
            
            if (anomalies.length === 0) {
                content.innerHTML = '<div class="no-data"><p>No anomalies detected. Your APIs are running smoothly! 🎉</p></div>';
                return;
            }
            
            let html = '<div class="anomaly-list">';
            
            anomalies.forEach(anomaly => {
                html += \`
                    <div class="anomaly-item \${anomaly.severity}">
                        <h3>\${anomaly.type.replace('_', ' ').toUpperCase()}</h3>
                        <p><strong>Severity:</strong> \${anomaly.severity.toUpperCase()}</p>
                        <p><strong>Description:</strong> \${anomaly.description}</p>
                        <p><strong>Confidence:</strong> \${(anomaly.confidence * 100).toFixed(1)}%</p>
                        <p><strong>Affected Endpoints:</strong> \${anomaly.affectedEndpoints.join(', ')}</p>
                        <div class="insight-actions">
                            <strong>Suggested Actions:</strong>
                            <ul>
                                \${anomaly.suggestedActions.map(action => \`<li>\${action}</li>\`).join('')}
                            </ul>
                        </div>
                    </div>
                \`;
            });
            
            html += '</div>';
            content.innerHTML = html;
        }
        
        function updateAlerts(data) {
            const content = document.getElementById('alerts-content');
            const { alerts, alertRules, alertChannels, alertStats } = data;
            
            let html = \`
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">\${alertStats.total}</div>
                        <div class="stat-label">Total Alerts</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">\${alertStats.active}</div>
                        <div class="stat-label">Active Alerts</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">\${alertStats.critical}</div>
                        <div class="stat-label">Critical</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">\${alertStats.rulesEnabled}</div>
                        <div class="stat-label">Rules Enabled</div>
                    </div>
                </div>
            \`;
            
            if (alerts.length === 0) {
                html += '<div class="no-data"><p>No alerts triggered. Your monitoring is working perfectly! ✅</p></div>';
            } else {
                html += '<div class="alert-list">';
                
                alerts.forEach(alert => {
                    const isResolved = alert.resolved ? 'resolved' : 'active';
                    const resolvedAt = alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '';
                    
                    html += \`
                        <div class="alert-item \${alert.severity}">
                            <div>
                                <h3>\${alert.title}</h3>
                                <p>\${alert.message}</p>
                                <p><strong>Status:</strong> \${isResolved.toUpperCase()}</p>
                                <p><strong>Triggered:</strong> \${new Date(alert.timestamp).toLocaleString()}</p>
                                \${resolvedAt ? \`<p><strong>Resolved:</strong> \${resolvedAt}</p>\` : ''}
                            </div>
                            <div class="alert-actions">
                                \${!alert.resolved ? \`
                                    <button class="btn btn-success" onclick="resolveAlert('\${alert.id}')">Resolve</button>
                                \` : ''}
                            </div>
                        </div>
                    \`;
                });
                
                html += '</div>';
            }
            
            content.innerHTML = html;
        }
        
        function updateInsights(insights) {
            const content = document.getElementById('insights-content');
            
            if (insights.length === 0) {
                content.innerHTML = '<div class="no-data"><p>No insights available yet. Keep monitoring your APIs!</p></div>';
                return;
            }
            
            let html = '<div class="insight-list">';
            
            insights.forEach(insight => {
                html += \`
                    <div class="insight-item \${insight.impact}">
                        <h3>\${insight.title}</h3>
                        <p><strong>Type:</strong> \${insight.type.toUpperCase()}</p>
                        <p><strong>Impact:</strong> \${insight.impact.toUpperCase()}</p>
                        <p><strong>Confidence:</strong> \${(insight.confidence * 100).toFixed(1)}%</p>
                        <p><strong>Timeframe:</strong> \${insight.timeframe}</p>
                        <p>\${insight.description}</p>
                        \${insight.affectedEndpoints ? \`
                            <p><strong>Affected Endpoints:</strong> \${insight.affectedEndpoints.join(', ')}</p>
                        \` : ''}
                        <div class="insight-actions">
                            <strong>Suggested Actions:</strong>
                            <ul>
                                \${insight.suggestedActions.map(action => \`<li>\${action}</li>\`).join('')}
                            </ul>
                        </div>
                    </div>
                \`;
            });
            
            html += '</div>';
            content.innerHTML = html;
        }
        
        function updateForecast(data) {
            const content = document.getElementById('forecast-content');
            const { endpoint, forecast } = data;
            
            if (forecast.length === 0) {
                content.innerHTML = '<div class="no-data"><p>No forecast data available for this endpoint.</p></div>';
                return;
            }
            
            // Create chart
            const ctx = document.createElement('canvas');
            ctx.width = 800;
            ctx.height = 400;
            content.innerHTML = '';
            content.appendChild(ctx);
            
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: forecast.map(f => new Date(f.timestamp).toLocaleString()),
                    datasets: [
                        {
                            label: 'Predicted Latency (ms)',
                            data: forecast.map(f => f.predictedLatency),
                            borderColor: '#007bff',
                            backgroundColor: 'rgba(0, 123, 255, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Predicted Traffic',
                            data: forecast.map(f => f.predictedTraffic),
                            borderColor: '#28a745',
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            tension: 0.4,
                            yAxisID: 'y1'
                        },
                        {
                            label: 'Predicted Errors (%)',
                            data: forecast.map(f => f.predictedErrors * 100),
                            borderColor: '#dc3545',
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            tension: 0.4,
                            yAxisID: 'y2'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Latency (ms)'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Traffic'
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                        },
                        y2: {
                            type: 'linear',
                            display: false,
                            position: 'right',
                            title: {
                                display: true,
                                text: 'Error Rate (%)'
                            }
                        }
                    }
                }
            });
        }
        
        function generateForecast() {
            const endpoint = document.getElementById('forecast-endpoint').value;
            const hours = parseInt(document.getElementById('forecast-hours').value);
            
            if (!endpoint) {
                alert('Please select an endpoint');
                return;
            }
            
            vscode.postMessage({
                command: 'getForecast',
                endpoint: endpoint,
                hours: hours
            });
        }
        
        function resolveAlert(alertId) {
            vscode.postMessage({
                command: 'resolveAlert',
                alertId: alertId
            });
        }
        
        function groupPredictionsByEndpoint(predictions) {
            const grouped = {};
            predictions.forEach(prediction => {
                // Extract endpoint from prediction data (simplified)
                const endpoint = 'API Endpoint'; // This would be extracted from actual data
                if (!grouped[endpoint]) {
                    grouped[endpoint] = [];
                }
                grouped[endpoint].push(prediction);
            });
            return grouped;
        }
        
        function getTrendIcon(trend) {
            switch (trend) {
                case 'increasing': return '📈';
                case 'decreasing': return '📉';
                case 'stable': return '➡️';
                default: return '❓';
            }
        }
        
        function getTrendClass(trend) {
            switch (trend) {
                case 'increasing': return 'trend-up';
                case 'decreasing': return 'trend-down';
                case 'stable': return 'trend-stable';
                default: return 'trend-stable';
            }
        }
        
        function getUnit(type) {
            switch (type) {
                case 'latency': return 'ms';
                case 'traffic': return ' calls';
                case 'error': return '%';
                default: return '';
            }
        }
        
        // Request initial data
        vscode.postMessage({ command: 'getPredictions' });
    </script>
</body>
</html>`;
    }
}
