const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', email);

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('User found:', user.email, 'Role:', user.role);

        // Verify password using the schema method
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log('Password validated successfully');

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                role: user.role,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('JWT token generated');

        // Send response
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        console.log('Login successful for:', email);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Test route to check users in database
router.get('/test-users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        console.log('Available users:', users);
        res.json(users);
    } catch (error) {
        console.error('Error fetching test users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add this route to verify a specific user
router.get('/verify-user/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }, '-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 
module.exports = router; 