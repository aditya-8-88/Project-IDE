import WebSocket from 'ws';
import { CollaborationViewProvider } from '../webview/provider';

export class CollaborationClient {
    constructor(private readonly provider: CollaborationViewProvider) {}

    private ws: WebSocket | undefined;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 3;
    private shouldReconnect: boolean = true;

    async connect(serverUrl: string): Promise<void> {
        this.shouldReconnect = true;

        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(serverUrl);

                this.ws.addEventListener('open', () => {
                    this.reconnectAttempts = 0;
                    // Update status after connection is established
                    this.provider.updateStatus('Connected to Server ✨');
                    resolve();
                });

                this.ws.addEventListener('close', async () => {
                    this.provider.updateStatus('Connection closed');
                    if (this.shouldReconnect && this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
                        this.reconnectAttempts++;
                        this.provider.updateStatus(`Reconnecting... (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                });

                this.ws.addEventListener('error', (event) => {
                    const error = new Error('WebSocket error occurred');
                    this.provider.updateStatus('Connection error', true);
                    reject(error);
                });

            } catch (error) {
                this.provider.updateStatus('Connection failed', true);
                reject(error);
            }
        });
    }

    disconnect(): void {
        this.shouldReconnect = false;
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
            this.reconnectAttempts = 0;
        }
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}