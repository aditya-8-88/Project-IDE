const WebSocket = require("ws");
const ClientManager = require("./ClientManager");
const SessionManager = require("./SessionManager");
const MessageHandler = require("./MessageHandler");

class WebSocketServer {
    constructor(server) {
        this.server = typeof server === 'number' 
            ? new WebSocket.Server({ port: server }) 
            : server;
        this.clients = new ClientManager();
        this.sessions = new SessionManager();
        this.messageHandler = new MessageHandler(this.sessions, this.clients);
        
        this.server.on("connection", (ws) => this.handleConnection(ws));
        
        // Fixed console log
        if (typeof server === 'number') {
            console.log(`WebSocket Server running on port ${server}`);
        } else {
            console.log(`WebSocket Server initialized`);
        }
        
        // Setup periodic health checks
        setInterval(() => {
            this.clients.getClients().forEach((ws, clientId) => {
                if (!ws.isAlive) {
                    ws.terminate();
                    return;
                }
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
    }

    handleConnection(ws) {
        const clientId = this.clients.addClient(ws);
        console.log(`Client connected: ${clientId}`);

        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });

        ws.on("message", (message) => {
            try {
                this.messageHandler.processMessage(clientId, message);
            } catch (error) {
                console.error(`Error processing message from ${clientId}:`, error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Failed to process message'
                }));
            }
        });

        ws.on("close", () => {
            this.clients.removeClient(clientId);
            console.log(`Client disconnected: ${clientId}`);
        });

        ws.on("error", (error) => {
            console.error(`WebSocket error from ${clientId}:`, error);
        });
    }
}

module.exports = WebSocketServer;