require('dotenv').config();
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const WebSocketServer = require('./WebSocketServer');

// Create Express app
const app = express();
app.use(express.json());
app.use(cors());

// Store active tokens
const activeTokens = new Map();

// OAuth Configurations
const googleConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
};

const githubConfig = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUri: process.env.GITHUB_REDIRECT_URI
};

// Google OAuth flow
app.get('/auth/google/login', (req, res) => {
    if (!googleConfig.clientId) {
        return res.status(500).send('Google OAuth not configured');
    }

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.append('client_id', googleConfig.clientId);
    url.searchParams.append('redirect_uri', googleConfig.redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', 'email profile');
    url.searchParams.append('state', req.query.state || '');

    res.redirect(url.toString());
});

// Google OAuth callback
app.get('/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;

        // Exchange code for token
        const params = new URLSearchParams();
        params.append('client_id', googleConfig.clientId);
        params.append('client_secret', googleConfig.clientSecret);
        params.append('code', code);
        params.append('redirect_uri', googleConfig.redirectUri);
        params.append('grant_type', 'authorization_code');

        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', params);
        const accessToken = tokenResponse.data.access_token;

        // Get user info
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const userInfo = userInfoResponse.data;
        const sessionToken = uuidv4();

        // Store in active tokens
        activeTokens.set(sessionToken, {
            provider: 'google',
            userId: userInfo.id,
            email: userInfo.email,
            name: userInfo.name
        });

        // Return HTML with script to communicate with extension
        res.send(`
        <html>
        <head>
            <title>Authentication Successful</title>
            <script>
                window.onload = function() {
                    const data = {
                        success: true,
                        token: "${sessionToken}",
                        user: {
                            id: "${userInfo.id}",
                            email: "${userInfo.email}",
                            name: "${userInfo.name}"
                        }
                    };
                    
                    if (window.opener) {
                        window.opener.postMessage(data, '*');
                        setTimeout(() => window.close(), 1000);
                    }
                };
            </script>
        </head>
        <body>
            <h1>Authentication Successful</h1>
            <p>You can now return to VS Code.</p>
            <p>Your token: ${sessionToken}</p>
        </body>
        </html>
        `);
    } catch (error) {
        console.error("Google OAuth callback error:", error);
        res.status(500).send('Authentication failed. Please try again later.');
    }
});

// GitHub OAuth flow
app.get('/auth/github/login', (req, res) => {
    if (!githubConfig.clientId) {
        return res.status(500).send('GitHub OAuth not configured');
    }
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.append('client_id', githubConfig.clientId);
    url.searchParams.append('redirect_uri', githubConfig.redirectUri);
    url.searchParams.append('scope', 'user:email');
    url.searchParams.append('state', req.query.state || '');

    res.redirect(url.toString());
});

// GitHub OAuth callback
app.get('/auth/github/callback', async (req, res) => {
    try {
        const { code } = req.query;

        // Exchange code for token
        const params = new URLSearchParams();
        params.append('client_id', githubConfig.clientId);
        params.append('client_secret', githubConfig.clientSecret);
        params.append('code', code);
        params.append('redirect_uri', githubConfig.redirectUri);

        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            params,
            { headers: { Accept: 'application/json' } }
        );

        const accessToken = tokenResponse.data.access_token;

        // Get user info
        const userInfoResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });

        const userInfo = userInfoResponse.data;

        // Get email if not included
        let { email } = userInfo;
        if (!email) {
            const emailResponse = await axios.get('https://api.github.com/user/emails', {
                headers: { Authorization: `token ${accessToken}` }
            });
            const primaryEmail = emailResponse.data.find(e => e.primary);
            email = primaryEmail ? primaryEmail.email : null;
        }

        const sessionToken = uuidv4();

        // Store in active tokens
        activeTokens.set(sessionToken, {
            provider: 'github',
            userId: userInfo.id.toString(),
            email: email,
            name: userInfo.name || userInfo.login
        });

        // Return HTML with script to communicate with extension
        res.send(`
        <html>
        <head>
            <title>Authentication Successful</title>
            <script>
                window.onload = function() {
                    const data = {
                        success: true,
                        token: "${sessionToken}",
                        user: {
                            id: "${userInfo.id}",
                            email: "${email || ''}",
                            name: "${userInfo.name || userInfo.login}"
                        }
                    };
                    
                    if (window.opener) {
                        window.opener.postMessage(data, '*');
                        setTimeout(() => window.close(), 1000);
                    }
                };
            </script>
        </head>
        <body>
            <h1>Authentication Successful</h1>
            <p>You can now return to VS Code.</p>
            <p>Your token: ${sessionToken}</p>
        </body>
        </html>
        `);
    } catch (error) {
        res.status(500).send(`Authentication failed: ${error.message}`);
    }
});

// Verify token
app.post('/auth/verify-token', (req, res) => {
    const { token, provider } = req.body;

    if (activeTokens.has(token)) {
        const userInfo = activeTokens.get(token);
        if (!provider || userInfo.provider === provider) {
            res.json({
                valid: true,
                userId: userInfo.userId,
                email: userInfo.email,
                name: userInfo.name,
                provider: userInfo.provider
            });
            return;
        }
    }

    res.json({ valid: false });
});

// Logout
app.post('/auth/logout', (req, res) => {
    const { token } = req.body;

    if (activeTokens.has(token)) {
        activeTokens.delete(token);
        res.json({ success: true });
    } else {
        res.json({ success: false, error: 'Token not found' });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Create HTTP server
const httpServer = http.createServer(app);
const port = process.env.PORT || 8080;

// Create WebSocket server
const wss = new WebSocket.Server({ server: httpServer });
const wsServer = new WebSocketServer(wss);

// Start server
httpServer.listen(port, () => {
    console.log(`HTTP Server running on http://localhost:${port}`);
    console.log(`WebSocket Server running on ws://localhost:${port}`);
});