import * as vscode from 'vscode';
import { AIPerformanceAnalyzer, PerformanceInsight, PerformanceScore } from '../services/AIPerformanceAnalyzer';
import { DataProcessor } from '../services/DataProcessor';

export class AIInsightsWebview {
    private panel: vscode.WebviewPanel | undefined;
    private dataProcessor: DataProcessor;
    private aiAnalyzer: AIPerformanceAnalyzer;
    private latestInsights: PerformanceInsight[] = [];
    private latestPerformanceScore: PerformanceScore | null = null;

    constructor(dataProcessor: DataProcessor) {
        this.dataProcessor = dataProcessor;
        this.aiAnalyzer = new AIPerformanceAnalyzer();
    }

    public createWebview(context: vscode.ExtensionContext): vscode.WebviewPanel {
        this.panel = vscode.window.createWebviewPanel(
            'apivizAIInsights',
            'AI Performance Insights',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.webview.html = this.getWebviewContent();

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'requestInsights':
                        this.sendInsightsToWebview();
                        break;
                    case 'applySuggestion':
                        this.applySuggestion(message.insight?.id || message.insightId);
                        break;
                    case 'shareAchievement':
                        this.shareAchievement(message.achievement?.id || message.achievementId);
                        break;
                    case 'learnMore':
                        this.handleLearnMore(message.insightId || message.insight?.id);
                        break;
                }
            },
            undefined,
            context.subscriptions
        );

        // Send initial data
        this.sendInsightsToWebview();

        // Set up data refresh
        const refreshInterval = setInterval(() => {
            if (this.panel && this.panel.visible) {
                this.sendInsightsToWebview();
            }
        }, 5000);

        this.panel.onDidDispose(() => {
            clearInterval(refreshInterval);
        });

        return this.panel;
    }

    private sendInsightsToWebview(): void {
        if (!this.panel) {
            return;
        }

        const metrics = this.dataProcessor.getPerformanceMetrics();
        const endpointStats = this.dataProcessor.getEndpointStats();
        const recentCalls = this.dataProcessor.getRecentCalls(1000);

        if (metrics.totalCalls === 0) {
            this.panel.webview.postMessage({
                type: 'noData',
                data: {}
            });
            return;
        }

        const insights = this.aiAnalyzer.analyzePerformance(metrics, endpointStats, recentCalls);
        const performanceScore = this.aiAnalyzer.calculatePerformanceScore(metrics, endpointStats, recentCalls);

        // Store the latest insights and performance score for lookup by ID
        this.latestInsights = insights;
        this.latestPerformanceScore = performanceScore;

        this.panel.webview.postMessage({
            type: 'insights',
            data: {
                insights,
                performanceScore,
                metrics,
                endpointStats
            }
        });
    }

    private applySuggestion(insightId?: string): void {
        const insight = insightId ? this.latestInsights.find(item => item.id === insightId) : undefined;

        if (!insight) {
            vscode.window.showWarningMessage('Unable to locate the selected insight.');
            return;
        }

        if (insight.action?.command) {
            vscode.commands.executeCommand(insight.action.command, insight);
        } else if (insight.action?.link) {
            vscode.env.openExternal(vscode.Uri.parse(insight.action.link));
        }

        vscode.window.showInformationMessage(`Applied suggestion: ${insight.title}`);
    }

    private shareAchievement(achievementId?: string): void {
        const achievement = achievementId && this.latestPerformanceScore
            ? this.latestPerformanceScore.achievements.find(item => item.id === achievementId)
            : undefined;

        if (!achievement) {
            vscode.window.showWarningMessage('Unable to locate the selected achievement.');
            return;
        }

        const message = `🏆 Just unlocked "${achievement.name}" in APIViz! ${achievement.description} #APIViz #Performance #DeveloperTools`;

        vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage('Achievement copied to clipboard! Share it on social media! 🚀');
    }

    private handleLearnMore(insightId: string): void {
        const insight = this.latestInsights.find(i => i.id === insightId);

        if (!insight) {
            vscode.window.showWarningMessage('Unable to locate the selected insight.');
            return;
        }

        if (insight.action?.link) {
            vscode.env.openExternal(vscode.Uri.parse(insight.action.link));
            vscode.window.showInformationMessage(`Opening: ${insight.title}`);
        } else if (insight.action?.command) {
            vscode.commands.executeCommand(insight.action.command, insight);
        } else {
            vscode.window.showInformationMessage(insight.message);
        }
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'none'; 
                   style-src 'unsafe-inline'; 
                   script-src 'unsafe-inline';">
    <title>AI Performance Insights</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .score-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
        }
        
        .score-circle {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            background: conic-gradient(#4CAF50 0deg, #4CAF50 var(--score-angle), #e0e0e0 var(--score-angle), #e0e0e0 360deg);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            position: relative;
        }
        
        .score-inner {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .score-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #333;
        }
        
        .score-label {
            font-size: 0.9em;
            color: #666;
        }
        
        .badge {
            font-size: 1.5em;
            margin: 10px 0;
        }
        
        .rank {
            font-size: 1.2em;
            color: #666;
            margin-bottom: 20px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .metric-card {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }
        
        .metric-label {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }
        
        .insights-section {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .insight-card {
            background: white;
            border-radius: 15px;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-left: 5px solid #4CAF50;
            transition: transform 0.3s ease;
        }
        
        .insight-card:hover {
            transform: translateX(5px);
        }
        
        .insight-card.error {
            border-left-color: #F44336;
        }
        
        .insight-card.warning {
            border-left-color: #FF9800;
        }
        
        .insight-card.info {
            border-left-color: #2196F3;
        }
        
        .insight-title {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        
        .insight-message {
            color: #666;
            margin-bottom: 15px;
            line-height: 1.5;
        }
        
        .insight-suggestion {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            border-left: 3px solid #4CAF50;
        }
        
        .insight-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            background: #45a049;
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: #2196F3;
        }
        
        .btn-secondary:hover {
            background: #1976D2;
        }
        
        .achievements-section {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .achievement-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .achievement-card {
            background: white;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .achievement-card:hover {
            transform: translateY(-5px);
        }
        
        .achievement-icon {
            font-size: 3em;
            margin-bottom: 15px;
        }
        
        .achievement-name {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        
        .achievement-description {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 15px;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.3s ease;
        }
        
        .no-data {
            text-align: center;
            padding: 50px;
            color: white;
        }
        
        .no-data h2 {
            font-size: 2em;
            margin-bottom: 20px;
        }
        
        .no-data p {
            font-size: 1.2em;
            opacity: 0.8;
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI Performance Insights</h1>
            <p>Powered by artificial intelligence to optimize your API performance</p>
        </div>
        
        <div id="content">
            <div class="no-data">
                <h2>🚀 Ready for AI Analysis</h2>
                <p>Start monitoring your APIs to unlock AI-powered performance insights!</p>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'insights':
                    displayInsights(message.data);
                    break;
                case 'noData':
                    displayNoData();
                    break;
            }
        });
        
        function displayInsights(data) {
            const content = document.getElementById('content');
            
            content.innerHTML = \`
                <div class="score-card fade-in">
                    <div class="score-circle" style="--score-angle: \${data.performanceScore.overall * 3.6}deg">
                        <div class="score-inner">
                            <div class="score-number">\${data.performanceScore.overall}</div>
                            <div class="score-label">Score</div>
                        </div>
                    </div>
                    <div class="badge">\${data.performanceScore.badge}</div>
                    <div class="rank">\${data.performanceScore.rank}</div>
                    
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">\${data.performanceScore.speed}</div>
                            <div class="metric-label">Speed Score</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">\${data.performanceScore.reliability}</div>
                            <div class="metric-label">Reliability Score</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">\${data.performanceScore.efficiency}</div>
                            <div class="metric-label">Efficiency Score</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">\${data.performanceScore.streak}</div>
                            <div class="metric-label">Day Streak</div>
                        </div>
                    </div>
                </div>
                
                <div class="insights-section fade-in">
                    <h2>🧠 AI Performance Insights</h2>
                    \${data.insights.map(insight => \`
                        <div class="insight-card \${insight.type}">
                            <div class="insight-title">\${insight.title}</div>
                            <div class="insight-message">\${insight.message}</div>
                            <div class="insight-suggestion">
                                <strong>💡 Suggestion:</strong> \${insight.suggestion}
                            </div>
                            <div class="insight-actions">
                                <button class="btn" onclick="applySuggestion('\${insight.id}')">
                                    Apply Suggestion
                                </button>
                                <button class="btn btn-secondary" onclick="learnMore('\${insight.id}')">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    \`).join('')}
                </div>
                
                <div class="achievements-section fade-in">
                    <h2>🏆 Achievements</h2>
                    <div class="achievement-grid">
                        \${data.performanceScore.achievements.map(achievement => \`
                            <div class="achievement-card \${achievement.unlocked ? 'pulse' : ''}">
                                <div class="achievement-icon">\${achievement.icon}</div>
                                <div class="achievement-name">\${achievement.name}</div>
                                <div class="achievement-description">\${achievement.description}</div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: \${(achievement.progress / achievement.maxProgress) * 100}%"></div>
                                </div>
                                <div style="font-size: 0.8em; color: #666;">
                                    \${achievement.progress}/\${achievement.maxProgress}
                                </div>
                                \${achievement.unlocked ? \`
                                    <button class="btn" onclick="shareAchievement('\${achievement.id}')" style="margin-top: 10px;">
                                        Share Achievement
                                    </button>
                                \` : ''}
                            </div>
                        \`).join('')}
                    </div>
                </div>
            \`;
        }
        
        function displayNoData() {
            const content = document.getElementById('content');
            content.innerHTML = \`
                <div class="no-data">
                    <h2>🚀 Ready for AI Analysis</h2>
                    <p>Start monitoring your APIs to unlock AI-powered performance insights!</p>
                </div>
            \`;
        }
        
        function applySuggestion(insightId) {
            vscode.postMessage({ command: 'applySuggestion', insight: { id: insightId } });
        }
        
        function learnMore(insightId) {
            vscode.postMessage({ command: 'learnMore', insight: { id: insightId } });
        }
        
        function shareAchievement(achievementId) {
            vscode.postMessage({ command: 'shareAchievement', achievement: { id: achievementId } });
        }
        
        // Request initial data
        vscode.postMessage({ command: 'requestInsights' });
    </script>
</body>
</html>`;
    }
}
