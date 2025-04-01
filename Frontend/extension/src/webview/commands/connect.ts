import * as vscode from 'vscode';
import { CollaborationClient } from '../../websocket/client';

export async function connectCmd(context: vscode.ExtensionContext, state: any) {
    const { workspaceFolders } = vscode.workspace;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('Please open a workspace first');
        return;
    }

    // const serverUrl = await vscode.window.showInputBox({
    //     prompt: 'Enter collaboration server URL',
    //     placeHolder: 'ws://localhost:8080'
    // });

    const serverUrl = 'ws://localhost:8080'; // For testing purposes, hardcoded URL

    if (!serverUrl) { return; }

    try {
        if (!state.provider) {
            throw new Error('WebView provider not initialized');
        }

        state.provider.updateStatus('Connecting to server...');

        // Create a new client instance
        state.client = new CollaborationClient();
        
        // Connect to server
        await state.client.connect(serverUrl, state);

        // state.provider.updateConnectionStatus(true); 

        // Update status after successful connection
        state.provider.updateStatus('Connected to server ✨');

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        state.provider?.updateStatus(`Connection failed: ${errorMessage}`, true);
        vscode.window.showErrorMessage('Failed to connect: ' + errorMessage);
    }
}