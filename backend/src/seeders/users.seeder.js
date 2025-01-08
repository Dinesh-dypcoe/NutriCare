const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const seedUsers = async () => {
    try {
        const testUsers = [
            {
                name: 'Hospital Manager',
                email: 'hospital_manager@xyz.com',
                password: 'Password@2025',
                contactNumber: '+1234567890',
                role: 'manager'
            },
            {
                name: 'Pantry Staff',
                email: 'hospital_pantry@xyz.com',
                password: 'Password@2025',
                contactNumber: '+1234567891',
                role: 'pantry'
            },
            {
                name: 'Delivery Personnel',
                email: 'hospital_delivery@xyz.com',
                password: 'Password@2025',
                contactNumber: '+1234567892',
                role: 'delivery'
            }
        ];

        for (const user of testUsers) {
            const existingUser = await User.findOne({ email: user.email });
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                await User.create({
                    ...user,
                    password: hashedPassword
                });
                console.log(`Created test user: ${user.email}`);
            } else {
                console.log(`Test user already exists: ${user.email}`);
            }
        }

        console.log('Test users seeding completed');
    } catch (error) {
        console.error('Error seeding test users:', error);
    }
};

module.exports = seedUsers; 