import * as vscode from 'vscode';

export async function disconnectCmd(context: vscode.ExtensionContext, state: any) {
    if (state.client) {
        state.client.disconnect();

        if (state.provider) {
            state.provider.updateStatus('Disconnected from server');
        }
        vscode.window.showInformationMessage('Disconnected from collaboration server');
    } else {
        vscode.window.showWarningMessage('No active connection to disconnect');
    }
}