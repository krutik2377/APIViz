import { WebSocketServer, WebSocket } from 'ws';
import { MetricsCollector } from './MetricsCollector';
import { WebSocketMessage, ApiCallMessage, EndpointStatsMessage } from '../../types';

export class WebSocketManager {
    private clients: Set<WebSocket> = new Set();
    private pingInterval: NodeJS.Timeout | null = null;

    constructor(
        private wss: WebSocketServer,
        private metricsCollector: MetricsCollector
    ) {
        this.setupWebSocketServer();
        this.startPingInterval();
    }

    private setupWebSocketServer(): void {
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('New WebSocket client connected');
            this.clients.add(ws);

            // Send initial data to new client
            this.sendInitialData(ws);

            ws.on('message', (data: Buffer) => {
                try {
                    const message: WebSocketMessage = JSON.parse(data.toString());
                    this.handleMessage(ws, message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    this.sendError(ws, 'Invalid message format');
                }
            });

            ws.on('close', () => {
                console.log('WebSocket client disconnected');
                this.clients.delete(ws);
            });

            ws.on('error', (error: Error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });

            // Send ping to test connection
            this.sendPing(ws);
        });
    }

    private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
        switch (message.type) {
            case 'ping':
                this.sendPong(ws);
                break;
            case 'pong':
                // Handle pong response
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    private sendInitialData(ws: WebSocket): void {
        try {
            // Send recent API calls
            const recentCalls = this.metricsCollector.getRecentCalls(50);
            recentCalls.forEach(call => {
                const message: ApiCallMessage = {
                    type: 'api_call',
                    data: call,
                    timestamp: Date.now()
                };
                this.sendMessage(ws, message);
            });

            // Send endpoint stats
            const endpointStats = this.metricsCollector.getEndpointStats();
            const statsMessage: EndpointStatsMessage = {
                type: 'endpoint_stats',
                data: endpointStats,
                timestamp: Date.now()
            };
            this.sendMessage(ws, statsMessage);

        } catch (error) {
            console.error('Error sending initial data:', error);
            this.sendError(ws, 'Failed to send initial data');
        }
    }

    broadcastApiCall(apiCall: any): void {
        const message: ApiCallMessage = {
            type: 'api_call',
            data: apiCall,
            timestamp: Date.now()
        };

        this.broadcast(message);
    }

    broadcastEndpointStats(stats: any[]): void {
        const message: EndpointStatsMessage = {
            type: 'endpoint_stats',
            data: stats,
            timestamp: Date.now()
        };

        this.broadcast(message);
    }

    private broadcast(message: WebSocketMessage): void {
        const messageStr = JSON.stringify(message);

        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(messageStr);
                } catch (error) {
                    console.error('Error broadcasting message:', error);
                    this.clients.delete(client);
                }
            }
        });
    }

    private sendMessage(ws: WebSocket, message: WebSocketMessage): void {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    }

    private sendPing(ws: WebSocket): void {
        const pingMessage: WebSocketMessage = {
            type: 'ping',
            data: {},
            timestamp: Date.now()
        };
        this.sendMessage(ws, pingMessage);
    }

    private sendPong(ws: WebSocket): void {
        const pongMessage: WebSocketMessage = {
            type: 'pong',
            data: {},
            timestamp: Date.now()
        };
        this.sendMessage(ws, pongMessage);
    }

    private sendError(ws: WebSocket, errorMessage: string): void {
        const errorMsg: WebSocketMessage = {
            type: 'error',
            data: { message: errorMessage },
            timestamp: Date.now()
        };
        this.sendMessage(ws, errorMsg);
    }

    private startPingInterval(): void {
        this.pingInterval = setInterval(() => {
            this.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    this.sendPing(client);
                } else {
                    this.clients.delete(client);
                }
            });
        }, 30000); // Ping every 30 seconds
    }

    private stopPingInterval(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    getConnectedClients(): number {
        return this.clients.size;
    }

    disconnectAll(): void {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.close();
            }
        });
        this.clients.clear();
    }

    dispose(): void {
        this.stopPingInterval();
        this.disconnectAll();
    }
}
