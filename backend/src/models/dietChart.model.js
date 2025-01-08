const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true
    },
    items: [{
        name: String,
        quantity: String,
        instructions: String
    }],
    specialInstructions: [String],
    timing: String
});

const dietChartSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    meals: [mealSchema],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    specialDietaryRequirements: [String],
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    }
}, {
    timestamps: true
});

const DietChart = mongoose.model('DietChart', dietChartSchema);
module.exports = DietChart; 