const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['manager', 'pantry', 'delivery'],
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    currentTask: {
        type: String,
        enum: ['cooking', 'delivery', null],
        default: null
    }
}, {
    timestamps: true
});

// Add a method to validate password
userSchema.methods.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 