class WebSocketService {
    constructor() {
        this.ws = null;
        this.listeners = new Map();
    }

    connect() {
        this.ws = new WebSocket('ws://localhost:5000');

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            const token = localStorage.getItem('token');
            if (token) {
                this.ws.send(JSON.stringify({
                    type: 'auth',
                    token
                }));
            }
        };

        this.ws.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            this.notifyListeners(notification);
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connect(), 5000);
        };
    }

    addListener(id, callback) {
        this.listeners.set(id, callback);
    }

    removeListener(id) {
        this.listeners.delete(id);
    }

    notifyListeners(notification) {
        this.listeners.forEach(callback => {
            callback(notification);
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

export default new WebSocketService(); 