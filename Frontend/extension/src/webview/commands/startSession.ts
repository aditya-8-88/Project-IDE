import * as vscode from 'vscode';

export async function startSessionCmd(context: vscode.ExtensionContext, state: any) {
    try {
        await vscode.commands.executeCommand('project-ide.collaborationView.focus');
        if (state.provider) {
            state.provider.updateStatus('Click on Connect to start collaboration');
            vscode.window.showInformationMessage('Extension Activated');
        }
        else{
            vscode.window.showErrorMessage('Collaboration view not initialized. Try reloading the window.');
        }
    } catch (error) {
        console.error('Failed to start collaboration session:', error);
        vscode.window.showErrorMessage('Failed to start collaboration session');
    }
}