class MessageHandler {
    constructor(sessionManager, clientManager) {
        this.sessions = sessionManager;
        this.clients = clientManager;
    }

    processMessage(clientId, message) {
        const parsed = JSON.parse(message);
        
        switch (parsed.type) {
            case "join":
                this.handleJoinSession(clientId, parsed.sessionId);
                break;
            case "leave":
                this.handleLeaveSession(clientId);
                break;
            case "code":
                this.handleCodeUpdate(clientId, parsed.code);
                break;
            case "cursor":
                this.handleCursorUpdate(clientId, parsed.position);
                break;
            case "chat":
                this.handleChat(clientId, parsed.message);
                break;
            default:
                console.warn(`Unknown message type: ${parsed.type}`);
        }
    }

    handleJoinSession(clientId, sessionId) {
        this.sessions.createSession(sessionId);
        this.sessions.joinSession(sessionId, clientId);
        this.clients.setClientSession(clientId, sessionId);

        // Send current session state to the new client
        const ws = this.clients.getClient(clientId);
        if (ws) {
            ws.send(JSON.stringify({
                type: "sessionState",
                code: this.sessions.getSessionCode(sessionId),
                clients: this.sessions.getSessionClients(sessionId)
            }));
        }

        // Notify other clients about the new user
        this.broadcastToSession(sessionId, {
            type: "userJoined",
            clientId: clientId
        }, [clientId]);
    }

    handleLeaveSession(clientId) {
        const sessionId = this.clients.getClientSession(clientId);
        if (sessionId) {
            this.sessions.leaveSession(sessionId, clientId);
            this.broadcastToSession(sessionId, {
                type: "userLeft",
                clientId: clientId
            });
        }
    }

    handleCodeUpdate(clientId, code) {
        const sessionId = this.clients.getClientSession(clientId);
        if (sessionId) {
            this.sessions.updateCode(sessionId, code);
            this.broadcastToSession(sessionId, {
                type: "code",
                code: code,
                clientId: clientId
            }, [clientId]);
        }
    }

    handleCursorUpdate(clientId, position) {
        const sessionId = this.clients.getClientSession(clientId);
        if (sessionId) {
            this.sessions.updateCursor(sessionId, clientId, position);
            this.broadcastToSession(sessionId, {
                type: "cursor",
                position: position,
                clientId: clientId
            }, [clientId]);
        }
    }

    handleChat(clientId, message) {
        const sessionId = this.clients.getClientSession(clientId);
        if (sessionId) {
            this.broadcastToSession(sessionId, {
                type: "chat",
                message: message,
                clientId: clientId,
                timestamp: Date.now()
            });
        }
    }

    broadcastToSession(sessionId, message, excludeClients = []) {
        const clients = this.sessions.getSessionClients(sessionId);
        clients.forEach(clientId => {
            if (!excludeClients.includes(clientId)) {
                const ws = this.clients.getClient(clientId);
                if (ws) {
                    ws.send(JSON.stringify(message));
                }
            }
        });
    }
}

module.exports = MessageHandler;