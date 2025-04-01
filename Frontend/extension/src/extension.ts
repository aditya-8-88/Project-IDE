import * as vscode from 'vscode';
import { CollaborationViewProvider } from './webview/provider';
import { connectCmd } from './webview/commands/connect';
import { startSessionCmd } from './webview/commands/startSession';
import { disconnectCmd } from './webview/commands/disconnect';
import { createStatusBarItem } from './webview/statusBar';
import { ExtensionState } from './state/extensionState';


export async function activate(context: vscode.ExtensionContext) {
    try {
        const state = ExtensionState.getInstance();
        
        // Initialize provider
        state.provider = new CollaborationViewProvider(context.extensionUri);
        
        // Register disposables
        context.subscriptions.push(
            // WebView Provider
            vscode.window.registerWebviewViewProvider(
                CollaborationViewProvider.viewType, 
                state.provider
            ),

            // Commands
            vscode.commands.registerCommand(
                'project-ide.startSession', 
                () => startSessionCmd(context, state)
            ),
            vscode.commands.registerCommand(
                'project-ide.connect',
                () => connectCmd(context, state)
            ),
            vscode.commands.registerCommand(
                'project-ide.disconnect',
                () => disconnectCmd(context, state)
            ),

            // Status Bar
            createStatusBarItem()
        );

    } catch (error) {
        if (error instanceof Error) {
            console.error('Extension activation failed:', error.message);
            vscode.window.showErrorMessage(`Activation failed: ${error.message}`);
        }
        throw error;
    }
}

export function deactivate() {
    const state = ExtensionState.getInstance();

    if (state.client) {
        state.client.disconnect();
        vscode.window.showInformationMessage('Extension Deactivated');
    }

    if (state.provider) {
        state.provider.dispose();
        state.provider = undefined;
    }
}