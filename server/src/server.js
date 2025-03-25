require('dotenv').config();
const WebSocketServer = require('./WebSocketServer');

const port = process.env.PORT || 8080;
const server = new WebSocketServer(port);