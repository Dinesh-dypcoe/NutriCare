import { io } from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (!this.socket) {
            const token = localStorage.getItem('token');
            this.socket = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
                auth: { token },
                transports: ['websocket']
            });

            this.socket.on('connect', () => {
                console.log('WebSocket connected');
            });

            this.socket.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            // Listen for delivery updates
            this.socket.on('delivery_update', (data) => {
                console.log('Received delivery update:', data);
                this.notifyListeners('delivery_update', data);
            });

            // Listen for new assignments
            this.socket.on('new_delivery_assignment', (data) => {
                console.log('Received new delivery assignment:', data);
                this.notifyListeners('new_delivery_assignment', data);
            });
        }
    }

    addListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    removeListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const wsService = new WebSocketService();
export default wsService; 