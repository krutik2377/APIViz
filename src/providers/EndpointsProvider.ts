import * as vscode from 'vscode';
import { DataProcessor } from '../services/DataProcessor';
import { EndpointTreeNode, EndpointStats } from '../types';

export class EndpointsProvider implements vscode.TreeDataProvider<EndpointTreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<EndpointTreeNode | undefined | null | void> = new vscode.EventEmitter<EndpointTreeNode | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<EndpointTreeNode | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private dataProcessor: DataProcessor) {
        // Listen to data changes
        this.dataProcessor.onDataChanged(() => {
            this.refresh();
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: EndpointTreeNode): vscode.TreeItem {
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

    getChildren(element?: EndpointTreeNode): Thenable<EndpointTreeNode[]> {
        if (!element) {
            return this.getRootElements();
        } else {
            return Promise.resolve(element.children || []);
        }
    }

    private async getRootElements(): Promise<EndpointTreeNode[]> {
        const elements: EndpointTreeNode[] = [];
        const endpointStats = this.dataProcessor.getEndpointStats();

        if (endpointStats.length === 0) {
            elements.push({
                label: 'No endpoints monitored',
                description: 'Start monitoring to see endpoint data',
                iconPath: new vscode.ThemeIcon('info')
            });
            return elements;
        }

        // Group endpoints by status
        const healthyEndpoints = endpointStats.filter(e => e.status === 'healthy');
        const warningEndpoints = endpointStats.filter(e => e.status === 'warning');
        const errorEndpoints = endpointStats.filter(e => e.status === 'error');

        // Healthy endpoints
        if (healthyEndpoints.length > 0) {
            elements.push({
                label: `Healthy Endpoints (${healthyEndpoints.length})`,
                description: 'All systems operational',
                iconPath: new vscode.ThemeIcon('check'),
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                children: healthyEndpoints
                    .sort((a, b) => b.totalCalls - a.totalCalls)
                    .map(endpoint => this.createEndpointNode(endpoint))
            });
        }

        // Warning endpoints
        if (warningEndpoints.length > 0) {
            elements.push({
                label: `Warning Endpoints (${warningEndpoints.length})`,
                description: 'Performance issues detected',
                iconPath: new vscode.ThemeIcon('warning'),
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                children: warningEndpoints
                    .sort((a, b) => b.totalCalls - a.totalCalls)
                    .map(endpoint => this.createEndpointNode(endpoint))
            });
        }

        // Error endpoints
        if (errorEndpoints.length > 0) {
            elements.push({
                label: `Error Endpoints (${errorEndpoints.length})`,
                description: 'Critical issues detected',
                iconPath: new vscode.ThemeIcon('error'),
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                children: errorEndpoints
                    .sort((a, b) => b.totalCalls - a.totalCalls)
                    .map(endpoint => this.createEndpointNode(endpoint))
            });
        }

        // All endpoints summary
        elements.push({
            label: 'All Endpoints',
            description: `${endpointStats.length} total`,
            iconPath: new vscode.ThemeIcon('server'),
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            children: endpointStats
                .sort((a, b) => b.totalCalls - a.totalCalls)
                .map(endpoint => this.createEndpointNode(endpoint))
        });

        return elements;
    }

    private createEndpointNode(endpoint: EndpointStats): EndpointTreeNode {
        const lastCallText = endpoint.lastCall ? 
            this.formatTimestamp(endpoint.lastCall) : 'Never';

        return {
            label: this.truncateUrl(endpoint.endpoint),
            description: `${this.formatLatency(endpoint.averageLatency)} avg`,
            iconPath: this.getStatusIcon(endpoint.status),
            contextValue: 'endpoint',
            stats: endpoint,
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            children: [
                {
                    label: 'Performance Metrics',
                    description: 'Detailed performance data',
                    iconPath: new vscode.ThemeIcon('graph'),
                    children: [
                        {
                            label: `Total Calls: ${endpoint.totalCalls}`,
                            description: 'Number of requests made',
                            iconPath: new vscode.ThemeIcon('number')
                        },
                        {
                            label: `Average Latency: ${this.formatLatency(endpoint.averageLatency)}`,
                            description: this.getLatencyStatus(endpoint.averageLatency),
                            iconPath: new vscode.ThemeIcon('clock')
                        },
                        {
                            label: `Min Latency: ${this.formatLatency(endpoint.minLatency)}`,
                            description: 'Fastest response time',
                            iconPath: new vscode.ThemeIcon('arrow-down')
                        },
                        {
                            label: `Max Latency: ${this.formatLatency(endpoint.maxLatency)}`,
                            description: 'Slowest response time',
                            iconPath: new vscode.ThemeIcon('arrow-up')
                        },
                        {
                            label: `95th Percentile: ${this.formatLatency(endpoint.p95Latency)}`,
                            description: '95% of requests faster than this',
                            iconPath: new vscode.ThemeIcon('graph-line')
                        },
                        {
                            label: `99th Percentile: ${this.formatLatency(endpoint.p99Latency)}`,
                            description: '99% of requests faster than this',
                            iconPath: new vscode.ThemeIcon('graph-line')
                        }
                    ]
                },
                {
                    label: 'Error Information',
                    description: 'Error rates and status',
                    iconPath: new vscode.ThemeIcon('error'),
                    children: [
                        {
                            label: `Error Rate: ${endpoint.errorRate.toFixed(1)}%`,
                            description: this.getErrorRateStatus(endpoint.errorRate),
                            iconPath: new vscode.ThemeIcon('warning')
                        },
                        {
                            label: `Last Call: ${lastCallText}`,
                            description: 'Most recent request time',
                            iconPath: new vscode.ThemeIcon('history')
                        }
                    ]
                },
                {
                    label: 'Actions',
                    description: 'Available actions for this endpoint',
                    iconPath: new vscode.ThemeIcon('tools'),
                    children: [
                        {
                            label: 'View Recent Calls',
                            description: 'Show recent API calls for this endpoint',
                            iconPath: new vscode.ThemeIcon('history'),
                            command: {
                                command: 'apiviz.showEndpointCalls',
                                title: 'View Calls',
                                arguments: [endpoint.endpoint]
                            }
                        },
                        {
                            label: 'Copy Endpoint URL',
                            description: 'Copy the endpoint URL to clipboard',
                            iconPath: new vscode.ThemeIcon('copy'),
                            command: {
                                command: 'apiviz.copyEndpointUrl',
                                title: 'Copy URL',
                                arguments: [endpoint.endpoint]
                            }
                        },
                        {
                            label: 'Test Endpoint',
                            description: 'Send a test request to this endpoint',
                            iconPath: new vscode.ThemeIcon('play'),
                            command: {
                                command: 'apiviz.testEndpoint',
                                title: 'Test Endpoint',
                                arguments: [endpoint.endpoint]
                            }
                        }
                    ]
                }
            ]
        };
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
        } else if (diff < 86400000) { // Less than 1 day
            return `${Math.floor(diff / 3600000)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    private truncateUrl(url: string, maxLength: number = 50): string {
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
