import * as vscode from 'vscode';
import { DataProcessor } from '../services/DataProcessor';
import { LatencyTreeNode } from '../types';

export class LatencyProvider implements vscode.TreeDataProvider<LatencyTreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<LatencyTreeNode | undefined | null | void> = new vscode.EventEmitter<LatencyTreeNode | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<LatencyTreeNode | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private dataProcessor: DataProcessor) {
        // Listen to data changes
        this.dataProcessor.onDataChanged(() => {
            this.refresh();
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: LatencyTreeNode): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(
            element.label,
            element.collapsibleState || vscode.TreeItemCollapsibleState.None
        );

        treeItem.description = element.description;
        treeItem.iconPath = element.iconPath;
        treeItem.command = element.command;
        treeItem.contextValue = element.contextValue;

        return treeItem;
    }

    getChildren(element?: LatencyTreeNode): Thenable<LatencyTreeNode[]> {
        if (!element) {
            return this.getRootElements();
        } else {
            return Promise.resolve(element.children || []);
        }
    }

    private async getRootElements(): Promise<LatencyTreeNode[]> {
        const elements: LatencyTreeNode[] = [];
        
        // Get performance metrics
        const metrics = this.dataProcessor.getPerformanceMetrics();
        const recentCalls = this.dataProcessor.getRecentCalls(10);
        const endpointStats = this.dataProcessor.getEndpointStats();

        // Overall performance summary
        elements.push({
            label: 'Performance Summary',
            description: `${metrics.totalCalls} calls`,
            iconPath: new vscode.ThemeIcon('graph'),
            collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
            children: [
                {
                    label: `Average Latency: ${this.formatLatency(metrics.averageLatency)}`,
                    description: this.getLatencyStatus(metrics.averageLatency),
                    iconPath: new vscode.ThemeIcon('clock')
                },
                {
                    label: `Max Latency: ${this.formatLatency(metrics.maxLatency)}`,
                    description: this.getLatencyStatus(metrics.maxLatency),
                    iconPath: new vscode.ThemeIcon('arrow-up')
                },
                {
                    label: `95th Percentile: ${this.formatLatency(metrics.p95Latency)}`,
                    description: 'Performance threshold',
                    iconPath: new vscode.ThemeIcon('graph-line')
                },
                {
                    label: `Error Rate: ${metrics.errorRate.toFixed(1)}%`,
                    description: this.getErrorRateStatus(metrics.errorRate),
                    iconPath: new vscode.ThemeIcon('error')
                }
            ]
        });

        // Recent calls
        if (recentCalls.length > 0) {
            elements.push({
                label: 'Recent Calls',
                description: `${recentCalls.length} calls`,
                iconPath: new vscode.ThemeIcon('history'),
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                children: recentCalls.map(call => ({
                    label: `${call.method} ${this.truncateUrl(call.url)}`,
                    description: `${this.formatLatency(call.latency)} - ${this.formatTimestamp(call.timestamp)}`,
                    iconPath: this.getMethodIcon(call.method),
                    contextValue: 'apiCall',
                    command: {
                        command: 'apiviz.showCallDetails',
                        title: 'Show Details',
                        arguments: [call]
                    }
                }))
            });
        }

        // Endpoint performance
        if (endpointStats.length > 0) {
            elements.push({
                label: 'Endpoint Performance',
                description: `${endpointStats.length} endpoints`,
                iconPath: new vscode.ThemeIcon('server'),
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                children: endpointStats
                    .sort((a, b) => b.totalCalls - a.totalCalls)
                    .slice(0, 10)
                    .map(endpoint => ({
                        label: this.truncateUrl(endpoint.endpoint),
                        description: `${this.formatLatency(endpoint.averageLatency)} (${endpoint.totalCalls} calls)`,
                        iconPath: this.getStatusIcon(endpoint.status),
                        contextValue: 'endpoint',
                        command: {
                            command: 'apiviz.showEndpointDetails',
                            title: 'Show Details',
                            arguments: [endpoint]
                        }
                    }))
            });
        }

        // If no data, show placeholder
        if (elements.length === 0) {
            elements.push({
                label: 'No data available',
                description: 'Start monitoring to see API call data',
                iconPath: new vscode.ThemeIcon('info')
            });
        }

        return elements;
    }

    private formatLatency(latency: number): string {
        if (latency < 1000) {
            return `${Math.round(latency)}ms`;
        } else {
            return `${(latency / 1000).toFixed(1)}s`;
        }
    }

    private formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        if (diff < 60000) { // Less than 1 minute
            return `${Math.floor(diff / 1000)}s ago`;
        } else if (diff < 3600000) { // Less than 1 hour
            return `${Math.floor(diff / 60000)}m ago`;
        } else {
            return date.toLocaleTimeString();
        }
    }

    private truncateUrl(url: string, maxLength: number = 40): string {
        if (url.length <= maxLength) {
            return url;
        }
        return url.substring(0, maxLength - 3) + '...';
    }

    private getLatencyStatus(latency: number): string {
        if (latency < 100) {
            return '🟢 Fast';
        } else if (latency < 500) {
            return '🟡 Moderate';
        } else {
            return '🔴 Slow';
        }
    }

    private getErrorRateStatus(errorRate: number): string {
        if (errorRate < 5) {
            return '🟢 Good';
        } else if (errorRate < 10) {
            return '🟡 Warning';
        } else {
            return '🔴 High';
        }
    }

    private getMethodIcon(method: string): vscode.ThemeIcon {
        switch (method.toUpperCase()) {
            case 'GET':
                return new vscode.ThemeIcon('arrow-down');
            case 'POST':
                return new vscode.ThemeIcon('arrow-up');
            case 'PUT':
                return new vscode.ThemeIcon('edit');
            case 'DELETE':
                return new vscode.ThemeIcon('trash');
            case 'PATCH':
                return new vscode.ThemeIcon('diff');
            default:
                return new vscode.ThemeIcon('arrow-right');
        }
    }

    private getStatusIcon(status: 'healthy' | 'warning' | 'error'): vscode.ThemeIcon {
        switch (status) {
            case 'healthy':
                return new vscode.ThemeIcon('check');
            case 'warning':
                return new vscode.ThemeIcon('warning');
            case 'error':
                return new vscode.ThemeIcon('error');
            default:
                return new vscode.ThemeIcon('question');
        }
    }
}
