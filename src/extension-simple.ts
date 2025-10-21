import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('APIViz extension is now active!');
    vscode.window.showInformationMessage('APIViz extension activated successfully!');

    // Register a simple command to test
    const startMonitoringCommand = vscode.commands.registerCommand('apiviz.startMonitoring', () => {
        vscode.window.showInformationMessage('APIViz monitoring started!');
    });

    const stopMonitoringCommand = vscode.commands.registerCommand('apiviz.stopMonitoring', () => {
        vscode.window.showInformationMessage('APIViz monitoring stopped!');
    });

    // Register commands
    context.subscriptions.push(startMonitoringCommand, stopMonitoringCommand);
}

export function deactivate() {
    console.log('APIViz extension is being deactivated');
}
