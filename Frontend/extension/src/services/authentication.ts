import * as vscode from 'vscode';
import axios from 'axios';

export interface AuthInfo {
    provider: 'google' | 'github';
    token: string;
    userId?: string;
    email?: string;
    name?: string;
}

export class AuthenticationService {
    private static readonly AUTH_TYPE_KEY = 'project-ide.authType';
    private static readonly AUTH_TOKEN_KEY = 'project-ide.authToken';
    
    // Your backend authentication server URL
    private readonly AUTH_SERVER_URL = 'http://localhost:8080/auth'; // Change to your actual server URL

    constructor(private context: vscode.ExtensionContext) {}

    public async login(provider: 'google' | 'github'): Promise<AuthInfo | undefined> {
        try {
            // Generate a state parameter to prevent CSRF attacks
            const state = Math.random().toString(36).substring(2, 15);
            
            // Redirect URL for the OAuth flow (must match the one configured in your server)
            const redirectUrl = `${this.AUTH_SERVER_URL}/${provider}/callback`;
            
            // Construct the server auth URL that will start the OAuth flow
            const authUrl = `${this.AUTH_SERVER_URL}/${provider}/login?state=${state}`;
            
            // Open the browser for the user to authenticate through your server
            await vscode.env.openExternal(vscode.Uri.parse(authUrl));
            
            // Ask the user to paste the token they received
            const token = await vscode.window.showInputBox({
                prompt: `After logging in with ${provider}, paste the token displayed in the browser`,
                ignoreFocusOut: true,
                placeHolder: 'Paste token here...'
            });
            
            if (!token) {
                vscode.window.showWarningMessage('Authentication cancelled');
                return undefined;
            }
            
            // Verify the token with your server
            const response = await axios.post(`${this.AUTH_SERVER_URL}/verify-token`, {
                token,
                provider
            });
            
            if (response.data.valid) {
                const authInfo: AuthInfo = {
                    provider,
                    token,
                    userId: response.data.userId,
                    email: response.data.email,
                    name: response.data.name
                };
                
                // Store authentication info securely
                await this.storeAuthInfo(authInfo);
                return authInfo;
            } else {
                vscode.window.showErrorMessage('Invalid token. Please try again.');
                return undefined;
            }
        } catch (error) {
            console.error('Login failed:', error);
            vscode.window.showErrorMessage('Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
            return undefined;
        }
    }

    public async storeAuthInfo(authInfo: AuthInfo): Promise<void> {
        const secretStorage = this.context.secrets;
        await secretStorage.store(AuthenticationService.AUTH_TYPE_KEY, authInfo.provider);
        await secretStorage.store(AuthenticationService.AUTH_TOKEN_KEY, authInfo.token);
    }

    public async getStoredAuthInfo(): Promise<AuthInfo | undefined> {
        const secretStorage = this.context.secrets;
        const provider = await secretStorage.get(AuthenticationService.AUTH_TYPE_KEY) as 'google' | 'github' | undefined;
        const token = await secretStorage.get(AuthenticationService.AUTH_TOKEN_KEY);
        
        if (provider && token) {
            return { provider, token };
        }
        
        return undefined;
    }

    public async logout(): Promise<void> {
        try {
            const authInfo = await this.getStoredAuthInfo();
            
            if (authInfo) {
                // Notify server about logout (optional)
                await axios.post(`${this.AUTH_SERVER_URL}/logout`, {
                    token: authInfo.token,
                    provider: authInfo.provider
                }).catch(err => console.error('Failed to notify server about logout:', err));
            }
            
            // Clear local storage regardless of server response
            const secretStorage = this.context.secrets;
            await secretStorage.delete(AuthenticationService.AUTH_TYPE_KEY);
            await secretStorage.delete(AuthenticationService.AUTH_TOKEN_KEY);
        } catch (error) {
            console.error('Error during logout:', error);
            // Continue with clearing storage even if server notification fails
            const secretStorage = this.context.secrets;
            await secretStorage.delete(AuthenticationService.AUTH_TYPE_KEY);
            await secretStorage.delete(AuthenticationService.AUTH_TOKEN_KEY);
        }
    }
}