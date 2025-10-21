import * as vscode from 'vscode';

// Simple tree data providers for the views
class LatencyTreeDataProvider implements vscode.TreeDataProvider<any> {
    getTreeItem(element: any): vscode.TreeItem {
        return element;
    }

    getChildren(element?: any): Thenable<any[]> {
        if (!element) {
            return Promise.resolve([
                {
                    label: 'Average Latency: 45ms',
                    iconPath: new vscode.ThemeIcon('pulse'),
                    contextValue: 'latency-item'
                },
                {
                    label: 'Total Calls: 1,234',
                    iconPath: new vscode.ThemeIcon('graph'),
                    contextValue: 'calls-item'
                },
                {
                    label: 'Active Endpoints: 12',
                    iconPath: new vscode.ThemeIcon('link'),
                    contextValue: 'endpoints-item'
                }
            ]);
        }
        return Promise.resolve([]);
    }
}

class EndpointsTreeDataProvider implements vscode.TreeDataProvider<any> {
    getTreeItem(element: any): vscode.TreeItem {
        return element;
    }

    getChildren(element?: any): Thenable<any[]> {
        if (!element) {
            return Promise.resolve([
                {
                    label: 'GET /api/users',
                    iconPath: new vscode.ThemeIcon('globe'),
                    contextValue: 'endpoint-item'
                },
                {
                    label: 'POST /api/auth',
                    iconPath: new vscode.ThemeIcon('key'),
                    contextValue: 'endpoint-item'
                },
                {
                    label: 'GET /api/data',
                    iconPath: new vscode.ThemeIcon('database'),
                    contextValue: 'endpoint-item'
                }
            ]);
        }
        return Promise.resolve([]);
    }
}

class AIInsightsTreeDataProvider implements vscode.TreeDataProvider<any> {
    getTreeItem(element: any): vscode.TreeItem {
        return element;
    }

    getChildren(element?: any): Thenable<any[]> {
        if (!element) {
            return Promise.resolve([
                {
                    label: 'Performance Score: 85/100',
                    iconPath: new vscode.ThemeIcon('star'),
                    contextValue: 'insight-item'
                },
                {
                    label: 'Recommendation: Optimize /api/slow',
                    iconPath: new vscode.ThemeIcon('lightbulb'),
                    contextValue: 'insight-item'
                }
            ]);
        }
        return Promise.resolve([]);
    }
}

class TeamLeaderboardTreeDataProvider implements vscode.TreeDataProvider<any> {
    getTreeItem(element: any): vscode.TreeItem {
        return element;
    }

    getChildren(element?: any): Thenable<any[]> {
        if (!element) {
            return Promise.resolve([
                {
                    label: '🏆 Team Performance: 92%',
                    iconPath: new vscode.ThemeIcon('trophy'),
                    contextValue: 'team-item'
                },
                {
                    label: '📈 This Week: +15%',
                    iconPath: new vscode.ThemeIcon('trending-up'),
                    contextValue: 'team-item'
                }
            ]);
        }
        return Promise.resolve([]);
    }
}

class ChartsTreeDataProvider implements vscode.TreeDataProvider<any> {
    getTreeItem(element: any): vscode.TreeItem {
        const item = new vscode.TreeItem(element.label, vscode.TreeItemCollapsibleState.None);
        item.iconPath = element.iconPath;
        item.contextValue = element.contextValue;
        item.command = {
            command: 'apiviz.openCharts',
            title: 'Open Charts',
            arguments: [element.chartType]
        };
        return item;
    }

    getChildren(element?: any): Thenable<any[]> {
        if (!element) {
            return Promise.resolve([
                {
                    label: '📊 Latency Trends',
                    iconPath: new vscode.ThemeIcon('graph-line'),
                    contextValue: 'chart-item',
                    chartType: 'latency'
                },
                {
                    label: '📈 Performance Metrics',
                    iconPath: new vscode.ThemeIcon('chart-line'),
                    contextValue: 'chart-item',
                    chartType: 'performance'
                },
                {
                    label: '🌐 Endpoint Analytics',
                    iconPath: new vscode.ThemeIcon('globe'),
                    contextValue: 'chart-item',
                    chartType: 'endpoints'
                },
                {
                    label: '⚡ Response Time Distribution',
                    iconPath: new vscode.ThemeIcon('pulse'),
                    contextValue: 'chart-item',
                    chartType: 'distribution'
                }
            ]);
        }
        return Promise.resolve([]);
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('APIViz extension is activating...');
    
    try {
        console.log('Initializing services and registering commands...');

        // Create tree data providers
        const latencyProvider = new LatencyTreeDataProvider();
        const endpointsProvider = new EndpointsTreeDataProvider();
        const aiInsightsProvider = new AIInsightsTreeDataProvider();
        const teamLeaderboardProvider = new TeamLeaderboardTreeDataProvider();
        const chartsProvider = new ChartsTreeDataProvider();

        // Register tree data providers
        vscode.window.registerTreeDataProvider('apiviz.latencyView', latencyProvider);
        vscode.window.registerTreeDataProvider('apiviz.endpointsView', endpointsProvider);
        vscode.window.registerTreeDataProvider('apiviz.aiInsightsView', aiInsightsProvider);
        vscode.window.registerTreeDataProvider('apiviz.teamLeaderboardView', teamLeaderboardProvider);
        vscode.window.registerTreeDataProvider('apiviz.chartsView', chartsProvider);

        // Register all APIViz commands
        const startMonitoringCommand = vscode.commands.registerCommand('apiviz.startMonitoring', async () => {
            vscode.window.showInformationMessage('APIViz: Monitoring started!');
            vscode.commands.executeCommand('setContext', 'apiviz.isMonitoring', true);
        });

        const stopMonitoringCommand = vscode.commands.registerCommand('apiviz.stopMonitoring', async () => {
            vscode.window.showInformationMessage('APIViz: Monitoring stopped!');
            vscode.commands.executeCommand('setContext', 'apiviz.isMonitoring', false);
        });

        const clearDataCommand = vscode.commands.registerCommand('apiviz.clearData', async () => {
            vscode.window.showInformationMessage('APIViz: Data cleared!');
        });

        const openSettingsCommand = vscode.commands.registerCommand('apiviz.openSettings', async () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'apiviz');
        });

        const openAIInsightsCommand = vscode.commands.registerCommand('apiviz.openAIInsights', async () => {
            vscode.window.showInformationMessage('APIViz: AI Insights opened!');
        });

        const openAdvancedVizCommand = vscode.commands.registerCommand('apiviz.openAdvancedViz', async () => {
            createChartsWebview(context);
        });

        const openSocialSharingCommand = vscode.commands.registerCommand('apiviz.openSocialSharing', async () => {
            vscode.window.showInformationMessage('APIViz: Social Sharing opened!');
        });

        const openPredictiveAnalyticsCommand = vscode.commands.registerCommand('apiviz.openPredictiveAnalytics', async () => {
            vscode.window.showInformationMessage('APIViz: Predictive Analytics opened!');
        });

        const instrumentLineCommand = vscode.commands.registerCommand('apiviz.instrumentLine', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                vscode.window.showInformationMessage('APIViz: Line instrumented!');
            } else {
                vscode.window.showWarningMessage('APIViz: No active editor found');
            }
        });

        const openChartsCommand = vscode.commands.registerCommand('apiviz.openCharts', async (chartType: string) => {
            createChartsWebview(context, chartType);
        });

        // Set up context
        vscode.commands.executeCommand('setContext', 'apiviz.isMonitoring', true);

        context.subscriptions.push(
            startMonitoringCommand,
            stopMonitoringCommand,
            clearDataCommand,
            openSettingsCommand,
            openAIInsightsCommand,
            openAdvancedVizCommand,
            openSocialSharingCommand,
            openPredictiveAnalyticsCommand,
            instrumentLineCommand,
            openChartsCommand
        );

        console.log('Commands registered successfully');
        vscode.window.showInformationMessage('APIViz: Ready to use! Check the Activity Bar for the APIViz icon!');

    } catch (error) {
        console.error('Error during activation:', error);
        vscode.window.showErrorMessage(`APIViz activation error: ${error}`);
    }
}

function createChartsWebview(context: vscode.ExtensionContext, chartType: string = 'latency') {
    const panel = vscode.window.createWebviewPanel(
        'apivizCharts',
        `APIViz Charts - ${getChartTitle(chartType)}`,
        vscode.ViewColumn.Two,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = getChartsHtml(chartType);
}

function getChartTitle(chartType: string): string {
    switch (chartType) {
        case 'latency': return 'Latency Trends';
        case 'performance': return 'Performance Metrics';
        case 'endpoints': return 'Endpoint Analytics';
        case 'distribution': return 'Response Time Distribution';
        default: return 'Performance Dashboard';
    }
}

function getChartsHtml(chartType: string): string {
    const baseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APIViz Charts</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: var(--vscode-panel-background);
            border-radius: 8px;
            border: 1px solid var(--vscode-panel-border);
        }
        .header h1 {
            margin: 0;
            color: var(--vscode-textLink-foreground);
        }
        .charts-container {
            display: grid;
            gap: 20px;
        }
        .chart-card {
            background: var(--vscode-panel-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .chart-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: var(--vscode-textLink-foreground);
        }
        .chart-container {
            position: relative;
            height: 400px;
            margin-bottom: 20px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .metric-card {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 6px;
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
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-healthy { background: #4CAF50; }
        .status-warning { background: #FF9800; }
        .status-critical { background: #F44336; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 APIViz Performance Dashboard</h1>
        <p>Real-time API monitoring and analytics</p>
    </div>
    
    <div class="charts-container">`;

    const chartHtml = getSpecificChartHtml(chartType);
    
    return baseHtml + chartHtml + `
    </div>
    
    <script>
        // Auto-refresh data every 5 seconds
        setInterval(() => {
            updateCharts();
        }, 5000);
        
        function updateCharts() {
            // Simulate real-time data updates
            console.log('Updating charts with new data...');
        }
    </script>
</body>
</html>`;
}

function getSpecificChartHtml(chartType: string): string {
    switch (chartType) {
        case 'latency':
            return getLatencyChartsHtml();
        case 'performance':
            return getPerformanceChartsHtml();
        case 'endpoints':
            return getEndpointChartsHtml();
        case 'distribution':
            return getDistributionChartsHtml();
        default:
            return getLatencyChartsHtml();
    }
}

function getLatencyChartsHtml(): string {
    return `
        <div class="chart-card">
            <div class="chart-title">📊 Latency Trends (Last 24 Hours)</div>
            <div class="chart-container">
                <canvas id="latencyChart"></canvas>
            </div>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">45ms</div>
                <div class="metric-label">Average Latency</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">23ms</div>
                <div class="metric-label">Min Latency</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">156ms</div>
                <div class="metric-label">Max Latency</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">89ms</div>
                <div class="metric-label">95th Percentile</div>
            </div>
        </div>
        
        <script>
            const ctx = document.getElementById('latencyChart').getContext('2d');
            const latencyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                    datasets: [{
                        label: 'Average Latency (ms)',
                        data: [42, 38, 45, 52, 48, 41, 39],
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: '95th Percentile (ms)',
                        data: [89, 85, 92, 98, 95, 88, 86],
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'var(--vscode-panel-border)'
                            },
                            ticks: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'var(--vscode-panel-border)'
                            },
                            ticks: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    }
                }
            });
        </script>`;
}

function getPerformanceChartsHtml(): string {
    return `
        <div class="chart-card">
            <div class="chart-title">📈 Performance Metrics</div>
            <div class="chart-container">
                <canvas id="performanceChart"></canvas>
            </div>
        </div>
        
        <div class="chart-card">
            <div class="chart-title">⚡ Response Time Distribution</div>
            <div class="chart-container">
                <canvas id="distributionChart"></canvas>
            </div>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">99.2%</div>
                <div class="metric-label">Uptime</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">1,234</div>
                <div class="metric-label">Total Requests</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">0.8%</div>
                <div class="metric-label">Error Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">12</div>
                <div class="metric-label">Active Endpoints</div>
            </div>
        </div>
        
        <script>
            // Performance Chart
            const perfCtx = document.getElementById('performanceChart').getContext('2d');
            new Chart(perfCtx, {
                type: 'bar',
                data: {
                    labels: ['GET /api/users', 'POST /api/auth', 'GET /api/data', 'PUT /api/update', 'DELETE /api/remove'],
                    datasets: [{
                        label: 'Average Response Time (ms)',
                        data: [45, 78, 32, 89, 56],
                        backgroundColor: [
                            'rgba(76, 175, 80, 0.8)',
                            'rgba(255, 152, 0, 0.8)',
                            'rgba(33, 150, 243, 0.8)',
                            'rgba(156, 39, 176, 0.8)',
                            'rgba(244, 67, 54, 0.8)'
                        ],
                        borderColor: [
                            'rgba(76, 175, 80, 1)',
                            'rgba(255, 152, 0, 1)',
                            'rgba(33, 150, 243, 1)',
                            'rgba(156, 39, 176, 1)',
                            'rgba(244, 67, 54, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'var(--vscode-panel-border)'
                            },
                            ticks: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'var(--vscode-panel-border)'
                            },
                            ticks: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    }
                }
            });
            
            // Distribution Chart
            const distCtx = document.getElementById('distributionChart').getContext('2d');
            new Chart(distCtx, {
                type: 'doughnut',
                data: {
                    labels: ['< 50ms', '50-100ms', '100-200ms', '200-500ms', '> 500ms'],
                    datasets: [{
                        data: [45, 35, 15, 4, 1],
                        backgroundColor: [
                            'rgba(76, 175, 80, 0.8)',
                            'rgba(33, 150, 243, 0.8)',
                            'rgba(255, 152, 0, 0.8)',
                            'rgba(156, 39, 176, 0.8)',
                            'rgba(244, 67, 54, 0.8)'
                        ],
                        borderColor: [
                            'rgba(76, 175, 80, 1)',
                            'rgba(33, 150, 243, 1)',
                            'rgba(255, 152, 0, 1)',
                            'rgba(156, 39, 176, 1)',
                            'rgba(244, 67, 54, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    }
                }
            });
        </script>`;
}

function getEndpointChartsHtml(): string {
    return `
        <div class="chart-card">
            <div class="chart-title">🌐 Endpoint Performance Analytics</div>
            <div class="chart-container">
                <canvas id="endpointChart"></canvas>
            </div>
        </div>
        
        <div class="chart-card">
            <div class="chart-title">📊 Request Volume by Endpoint</div>
            <div class="chart-container">
                <canvas id="volumeChart"></canvas>
            </div>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value"><span class="status-indicator status-healthy"></span>12</div>
                <div class="metric-label">Healthy Endpoints</div>
            </div>
            <div class="metric-card">
                <div class="metric-value"><span class="status-indicator status-warning"></span>2</div>
                <div class="metric-label">Warning Endpoints</div>
            </div>
            <div class="metric-card">
                <div class="metric-value"><span class="status-indicator status-critical"></span>0</div>
                <div class="metric-label">Critical Endpoints</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">98.5%</div>
                <div class="metric-label">Overall Health</div>
            </div>
        </div>
        
        <script>
            // Endpoint Performance Chart
            const endpointCtx = document.getElementById('endpointChart').getContext('2d');
            new Chart(endpointCtx, {
                type: 'radar',
                data: {
                    labels: ['Response Time', 'Throughput', 'Error Rate', 'Availability', 'CPU Usage', 'Memory Usage'],
                    datasets: [{
                        label: 'GET /api/users',
                        data: [85, 90, 95, 98, 70, 65],
                        borderColor: 'rgba(76, 175, 80, 1)',
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        pointBackgroundColor: 'rgba(76, 175, 80, 1)'
                    }, {
                        label: 'POST /api/auth',
                        data: [70, 85, 88, 95, 80, 75],
                        borderColor: 'rgba(33, 150, 243, 1)',
                        backgroundColor: 'rgba(33, 150, 243, 0.2)',
                        pointBackgroundColor: 'rgba(33, 150, 243, 1)'
                    }, {
                        label: 'GET /api/data',
                        data: [95, 80, 92, 99, 60, 55],
                        borderColor: 'rgba(255, 152, 0, 1)',
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                        pointBackgroundColor: 'rgba(255, 152, 0, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                                color: 'var(--vscode-panel-border)'
                            },
                            pointLabels: {
                                color: 'var(--vscode-editor-foreground)'
                            },
                            ticks: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    }
                }
            });
            
            // Volume Chart
            const volumeCtx = document.getElementById('volumeChart').getContext('2d');
            new Chart(volumeCtx, {
                type: 'bar',
                data: {
                    labels: ['GET /api/users', 'POST /api/auth', 'GET /api/data', 'PUT /api/update', 'DELETE /api/remove'],
                    datasets: [{
                        label: 'Request Count',
                        data: [1200, 800, 1500, 300, 150],
                        backgroundColor: [
                            'rgba(76, 175, 80, 0.8)',
                            'rgba(33, 150, 243, 0.8)',
                            'rgba(255, 152, 0, 0.8)',
                            'rgba(156, 39, 176, 0.8)',
                            'rgba(244, 67, 54, 0.8)'
                        ],
                        borderColor: [
                            'rgba(76, 175, 80, 1)',
                            'rgba(33, 150, 243, 1)',
                            'rgba(255, 152, 0, 1)',
                            'rgba(156, 39, 176, 1)',
                            'rgba(244, 67, 54, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'var(--vscode-panel-border)'
                            },
                            ticks: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'var(--vscode-panel-border)'
                            },
                            ticks: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    }
                }
            });
        </script>`;
}

function getDistributionChartsHtml(): string {
    return `
        <div class="chart-card">
            <div class="chart-title">⚡ Response Time Distribution</div>
            <div class="chart-container">
                <canvas id="responseTimeChart"></canvas>
            </div>
        </div>
        
        <div class="chart-card">
            <div class="chart-title">📊 Latency Percentiles</div>
            <div class="chart-container">
                <canvas id="percentileChart"></canvas>
            </div>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">23ms</div>
                <div class="metric-label">P50 (Median)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">45ms</div>
                <div class="metric-label">P95</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">89ms</div>
                <div class="metric-label">P99</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">156ms</div>
                <div class="metric-label">P99.9</div>
            </div>
        </div>
        
        <script>
            // Response Time Distribution
            const responseCtx = document.getElementById('responseTimeChart').getContext('2d');
            new Chart(responseCtx, {
                type: 'histogram',
                data: {
                    datasets: [{
                        label: 'Response Time Distribution',
                        data: [15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135, 145, 155],
                        backgroundColor: 'rgba(76, 175, 80, 0.6)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'var(--vscode-panel-border)'
                            },
                            ticks: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'var(--vscode-panel-border)'
                            },
                            ticks: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    }
                }
            });
            
            // Percentile Chart
            const percentileCtx = document.getElementById('percentileChart').getContext('2d');
            new Chart(percentileCtx, {
                type: 'line',
                data: {
                    labels: ['P50', 'P75', 'P90', 'P95', 'P99', 'P99.9'],
                    datasets: [{
                        label: 'Latency Percentiles (ms)',
                        data: [23, 35, 42, 45, 89, 156],
                        borderColor: 'rgba(33, 150, 243, 1)',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: 'rgba(33, 150, 243, 1)',
                        pointBorderColor: 'rgba(33, 150, 243, 1)',
                        pointRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'var(--vscode-panel-border)'
                            },
                            ticks: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'var(--vscode-panel-border)'
                            },
                            ticks: {
                                color: 'var(--vscode-editor-foreground)'
                            }
                        }
                    }
                }
            });
        </script>`;
}

export function deactivate() {
    console.log('APIViz extension deactivated');
}

