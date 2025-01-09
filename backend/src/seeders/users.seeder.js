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
            // Pantry Staff Members
            {
                name: 'John Pantry',
                email: 'hospital_pantry@xyz.com',
                password: 'Password@2025',
                contactNumber: '+1234567891',
                role: 'pantry',
                location: 'Main Kitchen'
            },
            {
                name: 'Sarah Kitchen',
                email: 'sarah.pantry@xyz.com',
                password: 'Password@2025',
                contactNumber: '+1234567892',
                role: 'pantry',
                location: 'Floor 2 Kitchen'
            },
            {
                name: 'Mike Cook',
                email: 'mike.pantry@xyz.com',
                password: 'Password@2025',
                contactNumber: '+1234567893',
                role: 'pantry',
                location: 'Special Diet Kitchen'
            },
            {
                name: 'Emily Food',
                email: 'emily.pantry@xyz.com',
                password: 'Password@2025',
                contactNumber: '+1234567894',
                role: 'pantry',
                location: 'Prep Kitchen'
            },
            {
                name: 'David Chef',
                email: 'david.pantry@xyz.com',
                password: 'Password@2025',
                contactNumber: '+1234567895',
                role: 'pantry',
                location: 'Main Kitchen'
            },
            // Delivery Staff Members
            {
                name: 'John Delivery',
                email: 'hospital_delivery@xyz.com',
                password: 'Password@2025',
                contactNumber: '+1234567896',
                role: 'delivery'
            },
            {
                name: 'Sarah Delivery',
                email: 'sarah.delivery@xyz.com',
                password: 'Password@2025',
                contactNumber: '+1234567897',
                role: 'delivery'
            },
            {
                name: 'Mike Delivery',
                email: 'mike.delivery@xyz.com',
                password: 'Password@2025',
                contactNumber: '+1234567898',
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