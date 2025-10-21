import * as vscode from 'vscode';
import { DataProcessor } from './DataProcessor';
import { ConfigurationManager } from './ConfigurationManager';

export class InlineDecorator {
    private decorationType: vscode.TextEditorDecorationType;
    private activeDecorations: Map<string, vscode.DecorationOptions[]> = new Map();
    private dataProcessor: DataProcessor;
    private configurationManager: ConfigurationManager;
    private isEnabled = false;

    constructor() {
        this.dataProcessor = new DataProcessor();
        this.configurationManager = new ConfigurationManager();
        
        // Create decoration type for latency display
        this.decorationType = vscode.window.createTextEditorDecorationType({
            after: {
                margin: '0 0 0 1em',
                color: new vscode.ThemeColor('editorInfo.foreground'),
                backgroundColor: new vscode.ThemeColor('editorInfo.background'),
                border: '1px solid',
                borderColor: new vscode.ThemeColor('editorInfo.border')
            },
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        });
    }

    async enable(): Promise<void> {
        this.isEnabled = true;
        
        if (this.configurationManager.getShowInlineDecorations()) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                await this.updateDecorations(editor);
            }
        }
    }

    async disable(): Promise<void> {
        this.isEnabled = false;
        this.clearDecorations();
    }

    async updateDecorations(editor: vscode.TextEditor): Promise<void> {
        if (!this.isEnabled || !this.configurationManager.getShowInlineDecorations()) {
            return;
        }

        const document = editor.document;
        const decorations: vscode.DecorationOptions[] = [];

        // Find API calls in the document
        const apiCallRanges = this.findApiCalls(document);
        
        for (const range of apiCallRanges) {
            const lineText = document.getText(range);
            const apiCall = this.extractApiCallInfo(lineText);
            
            if (apiCall) {
                const latency = this.getLatencyForApiCall(apiCall);
                
                if (latency > 0) {
                    const decoration = this.createLatencyDecoration(range, latency, apiCall);
                    decorations.push(decoration);
                }
            }
        }

        // Apply decorations
        editor.setDecorations(this.decorationType, decorations);
        this.activeDecorations.set(document.uri.toString(), decorations);
    }

    clearDecorations(): void {
        if (vscode.window.activeTextEditor) {
            vscode.window.activeTextEditor.setDecorations(this.decorationType, []);
        }
        this.activeDecorations.clear();
    }

    dispose(): void {
        this.clearDecorations();
        this.decorationType.dispose();
    }

    private findApiCalls(document: vscode.TextDocument): vscode.Range[] {
        const ranges: vscode.Range[] = [];
        const text = document.getText();
        
        // Common API call patterns
        const patterns = [
            /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /\.get\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /\.post\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /\.put\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /\.delete\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /\.patch\s*\(\s*['"`]([^'"`]+)['"`]/g,
            /XMLHttpRequest.*open\s*\(\s*['"`]\w+['"`]\s*,\s*['"`]([^'"`]+)['"`]/g,
            /request\s*\(\s*['"`]([^'"`]+)['"`]/g
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                ranges.push(new vscode.Range(startPos, endPos));
            }
        }

        return ranges;
    }

    private extractApiCallInfo(lineText: string): { url: string; method: string } | null {
        // Extract URL and method from various API call patterns
        const fetchMatch = lineText.match(/fetch\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (fetchMatch) {
            return { url: fetchMatch[1], method: 'GET' };
        }

        const axiosMatch = lineText.match(/axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (axiosMatch) {
            return { url: axiosMatch[2], method: axiosMatch[1].toUpperCase() };
        }

        const methodMatch = lineText.match(/\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (methodMatch) {
            return { url: methodMatch[2], method: methodMatch[1].toUpperCase() };
        }

        const xhrMatch = lineText.match(/XMLHttpRequest.*open\s*\(\s*['"`](\w+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/);
        if (xhrMatch) {
            return { url: xhrMatch[2], method: xhrMatch[1].toUpperCase() };
        }

        const requestMatch = lineText.match(/request\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (requestMatch) {
            return { url: requestMatch[1], method: 'GET' };
        }

        return null;
    }

    private getLatencyForApiCall(apiCall: { url: string; method: string }): number {
        // Get recent calls for this endpoint
        const recentCalls = this.dataProcessor.getRecentCalls(100);
        const matchingCalls = recentCalls.filter(call => 
            call.url.includes(apiCall.url) && call.method === apiCall.method
        );

        if (matchingCalls.length === 0) {
            return 0;
        }

        // Return the most recent latency
        return matchingCalls[0].latency;
    }

    private createLatencyDecoration(
        range: vscode.Range, 
        latency: number, 
        apiCall: { url: string; method: string }
    ): vscode.DecorationOptions {
        const latencyText = this.formatLatency(latency);
        const statusColor = this.getLatencyColor(latency);
        
        const decoration: vscode.DecorationOptions = {
            range: range,
            renderOptions: {
                after: {
                    contentText: ` ${latencyText}`,
                    color: statusColor,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.2)'
                }
            },
            hoverMessage: new vscode.MarkdownString()
                .appendMarkdown(`**API Call Performance**\n\n`)
                .appendMarkdown(`**URL:** ${apiCall.url}\n`)
                .appendMarkdown(`**Method:** ${apiCall.method}\n`)
                .appendMarkdown(`**Latency:** ${latencyText}\n`)
                .appendMarkdown(`**Status:** ${this.getLatencyStatus(latency)}`)
        };

        return decoration;
    }

    private formatLatency(latency: number): string {
        if (latency < 1000) {
            return `${Math.round(latency)}ms`;
        } else {
            return `${(latency / 1000).toFixed(1)}s`;
        }
    }

    private getLatencyColor(latency: number): string {
        if (latency < 100) {
            return '#4CAF50'; // Green
        } else if (latency < 500) {
            return '#FF9800'; // Orange
        } else {
            return '#F44336'; // Red
        }
    }

    private getLatencyStatus(latency: number): string {
        if (latency < 100) {
            return '🟢 Fast';
        } else if (latency < 500) {
            return '🟡 Moderate';
        } else {
            return '🔴 Slow';
        }
    }
}
