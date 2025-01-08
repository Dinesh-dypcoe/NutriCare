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
    preparationStatus: {
        type: String,
        enum: ['pending', 'preparing', 'ready'],
        default: 'pending'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'assigned', 'in-transit', 'delivered'],
        default: 'pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
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