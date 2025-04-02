export function getWebviewContent(
    status: string = 'Ready to collaborate ✨',
    isError: boolean = false,
    isLoggedIn: boolean = false,
    userInfo?: any
): string {
    const errorClass = isError ? 'error' : '';
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project IDE Collaboration</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                padding: 12px;
                color: var(--vscode-foreground);
            }
            .status {
                margin-bottom: 16px;
                padding: 8px;
                border-radius: 4px;
            }
            .error {
                color: var(--vscode-errorForeground);
                background-color: var(--vscode-inputValidation-errorBackground);
            }
            .button-container {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            button {
                padding: 8px 16px;
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                border-radius: 2px;
                cursor: pointer;
                font-size: 13px;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            .room-info {
                margin-top: 16px;
                padding: 8px;
                background-color: var(--vscode-input-background);
                border-radius: 4px;
            }
            .auth-container {
                margin-bottom: 16px;
            }
            .auth-button {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                margin-bottom: 8px;
                padding: 10px;
            }
            .google-button {
                background-color: #4285F4;
            }
            .github-button {
                background-color: #333;
            }
            .user-info {
                margin-top: 12px;
                padding: 8px;
                background-color: var(--vscode-input-background);
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <div class="status ${errorClass}">${status}</div>
        
        ${!isLoggedIn ? `
        <div class="auth-container">
            <h3>Sign in to collaborate</h3>
            <button class="auth-button google-button" onclick="loginWithProvider('google')">
                Sign in with Google
            </button>
            <button class="auth-button github-button" onclick="loginWithProvider('github')">
                Sign in with GitHub
            </button>
        </div>
        ` : `
        <div class="user-info">
            <h3>Logged in as</h3>
            <div>${userInfo ? userInfo.name || userInfo.email || 'Unknown user' : 'Authenticated user'}</div>
            <button onclick="logout()">Sign out</button>
        </div>
        
        <div class="button-container">
            <button id="connectBtn" onclick="connect()">
                Connect
            </button>
            <button id="disconnectBtn" onclick="disconnect()" disabled>
                Disconnect
            </button>
        </div>

        <div id="roomInfo" class="room-info" style="display: none;">
            <h3>Room Information</h3>
            <div id="roomId"></div>
            <div id="role"></div>
            <div id="participants"></div>
        </div>
        `}

        <script>
            const vscode = acquireVsCodeApi();
            
            function loginWithProvider(provider) {
                vscode.postMessage({ type: 'LOGIN', provider });
            }
            
            function logout() {
                vscode.postMessage({ type: 'LOGOUT' });
            }

            function connect() {
                vscode.postMessage({ type: 'CONNECT' });
                document.getElementById('connectBtn').disabled = true;
                document.getElementById('disconnectBtn').disabled = false;
            }

            function disconnect() {
                vscode.postMessage({ type: 'DISCONNECT' });
                document.getElementById('connectBtn').disabled = false;
                document.getElementById('disconnectBtn').disabled = true;
            }
        </script>
    </body>
    </html>
    `;
}