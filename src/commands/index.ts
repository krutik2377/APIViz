import * as vscode from 'vscode';
import { DataProcessor } from '../services/DataProcessor';
import { WebSocketService } from '../services/WebSocketService';
import { ChartsWebview } from '../views/ChartsWebview';

export class CommandHandlers {
    private chartsWebview: ChartsWebview;

    constructor(
        private dataProcessor: DataProcessor,
        private webSocketService: WebSocketService
    ) {
        this.chartsWebview = new ChartsWebview(dataProcessor);
    }

    registerCommands(context: vscode.ExtensionContext): void {
        // Show call details command
        const showCallDetailsCommand = vscode.commands.registerCommand(
            'apiviz.showCallDetails',
            (apiCall: any) => {
                this.showCallDetails(apiCall);
            }
        );

        // Show endpoint details command
        const showEndpointDetailsCommand = vscode.commands.registerCommand(
            'apiviz.showEndpointDetails',
            (endpoint: any) => {
                this.showEndpointDetails(endpoint);
            }
        );

        // Show endpoint calls command
        const showEndpointCallsCommand = vscode.commands.registerCommand(
            'apiviz.showEndpointCalls',
            (endpoint: string) => {
                this.showEndpointCalls(endpoint);
            }
        );

        // Copy endpoint URL command
        const copyEndpointUrlCommand = vscode.commands.registerCommand(
            'apiviz.copyEndpointUrl',
            (endpoint: string) => {
                this.copyEndpointUrl(endpoint);
            }
        );

        // Test endpoint command
        const testEndpointCommand = vscode.commands.registerCommand(
            'apiviz.testEndpoint',
            (endpoint: string) => {
                this.testEndpoint(endpoint);
            }
        );

        // Open charts webview command
        const openChartsCommand = vscode.commands.registerCommand(
            'apiviz.openCharts',
            () => {
                this.openCharts(context);
            }
        );

        // Export data command
        const exportDataCommand = vscode.commands.registerCommand(
            'apiviz.exportData',
            () => {
                this.exportData();
            }
        );

        // Import data command
        const importDataCommand = vscode.commands.registerCommand(
            'apiviz.importData',
            () => {
                this.importData();
            }
        );

        context.subscriptions.push(
            showCallDetailsCommand,
            showEndpointDetailsCommand,
            showEndpointCallsCommand,
            copyEndpointUrlCommand,
            testEndpointCommand,
            openChartsCommand,
            exportDataCommand,
            importDataCommand
        );
    }

    private showCallDetails(apiCall: any): void {
        const panel = vscode.window.createWebviewPanel(
            'apivizCallDetails',
            `API Call Details - ${apiCall.method} ${apiCall.url}`,
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = this.getCallDetailsHtml(apiCall);
    }

    private showEndpointDetails(endpoint: any): void {
        const panel = vscode.window.createWebviewPanel(
            'apivizEndpointDetails',
            `Endpoint Details - ${endpoint.endpoint}`,
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = this.getEndpointDetailsHtml(endpoint);
    }

    private showEndpointCalls(endpoint: string): void {
        const calls = this.dataProcessor.getCallsForEndpoint(endpoint, 50);

        if (calls.length === 0) {
            vscode.window.showInformationMessage(`No calls found for endpoint: ${endpoint}`);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'apivizEndpointCalls',
            `Recent Calls - ${endpoint}`,
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = this.getEndpointCallsHtml(endpoint, calls);
    }

    private copyEndpointUrl(endpoint: string): void {
        vscode.env.clipboard.writeText(endpoint);
        vscode.window.showInformationMessage(`Copied endpoint URL: ${endpoint}`);
    }

    private async testEndpoint(endpoint: string): Promise<void> {
        const method = await vscode.window.showQuickPick(
            ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            { placeHolder: 'Select HTTP method' }
        );

        if (!method) {
            return;
        }

        try {
            const startTime = Date.now();
            const fetch = require('node-fetch');
            const response = await fetch(endpoint, { method });
            const endTime = Date.now();
            const latency = endTime - startTime;

            const result = await response.text();

            vscode.window.showInformationMessage(
                `${method} ${endpoint} - ${response.status} (${latency}ms)`
            );

            // Show response in a new document
            const doc = await vscode.workspace.openTextDocument({
                content: `HTTP ${method} ${endpoint}\nStatus: ${response.status}\nLatency: ${latency}ms\n\nResponse:\n${result}`,
                language: 'json'
            });

            await vscode.window.showTextDocument(doc);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to test endpoint: ${error}`);
        }
    }

    private openCharts(context: vscode.ExtensionContext): void {
        this.chartsWebview.createWebview(context);
    }

    private async exportData(): Promise<void> {
        const data = {
            apiCalls: this.dataProcessor.getApiCalls(),
            endpointStats: this.dataProcessor.getEndpointStats(),
            exportDate: new Date().toISOString()
        };

        const jsonData = JSON.stringify(data, null, 2);

        const doc = await vscode.workspace.openTextDocument({
            content: jsonData,
            language: 'json'
        });

        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage('APIViz data exported to new document');
    }

    private async importData(): Promise<void> {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectMany: false,
            filters: {
                'JSON files': ['json']
            }
        });

        if (!fileUri || fileUri.length === 0) {
            return;
        }

        try {
            const fileContent = await vscode.workspace.fs.readFile(fileUri[0]);
            const data = JSON.parse(fileContent.toString());

            if (data.apiCalls && Array.isArray(data.apiCalls)) {
                data.apiCalls.forEach((call: any) => {
                    this.dataProcessor.addApiCall(call);
                });
            }

            if (data.endpointStats && Array.isArray(data.endpointStats)) {
                this.dataProcessor.updateEndpointStats(data.endpointStats);
            }

            vscode.window.showInformationMessage('APIViz data imported successfully');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to import data: ${error}`);
        }
    }

    private getCallDetailsHtml(apiCall: any): string {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>API Call Details</title>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        .detail-item { margin: 10px 0; }
        .label { font-weight: bold; color: var(--vscode-textLink-foreground); }
        .value { margin-left: 10px; }
        .status-${apiCall.statusCode >= 400 ? 'error' : 'success'} { 
            color: ${apiCall.statusCode >= 400 ? '#F44336' : '#4CAF50'}; 
        }
    </style>
</head>
<body>
    <h1>API Call Details</h1>
    <div class="detail-item">
        <span class="label">URL:</span>
        <span class="value">${apiCall.url}</span>
    </div>
    <div class="detail-item">
        <span class="label">Method:</span>
        <span class="value">${apiCall.method}</span>
    </div>
    <div class="detail-item">
        <span class="label">Status Code:</span>
        <span class="value status-${apiCall.statusCode >= 400 ? 'error' : 'success'}">${apiCall.statusCode || 'N/A'}</span>
    </div>
    <div class="detail-item">
        <span class="label">Latency:</span>
        <span class="value">${apiCall.latency}ms</span>
    </div>
    <div class="detail-item">
        <span class="label">Timestamp:</span>
        <span class="value">${new Date(apiCall.timestamp).toLocaleString()}</span>
    </div>
    <div class="detail-item">
        <span class="label">Duration:</span>
        <span class="value">${apiCall.duration}ms</span>
    </div>
    ${apiCall.error ? `
    <div class="detail-item">
        <span class="label">Error:</span>
        <span class="value" style="color: #F44336;">${apiCall.error}</span>
    </div>
    ` : ''}
</body>
</html>`;
    }

    private getEndpointDetailsHtml(endpoint: any): string {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Endpoint Details</title>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        .detail-item { margin: 10px 0; }
        .label { font-weight: bold; color: var(--vscode-textLink-foreground); }
        .value { margin-left: 10px; }
        .status-${endpoint.status} { 
            color: ${endpoint.status === 'healthy' ? '#4CAF50' : endpoint.status === 'warning' ? '#FF9800' : '#F44336'}; 
        }
    </style>
</head>
<body>
    <h1>Endpoint Details</h1>
    <div class="detail-item">
        <span class="label">Endpoint:</span>
        <span class="value">${endpoint.endpoint}</span>
    </div>
    <div class="detail-item">
        <span class="label">Status:</span>
        <span class="value status-${endpoint.status}">${endpoint.status.toUpperCase()}</span>
    </div>
    <div class="detail-item">
        <span class="label">Total Calls:</span>
        <span class="value">${endpoint.totalCalls}</span>
    </div>
    <div class="detail-item">
        <span class="label">Average Latency:</span>
        <span class="value">${endpoint.averageLatency}ms</span>
    </div>
    <div class="detail-item">
        <span class="label">Min Latency:</span>
        <span class="value">${endpoint.minLatency}ms</span>
    </div>
    <div class="detail-item">
        <span class="label">Max Latency:</span>
        <span class="value">${endpoint.maxLatency}ms</span>
    </div>
    <div class="detail-item">
        <span class="label">95th Percentile:</span>
        <span class="value">${endpoint.p95Latency}ms</span>
    </div>
    <div class="detail-item">
        <span class="label">99th Percentile:</span>
        <span class="value">${endpoint.p99Latency}ms</span>
    </div>
    <div class="detail-item">
        <span class="label">Error Rate:</span>
        <span class="value">${endpoint.errorRate.toFixed(1)}%</span>
    </div>
    <div class="detail-item">
        <span class="label">Last Call:</span>
        <span class="value">${endpoint.lastCall ? new Date(endpoint.lastCall).toLocaleString() : 'Never'}</span>
    </div>
</body>
</html>`;
    }

    private getEndpointCallsHtml(endpoint: string, calls: any[]): string {
        const callsHtml = calls.map(call => `
            <tr>
                <td>${call.method}</td>
                <td>${new Date(call.timestamp).toLocaleString()}</td>
                <td>${call.latency}ms</td>
                <td class="status-${call.statusCode >= 400 ? 'error' : 'success'}">${call.statusCode || 'N/A'}</td>
            </tr>
        `).join('');

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Recent Calls - ${endpoint}</title>
    <style>
        body { font-family: var(--vscode-font-family); padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid var(--vscode-panel-border); }
        th { background-color: var(--vscode-panel-background); font-weight: bold; }
        .status-error { color: #F44336; }
        .status-success { color: #4CAF50; }
    </style>
</head>
<body>
    <h1>Recent Calls - ${endpoint}</h1>
    <table>
        <thead>
            <tr>
                <th>Method</th>
                <th>Timestamp</th>
                <th>Latency</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${callsHtml}
        </tbody>
    </table>
</body>
</html>`;
    }
}
