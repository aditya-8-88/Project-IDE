import WebSocket from 'ws';
import { ExtensionState } from '../state/extensionState';

export class CollaborationClient {
    private ws: WebSocket | undefined;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 3;
    private shouldReconnect: boolean = true;
    private currentServerUrl: string = '';

    async connect(serverUrl: string): Promise<void> {
        this.shouldReconnect = true;
        this.currentServerUrl = serverUrl;
        this.reconnectAttempts = 0;

        return new Promise((resolve, reject) => {
            try {
                const state = ExtensionState.getInstance();
                const {provider} = state;
                if (!provider) {
                    throw new Error('Provider not initialized');
                }

                provider.updateStatus('Connecting to server...');
                this.ws = new WebSocket(serverUrl);

                this.ws.addEventListener('open', () => {
                    this.reconnectAttempts = 0;
                    provider.updateStatus('Connected to Server ✨');
                    resolve();
                });

                this.ws.addEventListener('message', (event) => {
                    try {
                        const data = JSON.parse(event.data.toString());
                        console.log('Received message:', data);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                });

                this.ws.addEventListener('close', () => {
                    if (this.shouldReconnect) {
                        this.reconnect();
                    } else {
                        const state = ExtensionState.getInstance();
                        state.provider?.updateStatus('Disconnected from server');
                    }
                });

                this.ws.addEventListener('error', (event) => {
                    const error = new Error('WebSocket error occurred');
                    provider.updateStatus('Connection error', true);
                    reject(error);
                });

            } catch (error) {
                const state = ExtensionState.getInstance();
                state.provider?.updateStatus('Connection failed', true);
                reject(error);
            }
        });
    }

    private async reconnect(): Promise<void> {
        const state = ExtensionState.getInstance();
        state.provider?.updateStatus('Connection closed');

        for (let attempt = 1; attempt <= this.MAX_RECONNECT_ATTEMPTS; attempt++) {
            if (!this.shouldReconnect) {
                break;
            }

            state.provider?.updateStatus(`Reconnecting... (${attempt}/${this.MAX_RECONNECT_ATTEMPTS})`);
            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
                this.ws = new WebSocket(this.currentServerUrl);
                const success = await this.setupEventListenersWithPromise();
                if (success) {
                    this.reconnectAttempts = 0;
                    state.provider?.updateStatus('Reconnected successfully ✓');
                    return;
                }
            } catch (error) {
                console.error(`Reconnection attempt ${attempt} failed:`, error);
            }
        }

        state.provider?.updateStatus('Could not reconnect after multiple attempts', true);
    }

    private setupEventListenersWithPromise(): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.ws) {
                resolve(false);
                return;
            }

            const timeout = setTimeout(() => {
                resolve(false);
            }, 5000);

            this.ws.addEventListener('open', () => {
                clearTimeout(timeout);
                resolve(true);
            });

            this.ws.addEventListener('error', () => {
                clearTimeout(timeout);
                resolve(false);
            });

            this.ws.addEventListener('close', () => {
                clearTimeout(timeout);
                resolve(false);
            });

            // Message handler is already set in connect(), don't duplicate it here
        });
    }

    disconnect(): void {
        this.shouldReconnect = false;
        if (this.ws) {
            this.ws.close();
            this.ws = undefined;
            this.reconnectAttempts = 0;

            const state = ExtensionState.getInstance();
            state.provider?.updateStatus('Disconnected from server');
        }
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}