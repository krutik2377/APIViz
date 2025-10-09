export interface ApiCall {
    id: string;
    url: string;
    method: string;
    latency: number;
    timestamp: number;
    statusCode?: number;
    error?: string;
    endpoint: string;
    duration: number;
}

export interface EndpointStats {
    endpoint: string;
    totalCalls: number;
    averageLatency: number;
    minLatency: number;
    maxLatency: number;
    p95Latency: number;
    p99Latency: number;
    errorRate: number;
    lastCall?: number;
    status: 'healthy' | 'warning' | 'error';
}

export interface LatencyDataPoint {
    timestamp: number;
    latency: number;
    endpoint: string;
}

export interface WebSocketMessage {
    type: 'api_call' | 'endpoint_stats' | 'error' | 'ping' | 'pong';
    data: any;
    timestamp: number;
}

export interface ApiCallMessage extends WebSocketMessage {
    type: 'api_call';
    data: ApiCall;
}

export interface EndpointStatsMessage extends WebSocketMessage {
    type: 'endpoint_stats';
    data: EndpointStats[];
}

export interface ErrorMessage extends WebSocketMessage {
    type: 'error';
    data: {
        message: string;
        code?: string;
    };
}

export interface Configuration {
    agentPort: number;
    samplingRate: number;
    minLatencyThreshold: number;
    maxDataPoints: number;
    autoStart: boolean;
    showInlineDecorations: boolean;
    endpointFilters: string[];
}

export interface LatencyTreeNode {
    label: string;
    description: string;
    iconPath?: vscode.ThemeIcon;
    children?: LatencyTreeNode[];
    collapsibleState?: vscode.TreeItemCollapsibleState;
    command?: vscode.Command;
    contextValue?: string;
}

export interface EndpointTreeNode {
    label: string;
    description: string;
    iconPath?: vscode.ThemeIcon;
    children?: EndpointTreeNode[];
    collapsibleState?: vscode.TreeItemCollapsibleState;
    command?: vscode.Command;
    contextValue?: string;
    stats?: EndpointStats;
}

export interface InlineDecoration {
    range: vscode.Range;
    renderOptions: vscode.DecorationRenderOptions;
    hoverMessage?: vscode.MarkdownString;
}

export interface PerformanceMetrics {
    averageLatency: number;
    maxLatency: number;
    minLatency: number;
    p95Latency: number;
    p99Latency: number;
    totalCalls: number;
    errorRate: number;
    lastUpdate: number;
}

export interface ChartDataPoint {
    x: number; // timestamp
    y: number; // latency
    endpoint: string;
    statusCode?: number;
}

export interface TimeWindow {
    start: number;
    end: number;
    duration: number;
}

export interface FilterOptions {
    endpoints: string[];
    timeRange: TimeWindow;
    minLatency: number;
    maxLatency: number;
    statusCodes: number[];
    methods: string[];
}

export interface AgentStatus {
    connected: boolean;
    lastPing: number;
    totalCalls: number;
    activeEndpoints: number;
    uptime: number;
}

// Import vscode types for tree items
import * as vscode from 'vscode';
