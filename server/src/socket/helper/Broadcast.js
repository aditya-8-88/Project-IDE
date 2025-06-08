class Broadcast {
    constructor(clientManager) {
        this.clientManager = clientManager;
    }

    sendToSession(sessionClients, senderId, message) {
        sessionClients.forEach(clientId => {
            if (clientId !== senderId) {  // Avoid sending back to the sender
                const ws = this.clientManager.getClients().get(clientId);
                if (ws) {
                    ws.send(JSON.stringify(message));
                }
            }
        });
    }

    sendToClient(clientId, message) {
        const ws = this.clientManager.getClients().get(clientId);
        if (ws) {
            ws.send(JSON.stringify(message));
        }
    }
}

module.exports = Broadcast;
