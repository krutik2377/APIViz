"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketManager = void 0;
const ws_1 = require("ws");
class WebSocketManager {
    constructor(wss, metricsCollector) {
        this.wss = wss;
        this.metricsCollector = metricsCollector;
        this.clients = new Set();
        this.pingInterval = null;
        this.setupWebSocketServer();
        this.startPingInterval();
    }
    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            console.log('New WebSocket client connected');
            this.clients.add(ws);
            // Send initial data to new client
            this.sendInitialData(ws);
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMessage(ws, message);
                }
                catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    this.sendError(ws, 'Invalid message format');
                }
            });
            ws.on('close', () => {
                console.log('WebSocket client disconnected');
                this.clients.delete(ws);
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
            // Send ping to test connection
            this.sendPing(ws);
        });
    }
    handleMessage(ws, message) {
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
    sendInitialData(ws) {
        try {
            // Send recent API calls
            const recentCalls = this.metricsCollector.getRecentCalls(50);
            recentCalls.forEach(call => {
                const message = {
                    type: 'api_call',
                    data: call,
                    timestamp: Date.now()
                };
                this.sendMessage(ws, message);
            });
            // Send endpoint stats
            const endpointStats = this.metricsCollector.getEndpointStats();
            const statsMessage = {
                type: 'endpoint_stats',
                data: endpointStats,
                timestamp: Date.now()
            };
            this.sendMessage(ws, statsMessage);
        }
        catch (error) {
            console.error('Error sending initial data:', error);
            this.sendError(ws, 'Failed to send initial data');
        }
    }
    broadcastApiCall(apiCall) {
        const message = {
            type: 'api_call',
            data: apiCall,
            timestamp: Date.now()
        };
        this.broadcast(message);
    }
    broadcastEndpointStats(stats) {
        const message = {
            type: 'endpoint_stats',
            data: stats,
            timestamp: Date.now()
        };
        this.broadcast(message);
    }
    broadcast(message) {
        const messageStr = JSON.stringify(message);
        this.clients.forEach(client => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                try {
                    client.send(messageStr);
                }
                catch (error) {
                    console.error('Error broadcasting message:', error);
                    this.clients.delete(client);
                }
            }
        });
    }
    sendMessage(ws, message) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
            }
            catch (error) {
                console.error('Error sending message:', error);
            }
        }
    }
    sendPing(ws) {
        const pingMessage = {
            type: 'ping',
            data: {},
            timestamp: Date.now()
        };
        this.sendMessage(ws, pingMessage);
    }
    sendPong(ws) {
        const pongMessage = {
            type: 'pong',
            data: {},
            timestamp: Date.now()
        };
        this.sendMessage(ws, pongMessage);
    }
    sendError(ws, errorMessage) {
        const errorMsg = {
            type: 'error',
            data: { message: errorMessage },
            timestamp: Date.now()
        };
        this.sendMessage(ws, errorMsg);
    }
    startPingInterval() {
        this.pingInterval = setInterval(() => {
            this.clients.forEach(client => {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    this.sendPing(client);
                }
                else {
                    this.clients.delete(client);
                }
            });
        }, 30000); // Ping every 30 seconds
    }
    stopPingInterval() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }
    getConnectedClients() {
        return this.clients.size;
    }
    disconnectAll() {
        this.clients.forEach(client => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.close();
            }
        });
        this.clients.clear();
    }
    dispose() {
        this.stopPingInterval();
        this.disconnectAll();
    }
}
exports.WebSocketManager = WebSocketManager;
//# sourceMappingURL=WebSocketManager.js.map