const Patient = require('../models/patient.model');
const DietChart = require('../models/dietChart.model');
const Delivery = require('../models/delivery.model');
const mongoose = require('mongoose');

const seedSampleData = async () => {
    try {
        // Clear existing data
        await Promise.all([
            mongoose.connection.collection('patients').deleteMany({}),
            mongoose.connection.collection('dietcharts').deleteMany({}),
            mongoose.connection.collection('deliveries').deleteMany({})
        ]);

        console.log('Cleared existing collections');

        // Create sample patients
        const patients = await Patient.create([
            {
                name: "John Smith",
                diseases: ["Diabetes Type 2", "Hypertension"],
                allergies: ["Peanuts", "Shellfish"],
                roomNumber: "301",
                bedNumber: "A",
                floorNumber: "3",
                age: 65,
                gender: "male",
                contactNumber: "+1234567890",
                emergencyContact: {
                    name: "Mary Smith",
                    relationship: "Wife",
                    contactNumber: "+1234567891"
                },
                status: "admitted"
            },
            {
                name: "Sarah Johnson",
                diseases: ["Celiac Disease"],
                allergies: ["Gluten", "Dairy"],
                roomNumber: "205",
                bedNumber: "B",
                floorNumber: "2",
                age: 42,
                gender: "female",
                contactNumber: "+1234567892",
                emergencyContact: {
                    name: "Mike Johnson",
                    relationship: "Husband",
                    contactNumber: "+1234567893"
                },
                status: "admitted"
            },
            {
                name: "Robert Williams",
                diseases: ["Heart Disease"],
                allergies: ["Soy"],
                roomNumber: "401",
                bedNumber: "A",
                floorNumber: "4",
                age: 58,
                gender: "male",
                contactNumber: "+1234567894",
                status: "admitted"
            },
            {
                name: "Emily Davis",
                diseases: ["Asthma", "Food Allergies"],
                allergies: ["Nuts", "Eggs"],
                roomNumber: "302",
                bedNumber: "C",
                floorNumber: "3",
                age: 28,
                gender: "female",
                contactNumber: "+1234567895",
                status: "admitted"
            },
            {
                name: "Michael Brown",
                diseases: ["Kidney Disease"],
                allergies: ["Seafood"],
                roomNumber: "203",
                bedNumber: "A",
                floorNumber: "2",
                age: 52,
                gender: "male",
                contactNumber: "+1234567896",
                status: "admitted"
            },
            {
                name: "Lisa Anderson",
                diseases: ["Gastritis"],
                allergies: ["Spicy Foods"],
                roomNumber: "405",
                bedNumber: "B",
                floorNumber: "4",
                age: 35,
                gender: "female",
                contactNumber: "+1234567897",
                status: "admitted"
            },
            {
                name: "David Wilson",
                diseases: ["Pneumonia"],
                allergies: [],
                roomNumber: "304",
                bedNumber: "A",
                floorNumber: "3",
                age: 45,
                gender: "male",
                contactNumber: "+1234567898",
                status: "admitted"
            },
            {
                name: "Jennifer Taylor",
                diseases: ["Diabetes Type 1"],
                allergies: ["Penicillin"],
                roomNumber: "206",
                bedNumber: "C",
                floorNumber: "2",
                age: 31,
                gender: "female",
                contactNumber: "+1234567899",
                status: "admitted"
            },
            {
                name: "James Martinez",
                diseases: ["Liver Disease"],
                allergies: ["Lactose"],
                roomNumber: "402",
                bedNumber: "B",
                floorNumber: "4",
                age: 49,
                gender: "male",
                contactNumber: "+1234567900",
                status: "admitted"
            },
            {
                name: "Patricia Moore",
                diseases: ["Arthritis"],
                allergies: [],
                roomNumber: "303",
                bedNumber: "A",
                floorNumber: "3",
                age: 62,
                gender: "female",
                contactNumber: "+1234567901",
                status: "admitted"
            }
        ]);

        console.log('Created sample patients:', patients.length);

        // Create sample diet charts for each patient
        const dietCharts = await Promise.all(patients.map(async (patient) => {
            return DietChart.create({
                patientId: patient._id,
                meals: [
                    {
                        type: "breakfast",
                        items: [
                            {
                                name: patient.diseases.includes("Diabetes Type 2") ? "Sugar-free Oatmeal" : "Regular Oatmeal",
                                quantity: "1 bowl",
                                instructions: patient.diseases.includes("Diabetes Type 2") ? "No sugar added" : "Normal preparation"
                            },
                            {
                                name: "Fresh Fruits",
                                quantity: "1 cup",
                                instructions: "Seasonal mixed fruits"
                            }
                        ],
                        specialInstructions: patient.allergies,
                        timing: "08:00"
                    },
                    {
                        type: "lunch",
                        items: [
                            {
                                name: "Grilled Chicken",
                                quantity: "200g",
                                instructions: patient.diseases.includes("Hypertension") ? "Low sodium" : "Normal seasoning"
                            },
                            {
                                name: "Steamed Vegetables",
                                quantity: "1 cup",
                                instructions: "Mixed vegetables"
                            }
                        ],
                        specialInstructions: patient.allergies,
                        timing: "13:00"
                    },
                    {
                        type: "dinner",
                        items: [
                            {
                                name: "Soup",
                                quantity: "1 bowl",
                                instructions: "Clear soup"
                            },
                            {
                                name: "Whole Grain Bread",
                                quantity: "2 slices",
                                instructions: patient.allergies.includes("Gluten") ? "Gluten-free bread" : "Regular bread"
                            }
                        ],
                        specialInstructions: patient.allergies,
                        timing: "19:00"
                    }
                ],
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                specialDietaryRequirements: patient.allergies,
                status: "active"
            });
        }));

        console.log('Created sample diet charts:', dietCharts.length);

        // Create sample deliveries for each diet chart
        const deliveries = await Promise.all(dietCharts.flatMap(dietChart => {
            const mealTypes = ["breakfast", "lunch", "dinner"];
            return mealTypes.map(mealType => {
                return Delivery.create({
                    patientId: dietChart.patientId,
                    dietChartId: dietChart._id,
                    mealType: mealType,
                    preparationStatus: ["pending", "preparing", "ready"][Math.floor(Math.random() * 3)],
                    deliveryStatus: ["pending", "in-transit", "delivered"][Math.floor(Math.random() * 3)],
                    scheduledTime: new Date(Date.now() + Math.floor(Math.random() * 24) * 60 * 60 * 1000)
                });
            });
        }));

        console.log('Created sample deliveries:', deliveries.length);
        console.log('Sample data seeding completed successfully');

    } catch (error) {
        console.error('Error seeding sample data:', error);
        throw error;
    }
};

module.exports = seedSampleData; 