const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Map to store client connections

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
    }

    handleConnection(ws, req) {
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'auth') {
                    this.authenticateClient(ws, data.token);
                }
            } catch (error) {
                console.error('WebSocket message error:', error);
            }
        });

        ws.on('close', () => {
            this.removeClient(ws);
        });
    }

    authenticateClient(ws, token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            this.clients.set(ws, {
                userId: decoded.userId,
                role: decoded.role
            });
        } catch (error) {
            ws.close();
        }
    }

    removeClient(ws) {
        this.clients.delete(ws);
    }

    notifyDeliveryPersonnel(userId, notification) {
        this.clients.forEach((client, ws) => {
            if (client.userId === userId) {
                ws.send(JSON.stringify(notification));
            }
        });
    }

    notifyPantryStaff(notification) {
        this.clients.forEach((client, ws) => {
            if (client.role === 'pantry') {
                ws.send(JSON.stringify(notification));
            }
        });
    }
}

module.exports = WebSocketService; 