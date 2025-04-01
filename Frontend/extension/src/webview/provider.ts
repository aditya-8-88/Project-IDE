import * as vscode from 'vscode';
import { CollaborationClient } from '../websocket/client';
import { getWebviewContent } from './templates';

let collaborationClient: CollaborationClient | undefined;

export class CollaborationViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'project-ide.collaborationView';
    private _view?: vscode.WebviewView;
    private client?: CollaborationClient;

    constructor(private readonly _extensionUri: vscode.Uri) { 
        this.client = collaborationClient;
    }

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
                    if (this.client) {
                        this.client.disconnect();
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
        return getWebviewContent(status, isError);
    }

    // Update room information
    public updateRoomInfo(roomData: {
        roomId: string;
        role: 'host' | 'client';
        participants: string[];
    }) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'UPDATE_ROOM',
                data: roomData
            });
        }
    }

    // Update connection status
    public updateConnectionStatus(isConnected: boolean) {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'CONNECTION_STATUS',
                data: { isConnected }
            });
        }
    }

    // Called when the view is disposed
    public dispose() {
        this._view = undefined;
    }
}