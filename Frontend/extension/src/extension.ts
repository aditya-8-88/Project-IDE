import * as vscode from 'vscode';
import { CollaborationClient } from './websocket';

// This class provides the webview view for collaboration
class CollaborationViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'project-ide.collaborationView';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    // Called when the view is created
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        // Set the HTML content for the webview
        webviewView.webview.html = this._getHtmlContent();

        // Handle messages from the webview
        const messageListener = webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.type) {
                case 'CONNECT':
                    vscode.commands.executeCommand('project-ide.connect');
                    break;
                case 'DISCONNECT':
                    if (collaborationClient) {
                        collaborationClient.disconnect();
                        vscode.commands.executeCommand('project-ide.disconnect');
                    }
                    break;
                default:
                    console.log('Received unknown message:', message);
            }
        });

        // Dispose of the listener when the webview is disposed
        webviewView.onDidDispose(() => messageListener.dispose());
    }

    // Called to update the webview status
    public updateStatus(status: string, isError: boolean = false) {
        if (this._view) {
            this._view.webview.html = this._getHtmlContent(status, isError);
        }
    }

    // Generates the HTML content for the webview
    private _getHtmlContent(status: string = 'Ready to collaborate ✨', isError: boolean = false): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    padding: 10px;
                    color: var(--vscode-foreground);
                    font-family: var(--vscode-font-family);
                }
                .status {
                    font-size: 1.2em;
                    margin-bottom: 20px;
                }
                .error {
                    color: var(--vscode-errorForeground);
                }
                .button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 12px;
                    cursor: pointer;
                    margin: 5px;
                }
                .button:hover {
                    background: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <div class="status ${isError ? 'error' : ''}">${status}</div>
            <button class="button" onclick="connect()">Connect</button>
            <button class="button" onclick="disconnect()">Disconnect</button>
            <script>
                const vscode = acquireVsCodeApi();
                
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

    // Called when the view is disposed
    public dispose() {
        this._view = undefined;
    }
}

// Global variables to track active sessions and resources
let activeProvider: CollaborationViewProvider | undefined;
let activeDisposables: vscode.Disposable[] = [];
let collaborationClient: CollaborationClient | undefined;

export async function activate(context: vscode.ExtensionContext) {
    try {
        // Create and register the webview provider
        activeProvider = new CollaborationViewProvider(context.extensionUri);

        activeDisposables.push(
            // Register the webview view provider
            vscode.window.registerWebviewViewProvider(CollaborationViewProvider.viewType, activeProvider),
            // Register the command to start a collaboration session
            vscode.commands.registerCommand('project-ide.startSession', async () => {
                try {
                    await vscode.commands.executeCommand('project-ide.collaborationView.focus');
                    if (activeProvider) {
                        activeProvider.updateStatus('Click on Connect to start collaboration');
                        vscode.window.showInformationMessage('Extension Activated');
                    }
                } catch (error) {
                    console.error('Failed to start collaboration session:', error);
                    vscode.window.showErrorMessage('Failed to start collaboration session');
                }
            })
        );

        // Register status bar item for easy access
        const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
        statusBarItem.text = "$(person-add) Collaborate";
        statusBarItem.command = 'project-ide.startSession';
        statusBarItem.show();
        activeDisposables.push(statusBarItem);

        // Add all disposables to the extension context
        context.subscriptions.push(...activeDisposables);

        // Register the connect command
        context.subscriptions.push(
            vscode.commands.registerCommand('project-ide.connect', async () => {
                const { workspaceFolders } = vscode.workspace;
                if (!workspaceFolders) {
                    vscode.window.showErrorMessage('Please open a workspace first');
                    return;
                }

                const serverUrl = await vscode.window.showInputBox({
                    prompt: 'Enter collaboration server URL',
                    placeHolder: 'ws://localhost:3000'
                });

                if (!serverUrl) {
                    return;
                }

                try {
                    if (activeProvider) {
                        activeProvider.updateStatus('Connecting to server...');
                    }

                    // Initialize the collaboration client with the workspace folder
                    collaborationClient = new CollaborationClient();
                    await collaborationClient.connect(serverUrl);

                    if (activeProvider) {
                        activeProvider.updateStatus('Connected and ready to collaborate ✨');
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    if (activeProvider) {
                        activeProvider.updateStatus(`Connection failed: ${errorMessage}`, true);
                    }
                    vscode.window.showErrorMessage('Failed to connect: ' + errorMessage);
                }
            })
        );

        // Register the disconnect command (optional if using webview button only)
        context.subscriptions.push(
            vscode.commands.registerCommand('project-ide.disconnect', () => {
                if (collaborationClient) {
                    collaborationClient.disconnect();
                    if (activeProvider) {
                        activeProvider.updateStatus('Disconnected from server');
                    }
                    vscode.window.showInformationMessage('Disconnected from collaboration server');
                }
                else{
                    vscode.window.showWarningMessage('No active connection to disconnect');
                }
            })
        );

    } catch (error) {
        console.error('Error during activation:', error);
        throw error;
    }
}

export function deactivate() {
    console.log('Project IDE extension is being deactivated');

    if (collaborationClient) {
        collaborationClient.disconnect();
        vscode.window.showInformationMessage('Extension Deactivated');
    }
    
    try {
        if (activeProvider) {
            activeProvider.dispose();
            activeProvider = undefined;
        }

        activeDisposables.forEach((disposable) => {
            try {
                disposable.dispose();
            } catch (error) {
                console.error('Error disposing resource:', error);
            }
        });
        activeDisposables = [];
    } catch (error) {
        console.error('Error during deactivation:', error);
        throw error;
    }
}
