import * as vscode from 'vscode';
import WebSocket from 'ws';
import { WebSocketMessage, ApiCallMessage, EndpointStatsMessage, ErrorMessage } from '../types';
import { DataProcessor } from './DataProcessor';
import { ConfigurationManager } from './ConfigurationManager';

export class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private pingInterval: NodeJS.Timeout | null = null;
    private isConnecting = false;

    constructor(private dataProcessor: DataProcessor) {}

    async connect(): Promise<void> {
        if (this.isConnecting || this.isConnected()) {
            return;
        }

        this.isConnecting = true;
        const config = new ConfigurationManager();
        const port = config.getAgentPort();

        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(`ws://localhost:${port}`);

                this.ws.on('open', () => {
                    console.log('Connected to APIViz agent');
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    this.startPingInterval();
                    resolve();
                });

                this.ws.on('message', (data: WebSocket.Data) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(data.toString());
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                });

                this.ws.on('close', (code: number, reason: string) => {
                    console.log(`WebSocket connection closed: ${code} - ${reason}`);
                    this.isConnecting = false;
                    this.stopPingInterval();
                    this.handleReconnect();
                });

                this.ws.on('error', (error: Error) => {
                    console.error('WebSocket error:', error);
                    this.isConnecting = false;
                    this.stopPingInterval();
                    
                    if (this.reconnectAttempts === 0) {
                        reject(error);
                    } else {
                        this.handleReconnect();
                    }
                });

                // Connection timeout
                setTimeout(() => {
                    if (this.isConnecting) {
                        this.isConnecting = false;
                        this.ws?.terminate();
                        reject(new Error('Connection timeout'));
                    }
                }, 5000);

            } catch (error) {
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    async disconnect(): Promise<void> {
        this.stopPingInterval();
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        this.reconnectAttempts = 0;
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    async reconnect(): Promise<void> {
        await this.disconnect();
        await this.connect();
    }

    private handleMessage(message: WebSocketMessage): void {
        switch (message.type) {
            case 'api_call':
                this.dataProcessor.addApiCall((message as ApiCallMessage).data);
                break;
            case 'endpoint_stats':
                this.dataProcessor.updateEndpointStats((message as EndpointStatsMessage).data);
                break;
            case 'error':
                this.handleError((message as ErrorMessage).data);
                break;
            case 'pong':
                // Handle pong response
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    private handleError(error: { message: string; code?: string }): void {
        console.error('Agent error:', error);
        
        if (error.code === 'AGENT_NOT_FOUND') {
            vscode.window.showErrorMessage(
                'APIViz agent not found. Please ensure the agent is running on the configured port.',
                'Open Settings'
            ).then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('apiviz.openSettings');
                }
            });
        }
    }

    private handleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            vscode.window.showErrorMessage(
                'Failed to connect to APIViz agent after multiple attempts. Please check if the agent is running.',
                'Retry',
                'Open Settings'
            ).then(selection => {
                if (selection === 'Retry') {
                    this.reconnectAttempts = 0;
                    this.connect();
                } else if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('apiviz.openSettings');
                }
            });
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.connect().catch(error => {
                console.error('Reconnection failed:', error);
            });
        }, delay);
    }

    private startPingInterval(): void {
        this.pingInterval = setInterval(() => {
            if (this.isConnected()) {
                this.send({ type: 'ping', data: {}, timestamp: Date.now() });
            }
        }, 30000); // Ping every 30 seconds
    }

    private stopPingInterval(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    private send(message: WebSocketMessage): void {
        if (this.isConnected()) {
            this.ws?.send(JSON.stringify(message));
        }
    }

    getConnectionStatus(): { connected: boolean; lastPing?: number } {
        return {
            connected: this.isConnected(),
            lastPing: this.pingInterval ? Date.now() : undefined
        };
    }
}
