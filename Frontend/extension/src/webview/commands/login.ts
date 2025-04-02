import * as vscode from 'vscode';
import { AuthenticationService } from '../../services/authentication';

export async function loginCmd(provider: 'google' | 'github', context: vscode.ExtensionContext, state: any) {
    try {
        // Initialize auth service if not already done
        if (!state.authService) {
            state.authService = new AuthenticationService(context);
        }

        if (state.provider) {
            state.provider.updateStatus(`Signing in with ${provider}...`);
        }

        // Perform login
        const authInfo = await state.authService.login(provider);
        
        if (authInfo) {
            // Update state
            state.authInfo = authInfo;
            
            // Update UI
            if (state.provider) {
                state.provider.updateAuthState(true);
                state.provider.updateStatus(`Signed in with ${provider} ✨`);
            }
            
            vscode.window.showInformationMessage(`Successfully signed in with ${provider}`);
        } else {
            if (state.provider) {
                state.provider.updateStatus('Authentication failed or cancelled', true);
            }
        }
    } catch (error) {
        console.error('Login failed:', error);
        if (state.provider) {
            state.provider.updateStatus(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
        }
        vscode.window.showErrorMessage(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}