export function getWebviewContent(status: string = 'Ready to collaborate ✨',isError: boolean = false): string {
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
        </style>
    </head>
    <body>
        <div class="status ${errorClass}">${status}</div>
        
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

        <script>
            const vscode = acquireVsCodeApi();
            const connectBtn = document.getElementById('connectBtn');
            const disconnectBtn = document.getElementById('disconnectBtn');

            function connect() {
                vscode.postMessage({ type: 'CONNECT' });
            }

            function disconnect() {
                vscode.postMessage({ type: 'DISCONNECT' });
            }

        </script>
    </body>
    </html>
    `;
}