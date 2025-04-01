import * as vscode from 'vscode';

export async function connectCmd(context: vscode.ExtensionContext, state: any) {
    vscode.commands.registerCommand('project-ide.connect', async () => {
        const { workspaceFolders } = vscode.workspace;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Please open a workspace first');
            return;
        }

        const serverUrl = await vscode.window.showInputBox({
            prompt: 'Enter collaboration server URL',
            placeHolder: 'ws://localhost:8080'
        });

        if (!serverUrl) { return; }

        try {
            if (!state._provider) {
                throw new Error('WebView provider not initialized');
            }

            state._provider.updateStatus('Connecting to server...');

            // Initialize client with provider
            state._client = new state._client(state._provider);
            await state._client.connect(serverUrl);



        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            state._provider?.updateStatus(`Connection failed: ${errorMessage}`, true);
            vscode.window.showErrorMessage('Failed to connect: ' + errorMessage);
        }
    });
}