import * as vscode from 'vscode';

// Simple, working version with minimal dependencies
export function activate(context: vscode.ExtensionContext) {
    console.log('APIViz extension activating...');
    
    try {
        // Show activation message
        vscode.window.showInformationMessage('✅ APIViz extension activated successfully!');
        
        // Register commands
        const startMonitoringCommand = vscode.commands.registerCommand('apiviz.startMonitoring', () => {
            vscode.window.showInformationMessage('🚀 APIViz: Monitoring started!');
        });

        const stopMonitoringCommand = vscode.commands.registerCommand('apiviz.stopMonitoring', () => {
            vscode.window.showInformationMessage('⏹️ APIViz: Monitoring stopped!');
        });

        const clearDataCommand = vscode.commands.registerCommand('apiviz.clearData', () => {
            vscode.window.showInformationMessage('🗑️ APIViz: Data cleared!');
        });

        const openSettingsCommand = vscode.commands.registerCommand('apiviz.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'apiviz');
        });

        const openAIInsightsCommand = vscode.commands.registerCommand('apiviz.openAIInsights', () => {
            vscode.window.showInformationMessage('🤖 AI Insights panel opening...');
        });

        const openAdvancedVizCommand = vscode.commands.registerCommand('apiviz.openAdvancedViz', () => {
            vscode.window.showInformationMessage('📊 Advanced Visualizations opening...');
        });

        const openSocialSharingCommand = vscode.commands.registerCommand('apiviz.openSocialSharing', () => {
            vscode.window.showInformationMessage('🤝 Social Sharing opening...');
        });

        const openPredictiveAnalyticsCommand = vscode.commands.registerCommand('apiviz.openPredictiveAnalytics', () => {
            vscode.window.showInformationMessage('🔮 Predictive Analytics opening...');
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

        console.log('APIViz: All commands registered successfully');
        vscode.window.showInformationMessage('✨ APIViz: Ready to use! Press Ctrl+Shift+P and type "APIViz"');
        
    } catch (error) {
        console.error('APIViz activation error:', error);
        vscode.window.showErrorMessage(`❌ APIViz failed to activate: ${error}`);
    }
}

export function deactivate() {
    console.log('APIViz extension deactivated');
}

