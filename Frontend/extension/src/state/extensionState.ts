import { CollaborationClient } from '../websocket/client';
import { CollaborationViewProvider } from '../webview/provider';
import { AuthenticationService, AuthInfo } from '../services/authentication';


// Extension state management
export class ExtensionState {
    private static instance: ExtensionState;
    
    private _provider?: CollaborationViewProvider;
    private _client?: CollaborationClient;
    public authService?: AuthenticationService;
    public authInfo?: AuthInfo;

    private constructor() {}

    static getInstance(): ExtensionState {
        if (!ExtensionState.instance) {
            ExtensionState.instance = new ExtensionState();
        }
        return ExtensionState.instance;
    }

    get provider() { return this._provider; }
    set provider(value: CollaborationViewProvider | undefined) {
        this._provider = value;
    }

    get client() { return this._client; }
    set client(value: CollaborationClient | undefined) {
        this._client = value;
    }
}