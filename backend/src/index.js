const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config();

const errorHandler = require('./middleware/error');
const WebSocketService = require('./services/websocket');
const authRoutes = require('./routes/auth.routes');
const pantryRoutes = require('./routes/pantry.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const managerRoutes = require('./routes/manager.routes');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize WebSocket service
const wsService = new WebSocketService(server);
app.set('wsService', wsService);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/manager', managerRoutes);

// Error Handler (should be last)
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => console.error('MongoDB connection error:', err));

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
}); 