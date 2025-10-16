import * as vscode from 'vscode';
import { PerformanceScore, Achievement } from './AIPerformanceAnalyzer';

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    performanceScore: PerformanceScore;
    joinDate: number;
    lastActive: number;
    totalApiCalls: number;
    achievements: Achievement[];
    rank: number;
    streak: number;
}

export interface TeamChallenge {
    id: string;
    title: string;
    description: string;
    type: 'speed' | 'reliability' | 'efficiency' | 'streak' | 'custom';
    target: number;
    unit: string;
    startDate: number;
    endDate: number;
    participants: string[];
    leaderboard: TeamMember[];
    rewards: string[];
    status: 'active' | 'completed' | 'upcoming';
}

export interface TeamStats {
    totalMembers: number;
    averageScore: number;
    topPerformer: TeamMember;
    totalApiCalls: number;
    teamAchievements: Achievement[];
    activeChallenges: number;
    teamRank: number;
}

export class TeamService {
    private teamMembers: Map<string, TeamMember> = new Map();
    private challenges: Map<string, TeamChallenge> = new Map();
    private eventEmitter = new vscode.EventEmitter<void>();

    public readonly onTeamUpdate = this.eventEmitter.event;

    constructor() {
        this.initializeDefaultTeam();
        this.initializeDefaultChallenges();
    }

    private initializeDefaultTeam(): void {
        // Add current user as team member
        const currentUser: TeamMember = {
            id: 'current-user',
            name: 'You',
            email: 'developer@example.com',
            avatar: '👨‍💻',
            performanceScore: {
                overall: 85,
                speed: 90,
                reliability: 80,
                efficiency: 85,
                badge: '⚡ Lightning Fast',
                rank: 'Top 10%',
                streak: 5,
                achievements: []
            },
            joinDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
            lastActive: Date.now(),
            totalApiCalls: 1250,
            achievements: [],
            rank: 1,
            streak: 5
        };

        this.teamMembers.set(currentUser.id, currentUser);

        // Add some demo team members
        const demoMembers: TeamMember[] = [
            {
                id: 'alex-dev',
                name: 'Alex Chen',
                email: 'alex@team.com',
                avatar: '👩‍💻',
                performanceScore: {
                    overall: 92,
                    speed: 95,
                    reliability: 88,
                    efficiency: 93,
                    badge: '🏆 Performance Champion',
                    rank: 'Top 1%',
                    streak: 12,
                    achievements: []
                },
                joinDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
                lastActive: Date.now() - 2 * 60 * 60 * 1000,
                totalApiCalls: 5420,
                achievements: [],
                rank: 1,
                streak: 12
            },
            {
                id: 'sarah-dev',
                name: 'Sarah Johnson',
                email: 'sarah@team.com',
                avatar: '👨‍💻',
                performanceScore: {
                    overall: 78,
                    speed: 75,
                    reliability: 85,
                    efficiency: 74,
                    badge: '💨 Quick & Reliable',
                    rank: 'Top 25%',
                    streak: 3,
                    achievements: []
                },
                joinDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
                lastActive: Date.now() - 30 * 60 * 1000,
                totalApiCalls: 2890,
                achievements: [],
                rank: 3,
                streak: 3
            },
            {
                id: 'mike-dev',
                name: 'Mike Rodriguez',
                email: 'mike@team.com',
                avatar: '👨‍💻',
                performanceScore: {
                    overall: 88,
                    speed: 85,
                    reliability: 92,
                    efficiency: 87,
                    badge: '🚀 Speed Demon',
                    rank: 'Top 10%',
                    streak: 8,
                    achievements: []
                },
                joinDate: Date.now() - 20 * 24 * 60 * 60 * 1000,
                lastActive: Date.now() - 5 * 60 * 1000,
                totalApiCalls: 4100,
                achievements: [],
                rank: 2,
                streak: 8
            }
        ];

        demoMembers.forEach(member => {
            this.teamMembers.set(member.id, member);
        });

        this.updateRanks();
    }

    private initializeDefaultChallenges(): void {
        const challenges: TeamChallenge[] = [
            {
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
            },
            {
                id: 'reliability-challenge',
                title: '🛡️ Zero Error Challenge',
                description: 'Maintain 99.9% uptime for 7 days straight',
                type: 'reliability',
                target: 99.9,
                unit: '%',
                startDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
                endDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
                participants: ['current-user', 'alex-dev', 'sarah-dev', 'mike-dev'],
                leaderboard: [],
                rewards: ['🛡️ Reliability Master Badge', '💎 Perfect Score Title'],
                status: 'active'
            },
            {
                id: 'streak-challenge',
                title: '🔥 Performance Streak',
                description: 'Maintain a performance streak for 30 days',
                type: 'streak',
                target: 30,
                unit: 'days',
                startDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
                endDate: Date.now() + 20 * 24 * 60 * 60 * 1000,
                participants: ['current-user', 'alex-dev', 'mike-dev'],
                leaderboard: [],
                rewards: ['🔥 Streak Master Badge', '👑 Consistency King Title'],
                status: 'active'
            }
        ];

        challenges.forEach(challenge => {
            this.challenges.set(challenge.id, challenge);
            this.updateChallengeLeaderboard(challenge.id);
        });
    }

    getTeamMembers(): TeamMember[] {
        return Array.from(this.teamMembers.values()).sort((a, b) => a.rank - b.rank);
    }

    getTeamStats(): TeamStats {
        const members = this.getTeamMembers();
        const totalMembers = members.length;
        const averageScore = members.reduce((sum, member) => sum + member.performanceScore.overall, 0) / totalMembers;
        const topPerformer = members[0];
        const totalApiCalls = members.reduce((sum, member) => sum + member.totalApiCalls, 0);
        const activeChallenges = Array.from(this.challenges.values()).filter(c => c.status === 'active').length;

        return {
            totalMembers,
            averageScore: Math.round(averageScore),
            topPerformer,
            totalApiCalls,
            teamAchievements: [],
            activeChallenges,
            teamRank: 1 // This would be calculated against other teams
        };
    }

    getChallenges(): TeamChallenge[] {
        return Array.from(this.challenges.values()).sort((a, b) => {
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (b.status === 'active' && a.status !== 'active') return 1;
            return b.startDate - a.startDate;
        });
    }

    getActiveChallenges(): TeamChallenge[] {
        return this.getChallenges().filter(challenge => challenge.status === 'active');
    }

    updateMemberPerformance(memberId: string, performanceScore: PerformanceScore, totalCalls: number): void {
        const member = this.teamMembers.get(memberId);
        if (member) {
            member.performanceScore = performanceScore;
            member.totalApiCalls = totalCalls;
            member.lastActive = Date.now();

            this.updateRanks();
            this.updateChallengeLeaderboards();
            this.eventEmitter.fire();
        }
    }

    joinChallenge(challengeId: string, memberId: string): boolean {
        const challenge = this.challenges.get(challengeId);
        if (challenge && challenge.status === 'active' && !challenge.participants.includes(memberId)) {
            challenge.participants.push(memberId);
            this.updateChallengeLeaderboard(challengeId);
            this.eventEmitter.fire();
            return true;
        }
        return false;
    }

    leaveChallenge(challengeId: string, memberId: string): boolean {
        const challenge = this.challenges.get(challengeId);
        if (challenge && challenge.participants.includes(memberId)) {
            challenge.participants = challenge.participants.filter(id => id !== memberId);
            this.updateChallengeLeaderboard(challengeId);
            this.eventEmitter.fire();
            return true;
        }
        return false;
    }

    createChallenge(challenge: Omit<TeamChallenge, 'id' | 'leaderboard'>): string {
        const id = `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newChallenge: TeamChallenge = {
            ...challenge,
            id,
            leaderboard: []
        };

        this.challenges.set(id, newChallenge);
        this.updateChallengeLeaderboard(id);
        this.eventEmitter.fire();

        return id;
    }

    shareAchievement(achievement: Achievement, memberId: string): string {
        const member = this.teamMembers.get(memberId);
        if (member) {
            const message = `🏆 ${member.name} just unlocked "${achievement.name}" in APIViz! ${achievement.description} #APIViz #Performance #DeveloperTools`;
            return message;
        }
        return '';
    }

    sharePerformanceScore(score: PerformanceScore, memberId: string): string {
        const member = this.teamMembers.get(memberId);
        if (member) {
            const message = `🚀 ${member.name} achieved a ${score.overall}/100 performance score in APIViz! ${score.badge} - ${score.rank} #APIViz #Performance #DeveloperTools`;
            return message;
        }
        return '';
    }

    shareChallenge(challenge: TeamChallenge): string {
        const message = `🏁 Join the "${challenge.title}" challenge in APIViz! ${challenge.description} Target: ${challenge.target}${challenge.unit} #APIViz #TeamChallenge #Performance`;
        return message;
    }

    private updateRanks(): void {
        const members = Array.from(this.teamMembers.values());
        members.sort((a, b) => b.performanceScore.overall - a.performanceScore.overall);

        members.forEach((member, index) => {
            member.rank = index + 1;
        });
    }

    private updateChallengeLeaderboards(): void {
        this.challenges.forEach((challenge, challengeId) => {
            this.updateChallengeLeaderboard(challengeId);
        });
    }

    private updateChallengeLeaderboard(challengeId: string): void {
        const challenge = this.challenges.get(challengeId);
        if (!challenge) return;

        const participants = challenge.participants
            .map(id => this.teamMembers.get(id))
            .filter((member): member is TeamMember => member !== undefined);

        // Sort participants based on challenge type
        participants.sort((a, b) => {
            switch (challenge.type) {
                case 'speed':
                    return a.performanceScore.speed - b.performanceScore.speed;
                case 'reliability':
                    return b.performanceScore.reliability - a.performanceScore.reliability;
                case 'efficiency':
                    return b.performanceScore.efficiency - a.performanceScore.efficiency;
                case 'streak':
                    return b.streak - a.streak;
                default:
                    return b.performanceScore.overall - a.performanceScore.overall;
            }
        });

        challenge.leaderboard = participants;
    }

    getMemberById(id: string): TeamMember | undefined {
        return this.teamMembers.get(id);
    }

    getChallengeById(id: string): TeamChallenge | undefined {
        return this.challenges.get(id);
    }

    addTeamMember(member: Omit<TeamMember, 'id' | 'rank'>): string {
        const id = `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newMember: TeamMember = {
            ...member,
            id,
            rank: 0
        };

        this.teamMembers.set(id, newMember);
        this.updateRanks();
        this.eventEmitter.fire();

        return id;
    }

    removeTeamMember(id: string): boolean {
        if (this.teamMembers.has(id)) {
            this.teamMembers.delete(id);
            this.updateRanks();
            this.eventEmitter.fire();
            return true;
        }
        return false;
    }
}
