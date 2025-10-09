import * as vscode from 'vscode';
import { DataProcessor } from '../services/DataProcessor';
import { LatencyDataPoint, PerformanceMetrics } from '../types';

export class ChartsWebview {
    private panel: vscode.WebviewPanel | undefined;
    private dataProcessor: DataProcessor;

    constructor(dataProcessor: DataProcessor) {
        this.dataProcessor = dataProcessor;
    }

    public createWebview(context: vscode.ExtensionContext): vscode.WebviewPanel {
        this.panel = vscode.window.createWebviewPanel(
            'apivizCharts',
            'API Performance Charts',
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
                    case 'requestData':
                        this.sendDataToWebview();
                        break;
                    case 'clearData':
                        this.dataProcessor.clearData();
                        this.sendDataToWebview();
                        break;
                }
            },
            undefined,
            context.subscriptions
        );

        // Send initial data
        this.sendDataToWebview();

        // Set up data refresh
        const refreshInterval = setInterval(() => {
            if (this.panel && this.panel.visible) {
                this.sendDataToWebview();
            }
        }, 2000);

        this.panel.onDidDispose(() => {
            clearInterval(refreshInterval);
        });

        return this.panel;
    }

    private sendDataToWebview(): void {
        if (!this.panel) {
            return;
        }

        const metrics = this.dataProcessor.getPerformanceMetrics();
        const latencyData = this.dataProcessor.getLatencyDataPoints();
        const endpointStats = this.dataProcessor.getEndpointStats();

        this.panel.webview.postMessage({
            type: 'data',
            data: {
                metrics,
                latencyData,
                endpointStats
            }
        });
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APIViz Performance Charts</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
        }
        .chart-container {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            margin-bottom: 20px;
            padding: 20px;
        }
        .chart-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: var(--vscode-foreground);
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 15px;
            text-align: center;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
        .metric-label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 5px;
        }
        .status-healthy { color: #4CAF50; }
        .status-warning { color: #FF9800; }
        .status-error { color: #F44336; }
        .controls {
            margin-bottom: 20px;
        }
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .endpoint-list {
            max-height: 300px;
            overflow-y: auto;
        }
        .endpoint-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .endpoint-name {
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
        }
        .endpoint-metrics {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <h1>🚀 APIViz Performance Dashboard</h1>
    
    <div class="controls">
        <button onclick="requestData()">Refresh Data</button>
        <button onclick="clearData()">Clear Data</button>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value" id="totalCalls">0</div>
            <div class="metric-label">Total Calls</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" id="avgLatency">0ms</div>
            <div class="metric-label">Average Latency</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" id="maxLatency">0ms</div>
            <div class="metric-label">Max Latency</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" id="errorRate">0%</div>
            <div class="metric-label">Error Rate</div>
        </div>
    </div>

    <div class="chart-container">
        <div class="chart-title">Latency Over Time</div>
        <canvas id="latencyChart" width="400" height="200"></canvas>
    </div>

    <div class="chart-container">
        <div class="chart-title">Endpoint Performance</div>
        <canvas id="endpointChart" width="400" height="200"></canvas>
    </div>

    <div class="chart-container">
        <div class="chart-title">Top Endpoints</div>
        <div class="endpoint-list" id="endpointList">
            <div style="text-align: center; color: var(--vscode-descriptionForeground); padding: 20px;">
                No endpoint data available
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        let latencyChart;
        let endpointChart;
        
        // Initialize charts
        function initCharts() {
            const latencyCtx = document.getElementById('latencyChart').getContext('2d');
            latencyChart = new Chart(latencyCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Latency (ms)',
                        data: [],
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Latency (ms)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        }
                    }
                }
            });

            const endpointCtx = document.getElementById('endpointChart').getContext('2d');
            endpointChart = new Chart(endpointCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Average Latency (ms)',
                        data: [],
                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Latency (ms)'
                            }
                        }
                    }
                }
            });
        }

        // Update metrics display
        function updateMetrics(metrics) {
            document.getElementById('totalCalls').textContent = metrics.totalCalls || 0;
            document.getElementById('avgLatency').textContent = formatLatency(metrics.averageLatency || 0);
            document.getElementById('maxLatency').textContent = formatLatency(metrics.maxLatency || 0);
            document.getElementById('errorRate').textContent = (metrics.errorRate || 0).toFixed(1) + '%';
        }

        // Update latency chart
        function updateLatencyChart(latencyData) {
            if (!latencyChart) return;
            
            const now = Date.now();
            const timeWindow = 5 * 60 * 1000; // 5 minutes
            const recentData = latencyData.filter(point => now - point.timestamp < timeWindow);
            
            const labels = recentData.map(point => new Date(point.timestamp).toLocaleTimeString());
            const data = recentData.map(point => point.latency);
            
            latencyChart.data.labels = labels;
            latencyChart.data.datasets[0].data = data;
            latencyChart.update('none');
        }

        // Update endpoint chart
        function updateEndpointChart(endpointStats) {
            if (!endpointChart) return;
            
            const topEndpoints = endpointStats
                .sort((a, b) => b.totalCalls - a.totalCalls)
                .slice(0, 10);
            
            const labels = topEndpoints.map(endpoint => truncateUrl(endpoint.endpoint, 20));
            const data = topEndpoints.map(endpoint => endpoint.averageLatency);
            
            endpointChart.data.labels = labels;
            endpointChart.data.datasets[0].data = data;
            endpointChart.update('none');
        }

        // Update endpoint list
        function updateEndpointList(endpointStats) {
            const listElement = document.getElementById('endpointList');
            
            if (endpointStats.length === 0) {
                listElement.innerHTML = '<div style="text-align: center; color: var(--vscode-descriptionForeground); padding: 20px;">No endpoint data available</div>';
                return;
            }
            
            const sortedEndpoints = endpointStats
                .sort((a, b) => b.totalCalls - a.totalCalls)
                .slice(0, 20);
            
            listElement.innerHTML = sortedEndpoints.map(endpoint => \`
                <div class="endpoint-item">
                    <div class="endpoint-name">\${truncateUrl(endpoint.endpoint, 40)}</div>
                    <div class="endpoint-metrics">
                        \${formatLatency(endpoint.averageLatency)} avg | \${endpoint.totalCalls} calls | \${getStatusIcon(endpoint.status)}
                    </div>
                </div>
            \`).join('');
        }

        // Utility functions
        function formatLatency(latency) {
            if (latency < 1000) {
                return Math.round(latency) + 'ms';
            } else {
                return (latency / 1000).toFixed(1) + 's';
            }
        }

        function truncateUrl(url, maxLength) {
            if (url.length <= maxLength) {
                return url;
            }
            return url.substring(0, maxLength - 3) + '...';
        }

        function getStatusIcon(status) {
            switch (status) {
                case 'healthy': return '🟢';
                case 'warning': return '🟡';
                case 'error': return '🔴';
                default: return '⚪';
            }
        }

        // Message handling
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'data':
                    updateMetrics(message.data.metrics);
                    updateLatencyChart(message.data.latencyData);
                    updateEndpointChart(message.data.endpointStats);
                    updateEndpointList(message.data.endpointStats);
                    break;
            }
        });

        // Request functions
        function requestData() {
            vscode.postMessage({ command: 'requestData' });
        }

        function clearData() {
            vscode.postMessage({ command: 'clearData' });
        }

        // Initialize
        initCharts();
        requestData();
    </script>
</body>
</html>`;
    }
}
