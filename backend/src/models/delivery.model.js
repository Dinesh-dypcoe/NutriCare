const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    dietChartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DietChart',
        required: true
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    preparationStatus: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'delivered'],
        default: 'pending'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'in-transit', 'delivered'],
        default: 'pending'
    },
    deliveryTime: Date,
    deliveryNotes: String,
    scheduledTime: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const Delivery = mongoose.model('Delivery', deliverySchema);
module.exports = Delivery; 