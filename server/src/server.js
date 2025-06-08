import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import setupWSConnection from './socket/ws-server.js';
import apiRoutes from './routes/api.js';

const app = express();
const port = process.env.PORT || 1234;

// Middleware
app.use(express.json());
app.use('/api', apiRoutes);
app.get('/', (_, res) => res.send('✅ Backend is running'));

const server = http.createServer(app);

// WebSocket upgrade
const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (req, socket, head) => {
  const handle = (ws) => setupWSConnection(ws, req);
  wss.handleUpgrade(req, socket, head, handle);
});

server.listen(port, () => {
  console.log(`🚀 Express + Yjs server running on http://localhost:${port}`);
});
