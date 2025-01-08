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
const seedUsers = require('./seeders/users.seeder');
const seedSampleData = require('./seeders/sample.seeder');
const managerRoutes = require('./routes/manager.routes');

const app = express();
const server = http.createServer(app);
const wsService = new WebSocketService(server);

// Add wsService to app for use in routes
app.set('wsService', wsService);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB and initialize database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear existing data and seed (only in development)
    if (process.env.NODE_ENV !== 'production') {
        try {
            // Clear existing users
            await mongoose.connection.db.collection('users').deleteMany({});
            console.log('Cleared existing users');
            
            // Seed users and sample data
            await seedUsers();
            await seedSampleData();
            console.log('Database seeding completed');
        } catch (error) {
            console.error('Database initialization error:', error);
        }
    }
})
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/manager', managerRoutes);

// Error Handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 