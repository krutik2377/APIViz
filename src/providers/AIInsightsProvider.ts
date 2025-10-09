import * as vscode from 'vscode';
import { AIPerformanceAnalyzer, PerformanceInsight, PerformanceScore } from '../services/AIPerformanceAnalyzer';
import { DataProcessor } from '../services/DataProcessor';

export interface AIInsightTreeNode {
    label: string;
    description: string;
    iconPath?: vscode.ThemeIcon;
    children?: AIInsightTreeNode[];
    collapsibleState?: vscode.TreeItemCollapsibleState;
    command?: vscode.Command;
    contextValue?: string;
    insight?: PerformanceInsight;
    score?: PerformanceScore;
}

export class AIInsightsProvider implements vscode.TreeDataProvider<AIInsightTreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<AIInsightTreeNode | undefined | null | void> = new vscode.EventEmitter<AIInsightTreeNode | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<AIInsightTreeNode | undefined | null | void> = this._onDidChangeTreeData.event;

    private aiAnalyzer: AIPerformanceAnalyzer;
    private insights: PerformanceInsight[] = [];
    private performanceScore: PerformanceScore | null = null;

    constructor(private dataProcessor: DataProcessor) {
        this.aiAnalyzer = new AIPerformanceAnalyzer();
        
        // Listen to data changes
        this.dataProcessor.onDataChanged(() => {
            this.refresh();
        });
    }

    refresh(): void {
        this.analyzePerformance();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: AIInsightTreeNode): vscode.TreeItem {
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

    getChildren(element?: AIInsightTreeNode): Thenable<AIInsightTreeNode[]> {
        if (!element) {
            return this.getRootElements();
        } else {
            return Promise.resolve(element.children || []);
        }
    }

    private async getRootElements(): Promise<AIInsightTreeNode[]> {
        const elements: AIInsightTreeNode[] = [];

        // Performance Score Section
        if (this.performanceScore) {
            elements.push({
                label: 'Performance Score',
                description: `${this.performanceScore.overall}/100`,
                iconPath: new vscode.ThemeIcon('star'),
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                children: [
                    {
                        label: this.performanceScore.badge,
                        description: `Rank: ${this.performanceScore.rank}`,
                        iconPath: new vscode.ThemeIcon('trophy')
                    },
                    {
                        label: `Speed: ${this.performanceScore.speed}/100`,
                        description: this.getSpeedDescription(this.performanceScore.speed),
                        iconPath: new vscode.ThemeIcon('zap')
                    },
                    {
                        label: `Reliability: ${this.performanceScore.reliability}/100`,
                        description: this.getReliabilityDescription(this.performanceScore.reliability),
                        iconPath: new vscode.ThemeIcon('shield')
                    },
                    {
                        label: `Efficiency: ${this.performanceScore.efficiency}/100`,
                        description: this.getEfficiencyDescription(this.performanceScore.efficiency),
                        iconPath: new vscode.ThemeIcon('graph')
                    },
                    {
                        label: `Streak: ${this.performanceScore.streak} days`,
                        description: 'Days without critical errors',
                        iconPath: new vscode.ThemeIcon('flame')
                    }
                ]
            });

            // Achievements
            if (this.performanceScore.achievements.length > 0) {
                elements.push({
                    label: 'Achievements',
                    description: `${this.performanceScore.achievements.filter(a => a.unlocked).length} unlocked`,
                    iconPath: new vscode.ThemeIcon('medal'),
                    collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                    children: this.performanceScore.achievements.map(achievement => ({
                        label: `${achievement.icon} ${achievement.name}`,
                        description: achievement.unlocked ? 'Unlocked!' : `${achievement.progress}/${achievement.maxProgress}`,
                        iconPath: new vscode.ThemeIcon(achievement.unlocked ? 'check' : 'clock'),
                        contextValue: 'achievement'
                    }))
                });
            }
        }

        // AI Insights Section
        if (this.insights.length > 0) {
            const criticalInsights = this.insights.filter(i => i.impact === 'critical');
            const highInsights = this.insights.filter(i => i.impact === 'high');
            const mediumInsights = this.insights.filter(i => i.impact === 'medium');
            const lowInsights = this.insights.filter(i => i.impact === 'low');

            elements.push({
                label: 'AI Performance Insights',
                description: `${this.insights.length} insights`,
                iconPath: new vscode.ThemeIcon('lightbulb'),
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                children: [
                    ...this.createInsightGroup('Critical Issues', criticalInsights, 'error'),
                    ...this.createInsightGroup('High Priority', highInsights, 'warning'),
                    ...this.createInsightGroup('Medium Priority', mediumInsights, 'info'),
                    ...this.createInsightGroup('Optimization Tips', lowInsights, 'check')
                ]
            });
        }

        // If no data, show placeholder
        if (elements.length === 0) {
            elements.push({
                label: 'No AI insights available',
                description: 'Start monitoring to get AI-powered performance insights',
                iconPath: new vscode.ThemeIcon('info')
            });
        }

        return elements;
    }

    private createInsightGroup(
        title: string,
        insights: PerformanceInsight[],
        iconType: string
    ): AIInsightTreeNode[] {
        if (insights.length === 0) return [];

        const groupNode: AIInsightTreeNode = {
            label: title,
            description: `${insights.length} items`,
            iconPath: new vscode.ThemeIcon(iconType),
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            children: insights.map(insight => ({
                label: insight.title,
                description: this.truncateText(insight.message, 60),
                iconPath: this.getInsightIcon(insight.type),
                contextValue: 'insight',
                insight: insight,
                command: {
                    command: 'apiviz.showInsightDetails',
                    title: 'Show Details',
                    arguments: [insight]
                }
            }))
        };

        return [groupNode];
    }

    private analyzePerformance(): void {
        const metrics = this.dataProcessor.getPerformanceMetrics();
        const endpointStats = this.dataProcessor.getEndpointStats();
        const recentCalls = this.dataProcessor.getRecentCalls(1000);

        if (metrics.totalCalls === 0) {
            this.insights = [];
            this.performanceScore = null;
            return;
        }

        // Generate AI insights
        this.insights = this.aiAnalyzer.analyzePerformance(metrics, endpointStats, recentCalls);
        
        // Calculate performance score
        this.performanceScore = this.aiAnalyzer.calculatePerformanceScore(metrics, endpointStats, recentCalls);
    }

    private getInsightIcon(type: string): vscode.ThemeIcon {
        switch (type) {
            case 'success':
                return new vscode.ThemeIcon('check');
            case 'warning':
                return new vscode.ThemeIcon('warning');
            case 'error':
                return new vscode.ThemeIcon('error');
            case 'info':
                return new vscode.ThemeIcon('info');
            default:
                return new vscode.ThemeIcon('question');
        }
    }

    private getSpeedDescription(score: number): string {
        if (score >= 90) return 'Lightning fast!';
        if (score >= 80) return 'Very fast';
        if (score >= 70) return 'Good speed';
        if (score >= 60) return 'Average speed';
        return 'Needs optimization';
    }

    private getReliabilityDescription(score: number): string {
        if (score >= 90) return 'Rock solid!';
        if (score >= 80) return 'Very reliable';
        if (score >= 70) return 'Good reliability';
        if (score >= 60) return 'Average reliability';
        return 'Needs improvement';
    }

    private getEfficiencyDescription(score: number): string {
        if (score >= 90) return 'Highly efficient!';
        if (score >= 80) return 'Very efficient';
        if (score >= 70) return 'Good efficiency';
        if (score >= 60) return 'Average efficiency';
        return 'Needs optimization';
    }

    private truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + '...';
    }

    getInsights(): PerformanceInsight[] {
        return this.insights;
    }

    getPerformanceScore(): PerformanceScore | null {
        return this.performanceScore;
    }
}
