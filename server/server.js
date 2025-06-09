// server.js
// Node.js, Express, ws (WebSocket), and Yjs for CRDT synchronization

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');        // Added import for crypto
const Y = require('yjs');
const { encodeStateAsUpdate, applyUpdate } = Y;
const { Awareness } = require('y-protocols/awareness');

// 1. Instantiate Express and HTTP server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 2. In-memory sessions
// Map<sessionId, { owner, files: Set<string>, ydocs: Map<filename, Y.Doc>, awareness: Map<filename, Awareness> }>
const sessions = new Map();

// 3. Middleware
app.use(express.json()); // parse JSON bodies

// ----- HTTP Endpoints -----

// Create Session
app.post('/api/session', (req, res) => {
  const sessionId = crypto.randomBytes(16).toString('hex');
  console.log(`Creating session: ${sessionId}`);
  const session = {
    sessionId,
    owner: req.body.owner || 'anonymous',
    files: new Set(),
    ydocs: new Map(),
    awareness: new Map()
  };
  sessions.set(sessionId, session);
  res.json({ sessionId, inviteLink: `http://localhost:3000/join/${sessionId}`, files: [] });
});

// Provide Session Info
app.get('/api/session/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json({ sessionId: session.sessionId, owner: session.owner, files: [...session.files] });
});

// Store File Snapshot
app.put('/api/session/:sessionId/files/:filename', (req, res) => {
  const { sessionId, filename } = req.params;
  const { content } = req.body;
  const session = sessions.get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  // Create or overwrite Y.Doc
  let ydoc = session.ydocs.get(filename);
  if (!ydoc) {
    ydoc = new Y.Doc();
    session.ydocs.set(filename, ydoc);
    // create awareness for this doc
    session.awareness.set(filename, new Awareness(ydoc));
  } else {
    // clear existing text
    const oldText = ydoc.getText('file');
    oldText.delete(0, oldText.length);
  }
  const ytext = ydoc.getText('file');
  ytext.insert(0, content);

  session.files.add(filename);
  res.json({ message: 'File saved', filename });
});

// Serve File Snapshot
app.get('/api/session/:sessionId/files/:filename', (req, res) => {
  const { sessionId, filename } = req.params;
  const session = sessions.get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const ydoc = session.ydocs.get(filename);
  if (!ydoc) return res.status(404).json({ error: 'File not found' });
  res.json({ filename, content: ydoc.getText('file').toString() });
});

// Delete Session
app.delete('/api/session/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  const session = sessions.get(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  // close all WS
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.sessionId === sessionId) {
      client.close(1000, 'Session ended');
    }
  });
  sessions.delete(sessionId);
  res.json({ message: 'Session deleted' });
});

// 4. WebSocket Server for /collab/:sessionId


server.on('upgrade', (req, socket, head) => {
  const match = req.url.match(/^\/collab\/(\w+)$/);
  if (!match) return socket.destroy();
  const sessionId = match[1];
  if (!sessions.has(sessionId)) return socket.destroy();
  wss.handleUpgrade(req, socket, head, ws => {
    ws.sessionId = sessionId;
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws) => {
  const sessionId = ws.sessionId;
  const session = sessions.get(sessionId);

  // Send initial sync for each file (binary)
  session.ydocs.forEach((ydoc, filename) => {
    const update = encodeStateAsUpdate(ydoc);
    ws.send(update, { binary: true });
  });

  // Handle messages (binary = Yjs updates)
  ws.on('message', (data, isBinary) => {
    if (isBinary) {
      // Yjs update
      session.ydocs.forEach((ydoc, filename) => {
        try {
          applyUpdate(ydoc, new Uint8Array(data));
        } catch {};
      });
      // broadcast same binary
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN && client.sessionId === sessionId) {
          client.send(data, { binary: true });
        }
      });
    } else {
      // JSON text → awareness
      let msg;
      try { msg = JSON.parse(data.toString()); } catch { return; }
      if (msg.type === 'awareness') {
        const aw = session.awareness.get(msg.filename);
        aw.applyUpdate(msg.update);
        // broadcast awareness update
        const payload = aw.encodeUpdate();
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN && client.sessionId === sessionId) {
            client.send(payload, { binary: true });
          }
        });
      }
    }
  });
});

// 5. Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});