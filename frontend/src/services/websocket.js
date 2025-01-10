class WebSocketService {
    constructor() {
        this.ws = null;
        this.listeners = new Map();
        this.wsUrl = import.meta.env.VITE_API_URL.replace('http', 'ws').replace('/api', '');
    }

    connect() {
        this.ws = new WebSocket(this.wsUrl);

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

    addListener(id, handler) {
        this.listeners.set(id, { id, handler });
    }

    removeListener(id) {
        this.listeners.delete(id);
    }

    notifyListeners(notification) {
        this.listeners.forEach(callback => {
            if (notification.updateType === 'analytics') {
                // Only notify analytics listeners with the full data
                if (callback.id === 'analytics') {
                    callback.handler({
                        ...notification,
                        data: notification.data
                    });
                }
            } else {
                callback.handler(notification);
            }
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

export default new WebSocketService(); 