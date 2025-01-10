const jwt = require('jsonwebtoken');

class WebSocketService {
    constructor() {
        this.io = null;
        this.userSockets = new Map();
    }

    initialize(server) {
        this.io = require('socket.io')(server, {
            cors: {
                origin: [
                    'https://nutri-care1.vercel.app',
                    'http://localhost:5173'
                ],
                methods: ['GET', 'POST']
            }
        });

        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.userId;
                socket.userRole = decoded.role;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.userId);
            
            // Store socket reference for this user
            this.userSockets.set(socket.userId, socket);

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.userId);
                this.userSockets.delete(socket.userId);
            });
        });
    }

    // Notify specific delivery person about new assignment
    notifyDeliveryPerson(userId, data) {
        const socket = this.userSockets.get(userId);
        if (socket) {
            socket.emit('new_delivery_assignment', data);
        }
    }

    // Notify about delivery updates
    notifyDeliveryUpdate(userId, data) {
        const socket = this.userSockets.get(userId);
        if (socket) {
            socket.emit('delivery_update', data);
        }
    }
}

module.exports = new WebSocketService(); 