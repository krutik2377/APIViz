import * as vscode from 'vscode';
import { DataProcessor } from './DataProcessor';
import { WebSocketService } from './WebSocketService';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private dataProcessor: DataProcessor;
    private webSocketService: WebSocketService;
    private isMonitoring = false;
    private updateInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'apiviz.openSettings';
        this.statusBarItem.show();
        
        this.dataProcessor = new DataProcessor();
        this.webSocketService = new WebSocketService(this.dataProcessor);
    }

    async startMonitoring(): Promise<void> {
        this.isMonitoring = true;
        this.statusBarItem.text = '$(pulse) APIViz: Starting...';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        
        // Start update interval
        this.updateInterval = setInterval(() => {
            this.updateStatus();
        }, 2000);
    }

    async stopMonitoring(): Promise<void> {
        this.isMonitoring = false;
        this.statusBarItem.text = '$(pulse) APIViz: Stopped';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    updateStatus(): void {
        if (!this.isMonitoring) {
            return;
        }

        const connectionStatus = this.webSocketService.getConnectionStatus();
        
        if (!connectionStatus.connected) {
            this.statusBarItem.text = '$(pulse) APIViz: Disconnected';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            this.statusBarItem.tooltip = 'APIViz agent is not connected. Click to open settings.';
            return;
        }

        const metrics = this.dataProcessor.getPerformanceMetrics();
        const endpointStats = this.dataProcessor.getEndpointStats();
        
        if (metrics.totalCalls === 0) {
            this.statusBarItem.text = '$(pulse) APIViz: No calls';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.background');
            this.statusBarItem.tooltip = 'APIViz is monitoring but no API calls detected yet.';
            return;
        }

        // Format latency display
        const avgLatency = this.formatLatency(metrics.averageLatency);
        const maxLatency = this.formatLatency(metrics.maxLatency);
        
        // Determine status color based on performance
        let statusColor: vscode.ThemeColor;
        let statusIcon: string;
        
        if (metrics.averageLatency < 100 && metrics.errorRate < 5) {
            statusColor = new vscode.ThemeColor('statusBarItem.background');
            statusIcon = '$(check)';
        } else if (metrics.averageLatency < 500 && metrics.errorRate < 10) {
            statusColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            statusIcon = '$(warning)';
        } else {
            statusColor = new vscode.ThemeColor('statusBarItem.errorBackground');
            statusIcon = '$(error)';
        }

        // Update status bar
        this.statusBarItem.text = `${statusIcon} APIViz: ${avgLatency} avg`;
        this.statusBarItem.backgroundColor = statusColor;
        
        // Create detailed tooltip
        const tooltip = this.createTooltip(metrics, endpointStats);
        this.statusBarItem.tooltip = tooltip;
    }

    private formatLatency(latency: number): string {
        if (latency < 1000) {
            return `${Math.round(latency)}ms`;
        } else {
            return `${(latency / 1000).toFixed(1)}s`;
        }
    }

    private createTooltip(metrics: any, endpointStats: any[]): vscode.MarkdownString {
        const tooltip = new vscode.MarkdownString();
        
        tooltip.appendMarkdown('**APIViz Performance Summary**\n\n');
        
        // Overall metrics
        tooltip.appendMarkdown(`**Total Calls:** ${metrics.totalCalls}\n`);
        tooltip.appendMarkdown(`**Average Latency:** ${this.formatLatency(metrics.averageLatency)}\n`);
        tooltip.appendMarkdown(`**Max Latency:** ${this.formatLatency(metrics.maxLatency)}\n`);
        tooltip.appendMarkdown(`**95th Percentile:** ${this.formatLatency(metrics.p95Latency)}\n`);
        tooltip.appendMarkdown(`**Error Rate:** ${metrics.errorRate.toFixed(1)}%\n\n`);
        
        // Top endpoints
        if (endpointStats.length > 0) {
            tooltip.appendMarkdown('**Top Endpoints:**\n');
            const topEndpoints = endpointStats
                .sort((a, b) => b.totalCalls - a.totalCalls)
                .slice(0, 3);
                
            topEndpoints.forEach(endpoint => {
                const statusIcon = endpoint.status === 'healthy' ? '🟢' : 
                                 endpoint.status === 'warning' ? '🟡' : '🔴';
                tooltip.appendMarkdown(`${statusIcon} ${endpoint.endpoint}: ${this.formatLatency(endpoint.averageLatency)} (${endpoint.totalCalls} calls)\n`);
            });
        }
        
        tooltip.appendMarkdown('\n*Click to open APIViz settings*');
        
        return tooltip;
    }

    dispose(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.statusBarItem.dispose();
    }
}
