const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: String,
    instructions: String
});

const mealSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true
    },
    items: [mealItemSchema],
    specialInstructions: [String],
    timing: {
        type: String,
        required: true
    }
});

const dietChartSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    meals: {
        type: [mealSchema],
        required: true,
        validate: [
            {
                validator: function(meals) {
                    return meals && meals.length > 0;
                },
                message: 'At least one meal is required'
            }
        ]
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    specialDietaryRequirements: [String],
    allergies: [String],
    additionalNotes: String,
    breakfastCalories: {
        type: Number,
        default: 0
    },
    lunchCalories: {
        type: Number,
        default: 0
    },
    dinnerCalories: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const DietChart = mongoose.model('DietChart', dietChartSchema);
module.exports = DietChart; 