class SessionManager {
    constructor() {
        this.sessions = new Map(); // { sessionId: { clients: [], lastActivity: timestamp, code: "" } }
    }

    createSession(sessionId) {
        if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, {
                clients: [],
                lastActivity: Date.now(),
                code: "",
                language: "javascript",
                cursors: new Map() // Store cursor positions for each client
            });
        }
        return sessionId;
    }

    joinSession(sessionId, clientId) {
        const session = this.sessions.get(sessionId);
        if (session && !session.clients.includes(clientId)) {
            session.clients.push(clientId);
            this.updateSessionActivity(sessionId);
        }
    }

    leaveSession(sessionId, clientId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.clients = session.clients.filter(id => id !== clientId);
            session.cursors.delete(clientId);
            if (session.clients.length === 0) {
                this.sessions.delete(sessionId);
            }
        }
    }

    updateCode(sessionId, code) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.code = code;
            this.updateSessionActivity(sessionId);
        }
    }

    updateCursor(sessionId, clientId, position) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.cursors.set(clientId, position);
            this.updateSessionActivity(sessionId);
        }
    }

    getSessionClients(sessionId) {
        const session = this.sessions.get(sessionId);
        return session ? session.clients : [];
    }

    getSessionCode(sessionId) {
        const session = this.sessions.get(sessionId);
        return session ? session.code : "";
    }

    updateSessionActivity(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActivity = Date.now();
        }
    }
}

module.exports = SessionManager;