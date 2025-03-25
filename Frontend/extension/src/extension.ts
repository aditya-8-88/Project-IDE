import * as vscode from 'vscode';

class CollaborationViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'project-ide.collaborationView';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlContent();

        // Handle messages from the webview
        const messageListener = webviewView.webview.onDidReceiveMessage(
            message => {
                console.log('Received message:', message);
            }
        );

        // Ensure the listener is disposed when the webview is destroyed
        webviewView.onDidDispose(() => messageListener.dispose());
    }

    private _getHtmlContent() {
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
                    </style>
                </head>
                <body>
                    <div class="status">Collaboration Started ✨</div>
                </body>
            </html>
        `;
    }

    public dispose() {
		this._view = undefined;
    }
}

// Track active sessions and resources
let activeProvider: CollaborationViewProvider | undefined;
let activeDisposables: vscode.Disposable[] = [];

export async function activate(context: vscode.ExtensionContext) {
    console.log('Project IDE extension is now active');

    try {
        // Create and register the webview provider
        activeProvider = new CollaborationViewProvider(context.extensionUri);
        
        // Register core functionality
        activeDisposables.push(
            vscode.window.registerWebviewViewProvider(
                CollaborationViewProvider.viewType,
                activeProvider
            ),

            // Register the start session command
            vscode.commands.registerCommand('project-ide.startSession', async () => {
                try {
                    await vscode.commands.executeCommand('project-ide.collaborationView.focus');
                    vscode.window.showInformationMessage('Collaboration session started!');
                } catch (error) {
                    console.error('Failed to start collaboration session:', error);
                    vscode.window.showErrorMessage('Failed to start collaboration session');
                }
            })
        );

        // Register status bar item
        const statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        statusBarItem.text = "$(person-add) Collaborate";
        statusBarItem.command = 'project-ide.startSession';
        statusBarItem.show();
        activeDisposables.push(statusBarItem);

        // Add all disposables to extension context
        context.subscriptions.push(...activeDisposables);

    } catch (error) {
        console.error('Error during activation:', error);
        throw error; // Re-throw to show activation failure in VS Code
    }
}

export function deactivate() {
    console.log('Project IDE extension is being deactivated');
    
    try {
        // Clean up provider
        if (activeProvider) {
            activeProvider.dispose();
            activeProvider = undefined;
        }

        // Dispose all registered commands and views
        activeDisposables.forEach(disposable => {
            try {
                disposable.dispose();
            } catch (error) {
                console.error('Error disposing resource:', error);
            }
        });
        activeDisposables = [];

    } catch (error) {
        console.error('Error during deactivation:', error);
        throw error; // Re-throw to show deactivation failure in VS Code
    }
}