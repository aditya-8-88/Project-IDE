import * as vscode from 'vscode';

export async function disconnectCmd(context: vscode.ExtensionContext, state: any) {
    vscode.commands.registerCommand('project-ide.connect', async () => {
        if (state._client) {
            state._client.disconnect();

            if (state._provider) {
                state._provider.updateStatus('Disconnected from server');
            }
            vscode.window.showInformationMessage('Disconnected from collaboration server');
        } else {
            vscode.window.showWarningMessage('No active connection to disconnect');
        }
    });
}