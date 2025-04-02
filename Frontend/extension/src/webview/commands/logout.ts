import * as vscode from 'vscode';

export async function logoutCmd(context: vscode.ExtensionContext, state: any) {
    try {
        // Check if already authenticated
        if (!state.authInfo) {
            vscode.window.showWarningMessage('Not currently signed in');
            return;
        }

        // Disconnect if connected
        if (state.client) {
            state.client.disconnect();
        }

        // Clear authentication data
        if (state.authService) {
            await state.authService.logout();
        }
        
        // Update state
        state.authInfo = undefined;
        
        // Update UI
        if (state.provider) {
            state.provider.updateAuthState(false);
            state.provider.updateStatus('Signed out');
        }
        
        vscode.window.showInformationMessage('Successfully signed out');
    } catch (error) {
        console.error('Logout failed:', error);
        vscode.window.showErrorMessage(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}