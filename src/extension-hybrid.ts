import * as vscode from 'vscode';
import { LatencyProvider } from './providers/LatencyProvider';
import { EndpointsProvider } from './providers/EndpointsProvider';
import { AIInsightsProvider } from './providers/AIInsightsProvider';
import { DataProcessor } from './services/DataProcessor';
import { InlineDecorator } from './services/InlineDecorator';
import { StatusBarManager } from './services/StatusBarManager';
import { ConfigurationManager } from './services/ConfigurationManager';
import { AIInsightsWebview } from './views/AIInsightsWebview';
import { TeamService } from './services/TeamService';
import { TeamLeaderboardProvider } from './providers/TeamLeaderboardProvider';
import { MLPredictiveEngine } from './services/MLPredictiveEngine';
import { PredictiveAnalyticsWebview } from './views/PredictiveAnalyticsWebview';

// NOTE: WebSocketService removed - causes issues in VS Code environment
// Can be added back with proper VS Code-compatible implementation

let dataProcessor: DataProcessor;
let latencyProvider: LatencyProvider;
let endpointsProvider: EndpointsProvider;
let inlineDecorator: InlineDecorator;
let statusBarManager: StatusBarManager;
let configurationManager: ConfigurationManager;
let aiInsightsProvider: AIInsightsProvider;
let aiInsightsWebview: AIInsightsWebview;
let teamService: TeamService;
let teamLeaderboardProvider: TeamLeaderboardProvider;
let mlPredictiveEngine: MLPredictiveEngine;
let predictiveAnalyticsWebview: PredictiveAnalyticsWebview;

export function activate(context: vscode.ExtensionContext) {
    console.log('APIViz extension is now active!');
    
    try {
        vscode.window.showInformationMessage('✅ APIViz extension activated successfully!');

        // Initialize services (without WebSocket)
        configurationManager = new ConfigurationManager();
        dataProcessor = new DataProcessor();
        inlineDecorator = new InlineDecorator();
        statusBarManager = new StatusBarManager();

        // Initialize providers
        latencyProvider = new LatencyProvider(dataProcessor);
        endpointsProvider = new EndpointsProvider(dataProcessor);
        aiInsightsProvider = new AIInsightsProvider(dataProcessor);

        // Initialize webviews
        aiInsightsWebview = new AIInsightsWebview(dataProcessor);
        
        // Initialize team services
        teamService = new TeamService();
        teamLeaderboardProvider = new TeamLeaderboardProvider(teamService);

        // Initialize ML
        mlPredictiveEngine = new MLPredictiveEngine();
        predictiveAnalyticsWebview = new PredictiveAnalyticsWebview(dataProcessor);

        // Register tree data providers
        vscode.window.registerTreeDataProvider('apiviz.latencyView', latencyProvider);
        vscode.window.registerTreeDataProvider('apiviz.endpointsView', endpointsProvider);
        vscode.window.registerTreeDataProvider('apiviz.aiInsightsView', aiInsightsProvider);
        vscode.window.registerTreeDataProvider('apiviz.teamLeaderboardView', teamLeaderboardProvider);

        // Register commands
        const startMonitoringCommand = vscode.commands.registerCommand('apiviz.startMonitoring', async () => {
            try {
                await statusBarManager.startMonitoring();
                await inlineDecorator.enable();
                vscode.commands.executeCommand('setContext', 'apiviz.isMonitoring', true);
                vscode.window.showInformationMessage('🚀 APIViz monitoring started!');
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to start monitoring: ${error}`);
            }
        });

        const stopMonitoringCommand = vscode.commands.registerCommand('apiviz.stopMonitoring', async () => {
            try {
                await statusBarManager.stopMonitoring();
                await inlineDecorator.disable();
                vscode.commands.executeCommand('setContext', 'apiviz.isMonitoring', false);
                vscode.window.showInformationMessage('⏹️ APIViz monitoring stopped!');
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to stop monitoring: ${error}`);
            }
        });

        const clearDataCommand = vscode.commands.registerCommand('apiviz.clearData', () => {
            dataProcessor.clearData();
            latencyProvider.refresh();
            endpointsProvider.refresh();
            inlineDecorator.clearDecorations();
            vscode.window.showInformationMessage('🗑️ APIViz data cleared!');
        });

        const openSettingsCommand = vscode.commands.registerCommand('apiviz.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'apiviz');
        });

        const openAIInsightsCommand = vscode.commands.registerCommand('apiviz.openAIInsights', () => {
            aiInsightsWebview.createWebview(context);
        });

        const openAdvancedVizCommand = vscode.commands.registerCommand('apiviz.openAdvancedViz', () => {
            vscode.window.showInformationMessage('📊 Advanced Visualizations - Coming soon!');
        });

        const openSocialSharingCommand = vscode.commands.registerCommand('apiviz.openSocialSharing', () => {
            vscode.window.showInformationMessage('🤝 Social Sharing - Coming soon!');
        });

        const openPredictiveAnalyticsCommand = vscode.commands.registerCommand('apiviz.openPredictiveAnalytics', () => {
            predictiveAnalyticsWebview.createWebview(context);
        });

        // Register all commands
        context.subscriptions.push(
            startMonitoringCommand,
            stopMonitoringCommand,
            clearDataCommand,
            openSettingsCommand,
            openAIInsightsCommand,
            openAdvancedVizCommand,
            openSocialSharingCommand,
            openPredictiveAnalyticsCommand
        );

        // Set up data refresh intervals
        const refreshInterval = setInterval(() => {
            latencyProvider.refresh();
            endpointsProvider.refresh();
            statusBarManager.updateStatus();
        }, 1000);

        context.subscriptions.push({
            dispose: () => clearInterval(refreshInterval)
        });

        // Handle configuration changes
        const configChangeListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
            if (event.affectsConfiguration('apiviz')) {
                configurationManager.reloadConfiguration();
            }
        });

        context.subscriptions.push(configChangeListener);

        // Handle editor changes for inline decorations
        const editorChangeListener = vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
            if (editor) {
                inlineDecorator.updateDecorations(editor);
            }
        });

        context.subscriptions.push(editorChangeListener);

        vscode.window.showInformationMessage('✨ APIViz: All features loaded! Check the Activity Bar for the APIViz icon.');
        
    } catch (error) {
        console.error('APIViz activation error:', error);
        vscode.window.showErrorMessage(`❌ APIViz failed to activate: ${error}`);
    }
}

export function deactivate() {
    console.log('APIViz extension is being deactivated');

    if (statusBarManager) {
        statusBarManager.dispose();
    }

    if (inlineDecorator) {
        inlineDecorator.dispose();
    }
}

