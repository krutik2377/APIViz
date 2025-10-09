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
