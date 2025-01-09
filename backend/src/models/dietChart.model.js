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
    },
    // Breakfast details
    breakfastItems: {
        type: [String],
        default: []
    },
    breakfastCalories: {
        type: Number,
        required: true
    },
    breakfastPortionSize: String,
    breakfastNotes: String,

    // Lunch details
    lunchItems: {
        type: [String],
        default: []
    },
    lunchCalories: {
        type: Number,
        required: true
    },
    lunchPortionSize: String,
    lunchNotes: String,

    // Dinner details
    dinnerItems: {
        type: [String],
        default: []
    },
    dinnerCalories: {
        type: Number,
        required: true
    },
    dinnerPortionSize: String,
    dinnerNotes: String
}, {
    timestamps: true
});

const DietChart = mongoose.model('DietChart', dietChartSchema);
module.exports = DietChart; 