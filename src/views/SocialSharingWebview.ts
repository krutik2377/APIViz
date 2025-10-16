import * as vscode from 'vscode';
import { TeamService, TeamMember, TeamChallenge, TeamStats } from '../services/TeamService';
import { PerformanceScore, Achievement } from '../services/AIPerformanceAnalyzer';

export class SocialSharingWebview {
    private panel: vscode.WebviewPanel | undefined;
    private teamService: TeamService;

    constructor(teamService: TeamService) {
        this.teamService = teamService;
    }

    public createWebview(context: vscode.ExtensionContext): vscode.WebviewPanel {
        this.panel = vscode.window.createWebviewPanel(
            'apivizSocialSharing',
            'APIViz Social Sharing',
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
                    case 'shareAchievement':
                        this.shareAchievement(message.achievement);
                        break;
                    case 'sharePerformance':
                        this.sharePerformance(message.performance);
                        break;
                    case 'shareChallenge':
                        this.shareChallenge(message.challenge);
                        break;
                    case 'shareTeamStats':
                        this.shareTeamStats();
                        break;
                    case 'generateMeme':
                        this.generateMeme(message.data);
                        break;
                    case 'createGIF':
                        this.createGIF(message.data);
                        break;
                }
            },
            undefined,
            context.subscriptions
        );

        return this.panel;
    }

    private shareAchievement(achievement: Achievement): void {
        const message = this.teamService.shareAchievement(achievement, 'current-user');
        vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage('Achievement copied to clipboard! Share it on social media! 🚀');
    }

    private sharePerformance(performance: PerformanceScore): void {
        const message = this.teamService.sharePerformanceScore(performance, 'current-user');
        vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage('Performance score copied to clipboard! Share your success! 🎉');
    }

    private shareChallenge(challenge: TeamChallenge): void {
        const message = this.teamService.shareChallenge(challenge);
        vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage('Challenge copied to clipboard! Invite your team! 🏁');
    }

    private shareTeamStats(): void {
        const stats = this.teamService.getTeamStats();
        const message = `🚀 Our team achieved ${stats.averageScore}/100 average performance score in APIViz! ${stats.totalApiCalls.toLocaleString()} API calls processed. #APIViz #TeamPerformance #DeveloperTools`;
        vscode.env.clipboard.writeText(message);
        vscode.window.showInformationMessage('Team stats copied to clipboard! Share your team success! 🏆');
    }

    private generateMeme(data: any): void {
        // This would integrate with a meme generation API
        vscode.window.showInformationMessage('Meme generation feature coming soon! 🎭');
    }

    private createGIF(data: any): void {
        // This would create animated GIFs of performance data
        vscode.window.showInformationMessage('GIF creation feature coming soon! 🎬');
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>APIViz Social Sharing</title>
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
        
        .sharing-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .sharing-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        
        .sharing-card:hover {
            transform: translateY(-5px);
        }
        
        .card-title {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .card-description {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .share-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1em;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .share-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .preview-section {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .preview-title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 20px;
            color: #333;
        }
        
        .social-preview {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .social-preview h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 1.1em;
        }
        
        .social-preview p {
            margin: 0;
            color: #666;
            line-height: 1.4;
        }
        
        .hashtags {
            color: #1da1f2;
            margin-top: 10px;
        }
        
        .meme-generator {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .meme-templates {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .meme-template {
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .meme-template:hover {
            border-color: #667eea;
            background: #f0f2ff;
        }
        
        .meme-template img {
            width: 100%;
            height: 120px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        
        .gif-creator {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .gif-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .gif-option {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .gif-option:hover {
            border-color: #667eea;
            background: #f0f2ff;
        }
        
        .gif-option h4 {
            margin: 0 0 10px 0;
            color: #333;
        }
        
        .gif-option p {
            margin: 0;
            color: #666;
            font-size: 0.9em;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 APIViz Social Sharing</h1>
            <p>Share your performance achievements and inspire the developer community!</p>
        </div>
        
        <div class="sharing-grid">
            <div class="sharing-card">
                <div class="card-title">
                    🏆 Share Achievement
                </div>
                <div class="card-description">
                    Share your latest performance achievements and unlock badges with the community.
                </div>
                <button class="share-btn" onclick="shareAchievement()">
                    Share Achievement
                </button>
            </div>
            
            <div class="sharing-card">
                <div class="card-title">
                    📊 Share Performance Score
                </div>
                <div class="card-description">
                    Show off your API performance score and inspire others to optimize their code.
                </div>
                <button class="share-btn" onclick="sharePerformance()">
                    Share Performance
                </button>
            </div>
            
            <div class="sharing-card">
                <div class="card-title">
                    🏁 Share Challenge
                </div>
                <div class="card-description">
                    Invite your team to join performance challenges and compete together.
                </div>
                <button class="share-btn" onclick="shareChallenge()">
                    Share Challenge
                </button>
            </div>
            
            <div class="sharing-card">
                <div class="card-title">
                    👥 Share Team Stats
                </div>
                <div class="card-description">
                    Showcase your team's collective performance and achievements.
                </div>
                <button class="share-btn" onclick="shareTeamStats()">
                    Share Team Stats
                </button>
            </div>
        </div>
        
        <div class="preview-section">
            <div class="preview-title">📱 Social Media Preview</div>
            <div class="social-preview">
                <h3>APIViz Performance Update</h3>
                <p>🚀 Just achieved a 92/100 performance score in APIViz! ⚡ Lightning Fast - Top 1% #APIViz #Performance #DeveloperTools</p>
                <div class="hashtags">#APIViz #Performance #DeveloperTools #WebDev #APIOptimization</div>
            </div>
        </div>
        
        <div class="meme-generator">
            <div class="preview-title">🎭 Performance Meme Generator</div>
            <p>Create hilarious memes about your API performance journey!</p>
            <div class="meme-templates">
                <div class="meme-template" onclick="generateMeme('drake')">
                    <div style="background: #f0f0f0; height: 120px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                        🎵 Drake Template
                    </div>
                    <div>Drake Meme</div>
                </div>
                <div class="meme-template" onclick="generateMeme('distracted')">
                    <div style="background: #f0f0f0; height: 120px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                        😍 Distracted Boyfriend
                    </div>
                    <div>Distracted Boyfriend</div>
                </div>
                <div class="meme-template" onclick="generateMeme('woman')">
                    <div style="background: #f0f0f0; height: 120px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                        👩 Woman Yelling at Cat
                    </div>
                    <div>Woman Yelling at Cat</div>
                </div>
                <div class="meme-template" onclick="generateMeme('this')">
                    <div style="background: #f0f0f0; height: 120px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                        👆 This is Fine
                    </div>
                    <div>This is Fine</div>
                </div>
            </div>
        </div>
        
        <div class="gif-creator">
            <div class="preview-title">🎬 Performance GIF Creator</div>
            <p>Create animated GIFs showing your performance improvements over time!</p>
            <div class="gif-options">
                <div class="gif-option" onclick="createGIF('latency')">
                    <h4>📈 Latency Improvement</h4>
                    <p>Show how your API latency improved over time</p>
                </div>
                <div class="gif-option" onclick="createGIF('score')">
                    <h4>🏆 Score Progression</h4>
                    <p>Animate your performance score growth</p>
                </div>
                <div class="gif-option" onclick="createGIF('achievements')">
                    <h4>🎖️ Achievement Unlock</h4>
                    <p>Show your achievements being unlocked</p>
                </div>
                <div class="gif-option" onclick="createGIF('team')">
                    <h4>👥 Team Competition</h4>
                    <p>Animate team leaderboard changes</p>
                </div>
            </div>
        </div>
        
        <div class="preview-section">
            <div class="preview-title">📊 Your Sharing Stats</div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">12</div>
                    <div class="stat-label">Achievements Shared</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">156</div>
                    <div class="stat-label">Social Media Likes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">8</div>
                    <div class="stat-label">Team Invites</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">3</div>
                    <div class="stat-label">Memes Created</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function shareAchievement() {
            const achievement = {
                id: 'speed-demon',
                name: 'Speed Demon',
                description: 'Achieved sub-100ms average latency',
                icon: '⚡',
                unlocked: true,
                progress: 100,
                maxProgress: 100
            };
            
            vscode.postMessage({
                command: 'shareAchievement',
                achievement: achievement
            });
        }
        
        function sharePerformance() {
            const performance = {
                overall: 92,
                speed: 95,
                reliability: 88,
                efficiency: 93,
                badge: '🏆 Performance Champion',
                rank: 'Top 1%',
                streak: 12,
                achievements: []
            };
            
            vscode.postMessage({
                command: 'sharePerformance',
                performance: performance
            });
        }
        
        function shareChallenge() {
            const challenge = {
                id: 'speed-challenge',
                title: '⚡ Speed Demon Challenge',
                description: 'Achieve the fastest average API response time',
                type: 'speed',
                target: 50,
                unit: 'ms',
                startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
                endDate: Date.now() + 4 * 24 * 60 * 60 * 1000,
                participants: ['current-user', 'alex-dev', 'mike-dev'],
                leaderboard: [],
                rewards: ['🏆 Speed Champion Badge', '⚡ Lightning Fast Title'],
                status: 'active'
            };
            
            vscode.postMessage({
                command: 'shareChallenge',
                challenge: challenge
            });
        }
        
        function shareTeamStats() {
            vscode.postMessage({
                command: 'shareTeamStats'
            });
        }
        
        function generateMeme(template) {
            vscode.postMessage({
                command: 'generateMeme',
                data: { template: template }
            });
        }
        
        function createGIF(type) {
            vscode.postMessage({
                command: 'createGIF',
                data: { type: type }
            });
        }
    </script>
</body>
</html>`;
    }
}
