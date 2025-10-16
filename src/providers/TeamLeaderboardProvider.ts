import * as vscode from 'vscode';
import { TeamService, TeamMember, TeamChallenge, TeamStats } from '../services/TeamService';

export interface TeamTreeNode {
    label: string;
    description: string;
    iconPath?: vscode.ThemeIcon;
    children?: TeamTreeNode[];
    collapsibleState?: vscode.TreeItemCollapsibleState;
    command?: vscode.Command;
    contextValue?: string;
    member?: TeamMember;
    challenge?: TeamChallenge;
    stats?: TeamStats;
}

export class TeamLeaderboardProvider implements vscode.TreeDataProvider<TeamTreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TeamTreeNode | undefined | null | void> = new vscode.EventEmitter<TeamTreeNode | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TeamTreeNode | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private teamService: TeamService) {
        // Listen to team updates
        this.teamService.onTeamUpdate(() => {
            this.refresh();
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TeamTreeNode): vscode.TreeItem {
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

    getChildren(element?: TeamTreeNode): Thenable<TeamTreeNode[]> {
        if (!element) {
            return this.getRootElements();
        } else {
            return Promise.resolve(element.children || []);
        }
    }

    private async getRootElements(): Promise<TeamTreeNode[]> {
        const elements: TeamTreeNode[] = [];
        const teamStats = this.teamService.getTeamStats();
        const teamMembers = this.teamService.getTeamMembers();
        const challenges = this.teamService.getActiveChallenges();

        // Team Overview
        elements.push({
            label: 'Team Overview',
            description: `${teamStats.totalMembers} members`,
            iconPath: new vscode.ThemeIcon('organization'),
            collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
            children: [
                {
                    label: `Average Score: ${teamStats.averageScore}/100`,
                    description: this.getScoreDescription(teamStats.averageScore),
                    iconPath: new vscode.ThemeIcon('graph')
                },
                {
                    label: `Total API Calls: ${teamStats.totalApiCalls.toLocaleString()}`,
                    description: 'Team performance',
                    iconPath: new vscode.ThemeIcon('pulse')
                },
                {
                    label: `Active Challenges: ${teamStats.activeChallenges}`,
                    description: 'Ongoing competitions',
                    iconPath: new vscode.ThemeIcon('trophy')
                },
                {
                    label: `Team Rank: ${teamStats.teamRank ? `#${teamStats.teamRank}` : 'Unranked'}`,
                    description: 'Global ranking',
                    iconPath: new vscode.ThemeIcon('medal')
                }
            ]
        });

        // Team Leaderboard
        elements.push({
            label: 'Team Leaderboard',
            description: `${teamMembers.length} members`,
            iconPath: new vscode.ThemeIcon('leaderboard'),
            collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
            children: teamMembers.map((member, index) => ({
                label: `${this.getRankIcon(index + 1)} ${member.name}`,
                description: `${member.performanceScore.overall}/100 - ${member.performanceScore.badge}`,
                iconPath: new vscode.ThemeIcon('person'),
                contextValue: 'teamMember',
                member: member,
                collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                children: [
                    {
                        label: 'Performance Metrics',
                        description: 'Detailed scores',
                        iconPath: new vscode.ThemeIcon('graph'),
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        children: [
                            {
                                label: `Speed: ${member.performanceScore.speed}/100`,
                                description: this.getSpeedDescription(member.performanceScore.speed),
                                iconPath: new vscode.ThemeIcon('zap')
                            },
                            {
                                label: `Reliability: ${member.performanceScore.reliability}/100`,
                                description: this.getReliabilityDescription(member.performanceScore.reliability),
                                iconPath: new vscode.ThemeIcon('shield')
                            },
                            {
                                label: `Efficiency: ${member.performanceScore.efficiency}/100`,
                                description: this.getEfficiencyDescription(member.performanceScore.efficiency),
                                iconPath: new vscode.ThemeIcon('graph')
                            }
                        ]
                    },
                    {
                        label: 'Statistics',
                        description: 'Activity data',
                        iconPath: new vscode.ThemeIcon('bar-chart'),
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        children: [
                            {
                                label: `Total Calls: ${member.totalApiCalls.toLocaleString()}`,
                                description: 'API requests made',
                                iconPath: new vscode.ThemeIcon('pulse')
                            },
                            {
                                label: `Streak: ${member.streak} days`,
                                description: 'Performance streak',
                                iconPath: new vscode.ThemeIcon('flame')
                            },
                            {
                                label: `Last Active: ${this.formatLastActive(member.lastActive)}`,
                                description: 'Recent activity',
                                iconPath: new vscode.ThemeIcon('clock')
                            }
                        ]
                    },
                    {
                        label: 'Actions',
                        description: 'Available actions',
                        iconPath: new vscode.ThemeIcon('tools'),
                        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                        children: [
                            {
                                label: 'Share Performance',
                                description: 'Share on social media',
                                iconPath: new vscode.ThemeIcon('share'),
                                command: {
                                    command: 'apiviz.shareMemberPerformance',
                                    title: 'Share Performance',
                                    arguments: [member]
                                }
                            },
                            {
                                label: 'View Profile',
                                description: 'See detailed profile',
                                iconPath: new vscode.ThemeIcon('person'),
                                command: {
                                    command: 'apiviz.viewMemberProfile',
                                    title: 'View Profile',
                                    arguments: [member]
                                }
                            }
                        ]
                    }
                ]
            }))
        });

        // Active Challenges
        if (challenges.length > 0) {
            elements.push({
                label: 'Active Challenges',
                description: `${challenges.length} ongoing`,
                iconPath: new vscode.ThemeIcon('trophy'),
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                children: challenges.map(challenge => ({
                    label: challenge.title,
                    description: `${challenge.participants.length} participants`,
                    iconPath: this.getChallengeIcon(challenge.type),
                    contextValue: 'challenge',
                    challenge: challenge,
                    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                    children: [
                        {
                            label: 'Challenge Details',
                            description: 'Information',
                            iconPath: new vscode.ThemeIcon('info'),
                            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                            children: [
                                {
                                    label: `Target: ${challenge.target}${challenge.unit}`,
                                    description: 'Goal to achieve',
                                    iconPath: new vscode.ThemeIcon('target')
                                },
                                {
                                    label: `Participants: ${challenge.participants.length}`,
                                    description: 'Team members',
                                    iconPath: new vscode.ThemeIcon('person')
                                },
                                {
                                    label: `Ends: ${this.formatDate(challenge.endDate)}`,
                                    description: 'Challenge deadline',
                                    iconPath: new vscode.ThemeIcon('calendar')
                                }
                            ]
                        },
                        {
                            label: 'Leaderboard',
                            description: 'Current standings',
                            iconPath: new vscode.ThemeIcon('leaderboard'),
                            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                            children: challenge.leaderboard.map((member, index) => ({
                                label: `${this.getRankIcon(index + 1)} ${member.name}`,
                                description: this.getChallengeScore(member, challenge.type),
                                iconPath: new vscode.ThemeIcon('person')
                            }))
                        },
                        {
                            label: 'Actions',
                            description: 'Available actions',
                            iconPath: new vscode.ThemeIcon('tools'),
                            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
                            children: [
                                {
                                    label: 'Join Challenge',
                                    description: 'Participate in challenge',
                                    iconPath: new vscode.ThemeIcon('add'),
                                    command: {
                                        command: 'apiviz.joinChallenge',
                                        title: 'Join Challenge',
                                        arguments: [challenge.id]
                                    }
                                },
                                {
                                    label: 'Share Challenge',
                                    description: 'Share on social media',
                                    iconPath: new vscode.ThemeIcon('share'),
                                    command: {
                                        command: 'apiviz.shareChallenge',
                                        title: 'Share Challenge',
                                        arguments: [challenge]
                                    }
                                }
                            ]
                        }
                    ]
                }))
            });
        }

        // Team Actions
        elements.push({
            label: 'Team Actions',
            description: 'Manage team',
            iconPath: new vscode.ThemeIcon('tools'),
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            children: [
                {
                    label: 'Create Challenge',
                    description: 'Start a new team challenge',
                    iconPath: new vscode.ThemeIcon('add'),
                    command: {
                        command: 'apiviz.createChallenge',
                        title: 'Create Challenge'
                    }
                },
                {
                    label: 'Invite Members',
                    description: 'Add team members',
                    iconPath: new vscode.ThemeIcon('person-add'),
                    command: {
                        command: 'apiviz.inviteMembers',
                        title: 'Invite Members'
                    }
                },
                {
                    label: 'Share Team Stats',
                    description: 'Share team performance',
                    iconPath: new vscode.ThemeIcon('share'),
                    command: {
                        command: 'apiviz.shareTeamStats',
                        title: 'Share Team Stats'
                    }
                }
            ]
        });

        return elements;
    }

    private getRankIcon(rank: number): string {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `${rank}.`;
        }
    }

    private getChallengeIcon(type: string): vscode.ThemeIcon {
        switch (type) {
            case 'speed': return new vscode.ThemeIcon('zap');
            case 'reliability': return new vscode.ThemeIcon('shield');
            case 'efficiency': return new vscode.ThemeIcon('graph');
            case 'streak': return new vscode.ThemeIcon('flame');
            default: return new vscode.ThemeIcon('trophy');
        }
    }

    private getChallengeScore(member: TeamMember, type: string): string {
        switch (type) {
            case 'speed':
                return `${member.performanceScore.speed}/100`;
            case 'reliability':
                return `${member.performanceScore.reliability}/100`;
            case 'efficiency':
                return `${member.performanceScore.efficiency}/100`;
            case 'streak':
                return `${member.streak} days`;
            default:
                return `${member.performanceScore.overall}/100`;
        }
    }

    private getScoreDescription(score: number): string {
        if (score >= 90) return 'Excellent team performance!';
        if (score >= 80) return 'Great team performance';
        if (score >= 70) return 'Good team performance';
        if (score >= 60) return 'Average team performance';
        return 'Team needs improvement';
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

    private formatLastActive(timestamp: number): string {
        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            return `${Math.floor(diff / 60000)}m ago`;
        } else if (diff < 86400000) { // Less than 1 day
            return `${Math.floor(diff / 3600000)}h ago`;
        } else {
            return `${Math.floor(diff / 86400000)}d ago`;
        }
    }

    private formatDate(timestamp: number): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = timestamp - now.getTime();

        // Handle past timestamps
        if (diff <= 0) {
            return 'Expired';
        }

        // Handle future timestamps
        if (diff < 86400000) { // Less than 1 day
            return `${Math.floor(diff / 3600000)}h remaining`;
        } else {
            return `${Math.floor(diff / 86400000)}d remaining`;
        }
    }
}
