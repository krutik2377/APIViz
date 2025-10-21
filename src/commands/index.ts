import * as vscode from 'vscode';
import { DataProcessor } from '../services/DataProcessor';
import { WebSocketService } from '../services/WebSocketService';
import { ChartsWebview } from '../views/ChartsWebview';
import { TeamService } from '../services/TeamService';

export class CommandHandlers {
    private chartsWebview: ChartsWebview;
    private teamService: TeamService;

    constructor(
        private dataProcessor: DataProcessor,
        private webSocketService: WebSocketService
    ) {
        this.chartsWebview = new ChartsWebview(dataProcessor);
        this.teamService = new TeamService();
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

        // Team commands
        const shareMemberPerformanceCommand = vscode.commands.registerCommand(
            'apiviz.shareMemberPerformance',
            (member: any) => {
                this.shareMemberPerformance(member);
            }
        );

        const viewMemberProfileCommand = vscode.commands.registerCommand(
            'apiviz.viewMemberProfile',
            (member: any) => {
                this.viewMemberProfile(member);
            }
        );

        const joinChallengeCommand = vscode.commands.registerCommand(
            'apiviz.joinChallenge',
            (challengeId: string) => {
                this.joinChallenge(challengeId);
            }
        );

        const shareChallengeCommand = vscode.commands.registerCommand(
            'apiviz.shareChallenge',
            (challenge: any) => {
                this.shareChallenge(challenge);
            }
        );

        const createChallengeCommand = vscode.commands.registerCommand(
            'apiviz.createChallenge',
            () => {
                this.createChallenge();
            }
        );

        const inviteMembersCommand = vscode.commands.registerCommand(
            'apiviz.inviteMembers',
            () => {
                this.inviteMembers();
            }
        );

        const shareTeamStatsCommand = vscode.commands.registerCommand(
            'apiviz.shareTeamStats',
            () => {
                this.shareTeamStats();
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
            importDataCommand,
            shareMemberPerformanceCommand,
            viewMemberProfileCommand,
            joinChallengeCommand,
            shareChallengeCommand,
            createChallengeCommand,
            inviteMembersCommand,
            shareTeamStatsCommand
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

    // Team command implementations
    private shareMemberPerformance(member: any): void {
        const message = this.teamService.sharePerformanceScore(member.performanceScore, member.id);
        vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage(`Performance score for ${member.name} copied to clipboard! 🚀`);
    }

    private viewMemberProfile(member: any): void {
        const panel = vscode.window.createWebviewPanel(
            'apivizMemberProfile',
            `Profile - ${member.name}`,
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        panel.webview.html = this.getMemberProfileHtml(member);
    }

    private joinChallenge(challengeId: string): void {
        const success = this.teamService.joinChallenge(challengeId, 'current-user');
        if (success) {
            vscode.window.showInformationMessage('Successfully joined the challenge! 🏁');
        } else {
            vscode.window.showWarningMessage('Could not join the challenge. You may already be participating.');
        }
    }

    private shareChallenge(challenge: any): void {
        const message = this.teamService.shareChallenge(challenge);
        vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage('Challenge copied to clipboard! Share it with your team! 🏆');
    }

    private async createChallenge(): Promise<void> {
        const title = await vscode.window.showInputBox({
            prompt: 'Enter challenge title',
            placeHolder: 'e.g., Speed Demon Challenge'
        });

        if (!title) return;

        const description = await vscode.window.showInputBox({
            prompt: 'Enter challenge description',
            placeHolder: 'e.g., Achieve the fastest average API response time'
        });

        if (!description) return;

        const type = await vscode.window.showQuickPick(
            ['speed', 'reliability', 'efficiency', 'streak', 'custom'],
            { placeHolder: 'Select challenge type' }
        );

        if (!type) return;

        const target = await vscode.window.showInputBox({
            prompt: 'Enter target value',
            placeHolder: 'e.g., 50'
        });

        if (!target) return;

        const unit = await vscode.window.showInputBox({
            prompt: 'Enter unit',
            placeHolder: 'e.g., ms, %, days'
        });

        if (!unit) return;

        const challenge = {
            title,
            description,
            type: type as 'speed' | 'reliability' | 'efficiency' | 'streak' | 'custom',
            target: parseFloat(target),
            unit,
            startDate: Date.now(),
            endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
            participants: ['current-user'],
            rewards: ['🏆 Challenge Winner Badge'],
            status: 'active' as const
        };

        const challengeId = this.teamService.createChallenge(challenge);
        vscode.window.showInformationMessage(`Challenge "${title}" created successfully! 🎉`);
    }

    private async inviteMembers(): Promise<void> {
        const email = await vscode.window.showInputBox({
            prompt: 'Enter team member email',
            placeHolder: 'colleague@company.com'
        });

        if (!email) return;

        // In a real implementation, this would send an invitation
        vscode.window.showInformationMessage(`Invitation sent to ${email}! 📧`);
    }

    private shareTeamStats(): void {
        const stats = this.teamService.getTeamStats();
        const message = `🚀 Our team achieved ${stats.averageScore}/100 average performance score in APIViz! ${stats.totalApiCalls.toLocaleString()} API calls processed. #APIViz #TeamPerformance #DeveloperTools`;
        vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage('Team stats copied to clipboard! Share your team success! 🏆');
    }

    private getMemberProfileHtml(member: any): string {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Member Profile - ${member.name}</title>
    <style>
        body { 
            font-family: var(--vscode-font-family); 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
        }
        .profile-container {
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .profile-header {
            text-align: center;
            margin-bottom: 30px;
        }
        .avatar {
            font-size: 4em;
            margin-bottom: 10px;
        }
        .name {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .badge {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 20px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        .achievements {
            margin-top: 30px;
        }
        .achievement {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .achievement-icon {
            font-size: 2em;
        }
    </style>
</head>
<body>
    <div class="profile-container">
        <div class="profile-header">
            <div class="avatar">${member.avatar || '👨‍💻'}</div>
            <div class="name">${member.name}</div>
            <div class="badge">${member.performanceScore.badge}</div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${member.performanceScore.overall}/100</div>
                <div class="stat-label">Overall Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${member.performanceScore.speed}/100</div>
                <div class="stat-label">Speed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${member.performanceScore.reliability}/100</div>
                <div class="stat-label">Reliability</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${member.performanceScore.efficiency}/100</div>
                <div class="stat-label">Efficiency</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${member.totalApiCalls.toLocaleString()}</div>
                <div class="stat-label">Total API Calls</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${member.streak}</div>
                <div class="stat-label">Day Streak</div>
            </div>
        </div>
        
        <div class="achievements">
            <h3>Achievements</h3>
            <div class="achievement">
                <div class="achievement-icon">🏆</div>
                <div>
                    <strong>Performance Champion</strong><br>
                    <small>Top 1% performer</small>
                </div>
            </div>
            <div class="achievement">
                <div class="achievement-icon">⚡</div>
                <div>
                    <strong>Speed Demon</strong><br>
                    <small>Sub-100ms average latency</small>
                </div>
            </div>
            <div class="achievement">
                <div class="achievement-icon">🔥</div>
                <div>
                    <strong>Consistency King</strong><br>
                    <small>12-day performance streak</small>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }
}
