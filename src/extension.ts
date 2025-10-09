import * as vscode from 'vscode';
import { LatencyProvider } from './providers/LatencyProvider';
import { EndpointsProvider } from './providers/EndpointsProvider';
import { AIInsightsProvider } from './providers/AIInsightsProvider';
import { WebSocketService } from './services/WebSocketService';
import { DataProcessor } from './services/DataProcessor';
import { InlineDecorator } from './services/InlineDecorator';
import { StatusBarManager } from './services/StatusBarManager';
import { ConfigurationManager } from './services/ConfigurationManager';
import { CommandHandlers } from './commands';
import { AIInsightsWebview } from './views/AIInsightsWebview';

let webSocketService: WebSocketService;
let dataProcessor: DataProcessor;
let latencyProvider: LatencyProvider;
let endpointsProvider: EndpointsProvider;
let inlineDecorator: InlineDecorator;
let statusBarManager: StatusBarManager;
let configurationManager: ConfigurationManager;
let commandHandlers: CommandHandlers;
let aiInsightsProvider: AIInsightsProvider;
let aiInsightsWebview: AIInsightsWebview;

export function activate(context: vscode.ExtensionContext) {
    console.log('APIViz extension is now active!');

    // Initialize services
    configurationManager = new ConfigurationManager();
    dataProcessor = new DataProcessor();
    webSocketService = new WebSocketService(dataProcessor);
    inlineDecorator = new InlineDecorator();
    statusBarManager = new StatusBarManager();

    // Initialize providers
    latencyProvider = new LatencyProvider(dataProcessor);
    endpointsProvider = new EndpointsProvider(dataProcessor);
    aiInsightsProvider = new AIInsightsProvider(dataProcessor);

    // Initialize command handlers
    commandHandlers = new CommandHandlers(dataProcessor, webSocketService);

    // Initialize AI insights webview
    aiInsightsWebview = new AIInsightsWebview(dataProcessor);

    // Register tree data providers
    vscode.window.registerTreeDataProvider('apiviz.latencyView', latencyProvider);
    vscode.window.registerTreeDataProvider('apiviz.endpointsView', endpointsProvider);
    vscode.window.registerTreeDataProvider('apiviz.aiInsightsView', aiInsightsProvider);

    // Register commands
    const startMonitoringCommand = vscode.commands.registerCommand('apiviz.startMonitoring', async () => {
        try {
            await webSocketService.connect();
            await statusBarManager.startMonitoring();
            await inlineDecorator.enable();

            // Update context to show monitoring state
            vscode.commands.executeCommand('setContext', 'apiviz.isMonitoring', true);

            vscode.window.showInformationMessage('APIViz monitoring started!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to start monitoring: ${error}`);
        }
    });

    const stopMonitoringCommand = vscode.commands.registerCommand('apiviz.stopMonitoring', async () => {
        try {
            await webSocketService.disconnect();
            await statusBarManager.stopMonitoring();
            await inlineDecorator.disable();

            // Update context to hide monitoring state
            vscode.commands.executeCommand('setContext', 'apiviz.isMonitoring', false);

            vscode.window.showInformationMessage('APIViz monitoring stopped!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to stop monitoring: ${error}`);
        }
    });

    const clearDataCommand = vscode.commands.registerCommand('apiviz.clearData', () => {
        dataProcessor.clearData();
        latencyProvider.refresh();
        endpointsProvider.refresh();
        inlineDecorator.clearDecorations();
        vscode.window.showInformationMessage('APIViz data cleared!');
    });

    const openSettingsCommand = vscode.commands.registerCommand('apiviz.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'apiviz');
    });

    const instrumentLineCommand = vscode.commands.registerCommand('apiviz.instrumentLine', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        const line = editor.document.lineAt(selection.active.line);

        // Show quick pick with instrumentation options
        vscode.window.showQuickPick([
            'Add latency logging',
            'Add performance timing',
            'Add error handling'
        ]).then((selected: string | undefined) => {
            if (selected) {
                // Implement instrumentation logic here
                vscode.window.showInformationMessage(`Added ${selected.toLowerCase()} to line ${selection.active.line + 1}`);
            }
        });
    });

    const openAIInsightsCommand = vscode.commands.registerCommand('apiviz.openAIInsights', () => {
        aiInsightsWebview.createWebview(context);
    });

    // Register all commands
    context.subscriptions.push(
        startMonitoringCommand,
        stopMonitoringCommand,
        clearDataCommand,
        openSettingsCommand,
        instrumentLineCommand,
        openAIInsightsCommand
    );

    // Register additional command handlers
    commandHandlers.registerCommands(context);

    // Auto-start monitoring if configured
    if (configurationManager.getAutoStart()) {
        vscode.commands.executeCommand('apiviz.startMonitoring');
    }

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
            webSocketService.reconnect();
        }
    });

    context.subscriptions.push(configChangeListener);

    // Handle editor changes for inline decorations
    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
        if (editor && webSocketService.isConnected()) {
            inlineDecorator.updateDecorations(editor);
        }
    });

    context.subscriptions.push(editorChangeListener);

    // Handle document changes for inline decorations
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
        if (vscode.window.activeTextEditor &&
            event.document === vscode.window.activeTextEditor.document &&
            webSocketService.isConnected()) {
            inlineDecorator.updateDecorations(vscode.window.activeTextEditor);
        }
    });

    context.subscriptions.push(documentChangeListener);
}

export function deactivate() {
    console.log('APIViz extension is being deactivated');

    if (webSocketService) {
        webSocketService.disconnect();
    }

    if (statusBarManager) {
        statusBarManager.dispose();
    }

    if (inlineDecorator) {
        inlineDecorator.dispose();
    }
}
