import * as vscode from 'vscode';
import { Configuration } from '../types';

export class ConfigurationManager {
    private configuration: Configuration;

    constructor() {
        this.configuration = this.loadConfiguration();
    }

    private loadConfiguration(): Configuration {
        const config = vscode.workspace.getConfiguration('apiviz');
        
        return {
            agentPort: config.get('agentPort', 3001),
            samplingRate: config.get('samplingRate', 1.0),
            minLatencyThreshold: config.get('minLatencyThreshold', 10),
            maxDataPoints: config.get('maxDataPoints', 1000),
            autoStart: config.get('autoStart', false),
            showInlineDecorations: config.get('showInlineDecorations', true),
            endpointFilters: config.get('endpointFilters', ['/api/*'])
        };
    }

    reloadConfiguration(): void {
        this.configuration = this.loadConfiguration();
    }

    getAgentPort(): number {
        return this.configuration.agentPort;
    }

    getSamplingRate(): number {
        return this.configuration.samplingRate;
    }

    getMinLatencyThreshold(): number {
        return this.configuration.minLatencyThreshold;
    }

    getMaxDataPoints(): number {
        return this.configuration.maxDataPoints;
    }

    getAutoStart(): boolean {
        return this.configuration.autoStart;
    }

    getShowInlineDecorations(): boolean {
        return this.configuration.showInlineDecorations;
    }

    getEndpointFilters(): string[] {
        return this.configuration.endpointFilters;
    }

    getConfiguration(): Configuration {
        return { ...this.configuration };
    }

    async updateConfiguration(updates: Partial<Configuration>): Promise<void> {
        const config = vscode.workspace.getConfiguration('apiviz');
        
        for (const [key, value] of Object.entries(updates)) {
            await config.update(key, value, vscode.ConfigurationTarget.Global);
        }
        
        this.reloadConfiguration();
    }

    validateConfiguration(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (this.configuration.agentPort < 1024 || this.configuration.agentPort > 65535) {
            errors.push('Agent port must be between 1024 and 65535');
        }
        
        if (this.configuration.samplingRate < 0.1 || this.configuration.samplingRate > 1.0) {
            errors.push('Sampling rate must be between 0.1 and 1.0');
        }
        
        if (this.configuration.minLatencyThreshold < 0) {
            errors.push('Minimum latency threshold must be non-negative');
        }
        
        if (this.configuration.maxDataPoints < 100) {
            errors.push('Maximum data points must be at least 100');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
