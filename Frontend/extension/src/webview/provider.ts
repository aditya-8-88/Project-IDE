import * as vscode from 'vscode';
import { CollaborationClient } from '../websocket/client';
import { getWebviewContent } from './templates';

export class CollaborationViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'project-ide.collaborationView';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    // Called when the view is created
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
    ) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        // Set initial HTML content
        webviewView.webview.html = this._getHtmlContent();

        // Handle messages from the webview
        const messageListener = webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.type) {
                case 'CONNECT':
                    vscode.commands.executeCommand('project-ide.connect');
                    break;
                case 'DISCONNECT':
                    vscode.commands.executeCommand('project-ide.disconnect');
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
        return getWebviewContent(status, isError);
    }

    // Called when the view is disposed
    public dispose() {
        this._view = undefined;
    }
}