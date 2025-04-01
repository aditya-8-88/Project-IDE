import * as vscode from 'vscode';

export async function startSessionCmd(context: vscode.ExtensionContext, state: any) {
    vscode.commands.registerCommand('project-ide.connect', async () => {
        try {
            await vscode.commands.executeCommand('project-ide.collaborationView.focus');
            if (state._provider) {
                state._provider.updateStatus('Click on Connect to start collaboration');
                vscode.window.showInformationMessage('Extension Activated');
            }
        } catch (error) {
            console.error('Failed to start collaboration session:', error);
            vscode.window.showErrorMessage('Failed to start collaboration session');
        }
    });
}