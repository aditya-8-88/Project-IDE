import * as vscode from 'vscode';
import { CollaborationViewProvider } from './webview/provider';
import { connectCmd } from './webview/commands/connect';
import { startSessionCmd } from './webview/commands/startSession';
import { disconnectCmd } from './webview/commands/disconnect';
import { createStatusBarItem } from './webview/statusBar';
import { ExtensionState } from './state/extensionState';
import { loginCmd } from './webview/commands/login';
import { logoutCmd } from './webview/commands/logout';
import { AuthenticationService } from './services/authentication';


export async function activate(context: vscode.ExtensionContext) {
    try {
        const state = ExtensionState.getInstance();
        
        // Initialize provider
        state.provider = new CollaborationViewProvider(context.extensionUri);

        // Initialize auth service and check for existing auth
        state.authService = new AuthenticationService(context);

        // Check for existing auth
        const storedAuth = await state.authService.getStoredAuthInfo();
        if (storedAuth) {
            state.authInfo = storedAuth;
            if (state.provider) {
                state.provider.updateAuthState(true);
            }
        }
        
        
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
            vscode.commands.registerCommand(
                'project-ide.login',
                (provider: 'google' | 'github') => loginCmd(provider, context, state)
            ),
            vscode.commands.registerCommand(
                'project-ide.logout',
                () => logoutCmd(context, state)
            ),
            vscode.commands.registerCommand('project-ide.openSettings', () => {
                vscode.commands.executeCommand('workbench.action.openSettings', 'project-ide.oauth');
            }),

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