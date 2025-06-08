import * as Y from 'yjs';
import { setupWSConnection } from 'y-websocket/bin/utils.js';

// can be replaced with DB later
const docs = new Map();

/**
 * Handle WebSocket connection for collaborative editing
 * @param {WebSocket} conn - the actual WebSocket connection
 * @param {Request} req - HTTP upgrade request
 */
export default function handleWSConnection(conn, req) {
  const docName = req.url.slice(1).split('?')[0];

  setupWSConnection(conn, req, {
    gc: true, // enables garbage collection for deleted data
    docName,
    docs,
  });

  console.log(`🔗 User connected to doc: ${docName}`);
}