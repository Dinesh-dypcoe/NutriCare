const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wsService = require('./services/websocket');

// Middleware
app.use(cors({
    origin: [
        'https://nutri-care1.vercel.app',
        'http://localhost:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize WebSocket service
wsService.initialize(server);

// Add this root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'NutriCare API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            manager: '/api/manager',
            pantry: '/api/pantry',
            delivery: '/api/delivery'
        }
    });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/manager', require('./routes/manager.routes'));
app.use('/api/pantry', require('./routes/pantry.routes'));
app.use('/api/delivery', require('./routes/delivery.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 