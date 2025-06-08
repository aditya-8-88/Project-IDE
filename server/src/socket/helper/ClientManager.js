const { v4: uuidv4 } = require('uuid');

class ClientManager {
    constructor() {
        this.clients = new Map(); // Map of clientId to WebSocket connection
        this.clientSessions = new Map(); // Map of clientId to sessionId
    }

    addClient(ws) {
        const clientId = uuidv4();
        this.clients.set(clientId, ws);
        return clientId;
    }

    removeClient(clientId) {
        const sessionId = this.clientSessions.get(clientId);
        this.clients.delete(clientId);
        this.clientSessions.delete(clientId);
        return sessionId;
    }

    getClient(clientId) {
        return this.clients.get(clientId);
    }

    getClients() {
        return this.clients;
    }

    setClientSession(clientId, sessionId) {
        this.clientSessions.set(clientId, sessionId);
    }

    getClientSession(clientId) {
        return this.clientSessions.get(clientId);
    }
}

module.exports = ClientManager;