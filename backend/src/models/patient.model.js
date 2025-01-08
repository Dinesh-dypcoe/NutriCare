const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    diseases: [{
        type: String,
        required: true
    }],
    allergies: [{
        type: String
    }],
    roomNumber: {
        type: String,
        required: true
    },
    bedNumber: {
        type: String,
        required: true
    },
    floorNumber: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    emergencyContact: {
        name: String,
        relationship: String,
        contactNumber: String
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['admitted', 'discharged'],
        default: 'admitted'
    }
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient; 