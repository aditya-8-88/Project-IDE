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
                    </style>
                </head>
                <body>
                    <div class="status">Collaboration Started ✨</div>
                </body>
            </html>
        `;
    }
}

export function activate(context: vscode.ExtensionContext) {
    const provider = new CollaborationViewProvider(context.extensionUri);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            CollaborationViewProvider.viewType,
            provider
        )
    );

    const disposable = vscode.commands.registerCommand('project-ide.startSession', () => {
        vscode.commands.executeCommand('project-ide.collaborationView.focus');
        vscode.window.showInformationMessage('Collaboration session started!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}