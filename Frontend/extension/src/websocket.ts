import * as vscode from 'vscode';
import WebSocket from 'ws';

export class CollaborationClient {
    private ws: WebSocket | undefined;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 3;
    private shouldReconnect: boolean = true;

    async connect(serverUrl: string): Promise<void> {
        this.shouldReconnect = true; // Enable auto-reconnect when connecting
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(serverUrl);

                this.ws.addEventListener('open', () => {
                    this.reconnectAttempts = 0;
                    vscode.window.showInformationMessage('Connected to collaboration server');
                    resolve();
                });

                this.ws.addEventListener('error', (event) => {
                    const error = new Error('WebSocket error occurred');
                    vscode.window.showErrorMessage('WebSocket error: ' + error.message);
                    reject(error);
                });

                this.ws.addEventListener('close', async () => {
                    vscode.window.showWarningMessage('Disconnected from collaboration server');

                    // Adding a delay of 2 seconds before attempting to reconnect
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Reconnect if the disconnect was not user-initiated
                    if (this.shouldReconnect && this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
                        this.reconnectAttempts++;
                        vscode.window.showInformationMessage(`Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);
                        try {
                            await this.connect(serverUrl);
                        } catch (error) {
                            console.error('Reconnection failed:', error);
                        }
                    }
                });
            } catch (error) {
                console.error('Connection error:', error);
                reject(error);
            }
        });
    }

    disconnect(): void {
        // Set flag to prevent auto-reconnect on explicit disconnect
        this.shouldReconnect = false;
        if (this.ws) {
            try {
                this.ws.close();
            } catch (error) {
                console.error('Error closing WebSocket:', error);
            } finally {
                this.ws = undefined;
                this.reconnectAttempts = 0;
            }
        }
        vscode.window.showInformationMessage('Disconnected from collaboration server');
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}
