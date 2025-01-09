const sampleDietCharts = [
    {
        patientId: patientIds[0],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'active',
        dietaryType: 'regular',
        
        // Breakfast details
        breakfastItems: [
            'Oatmeal with honey',
            'Fresh fruit bowl',
            'Whole grain toast',
            'Boiled eggs',
            'Orange juice'
        ],
        breakfastCalories: 450,
        breakfastPortionSize: 'Standard',
        breakfastNotes: 'Serve oatmeal warm, fruit should be fresh and seasonal',

        // Lunch details
        lunchItems: [
            'Grilled chicken breast',
            'Brown rice',
            'Steamed vegetables',
            'Garden salad',
            'Low-fat yogurt'
        ],
        lunchCalories: 650,
        lunchPortionSize: 'Large',
        lunchNotes: 'Chicken should be well-cooked, no raw vegetables',

        // Dinner details
        dinnerItems: [
            'Baked fish',
            'Quinoa',
            'Roasted vegetables',
            'Soup',
            'Fresh fruit'
        ],
        dinnerCalories: 550,
        dinnerPortionSize: 'Medium',
        dinnerNotes: 'Fish should be fresh, avoid spicy seasonings',

        specialDietaryRequirements: ['Low sodium', 'No nuts'],
        allergies: ['Peanuts', 'Shellfish'],
        additionalNotes: 'Patient prefers warm meals, no cold items except fruits'
    },
    {
        patientId: patientIds[1],
        startDate: new Date(),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'active',
        dietaryType: 'diabetic',

        // Breakfast details
        breakfastItems: [
            'Sugar-free muesli',
            'Skimmed milk',
            'Whole grain bread',
            'Sugar-free jam',
            'Green tea'
        ],
        breakfastCalories: 350,
        breakfastPortionSize: 'Standard',
        breakfastNotes: 'Use sugar substitutes where needed, monitor portion sizes',

        // Lunch details
        lunchItems: [
            'Lean turkey',
            'Whole wheat pasta',
            'Mixed vegetables',
            'Greek salad',
            'Sugar-free jello'
        ],
        lunchCalories: 500,
        lunchPortionSize: 'Standard',
        lunchNotes: 'Ensure low glycemic index items, measure carbohydrates carefully',

        // Dinner details
        dinnerItems: [
            'Grilled tofu',
            'Cauliflower rice',
            'Steamed broccoli',
            'Clear soup',
            'Sugar-free pudding'
        ],
        dinnerCalories: 400,
        dinnerPortionSize: 'Small',
        dinnerNotes: 'Evening meal should be light, avoid high-carb items',

        specialDietaryRequirements: ['Diabetic diet', 'Low carb'],
        allergies: ['Soy'],
        additionalNotes: 'Blood sugar levels need to be monitored before meals'
    }
];

// Add more sample diet charts as needed... 