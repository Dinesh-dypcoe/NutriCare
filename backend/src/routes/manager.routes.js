const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Patient = require('../models/patient.model');
const DietChart = require('../models/dietChart.model');
const Delivery = require('../models/delivery.model');

// Get dashboard stats
router.get('/dashboard-stats', auth, async (req, res) => {
    try {
        const totalPatients = await Patient.countDocuments({ status: 'admitted' });
        const pendingDeliveries = await Delivery.countDocuments({ 
            deliveryStatus: { $in: ['pending', 'in-transit'] }
        });
        const activeDietCharts = await DietChart.countDocuments({ 
            status: 'active',
            endDate: { $gte: new Date() }
        });

        res.json({
            totalPatients,
            pendingDeliveries,
            activeDietCharts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all patients
router.get('/patients', auth, async (req, res) => {
    try {
        const patients = await Patient.find()
            .sort({ createdAt: -1 });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single patient
router.get('/patients/:id', auth, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create patient
router.post('/patients', auth, async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update patient
router.put('/patients/:id', auth, async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete patient
router.delete('/patients/:id', auth, async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all diet charts
router.get('/diet-charts', auth, async (req, res) => {
    try {
        const dietCharts = await DietChart.find()
            .populate('patientId', 'name roomNumber')
            .sort({ createdAt: -1 });
        res.json(dietCharts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single diet chart
router.get('/diet-charts/:id', auth, async (req, res) => {
    try {
        const dietChart = await DietChart.findById(req.params.id)
            .populate('patientId', 'name roomNumber');
        if (!dietChart) {
            return res.status(404).json({ message: 'Diet chart not found' });
        }
        res.json(dietChart);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create diet chart
router.post('/diet-charts', auth, async (req, res) => {
    try {
        const dietChart = new DietChart(req.body);
        await dietChart.save();

        // Create delivery entries for each meal
        const deliveries = req.body.meals.map(meal => ({
            patientId: req.body.patientId,
            dietChartId: dietChart._id,
            mealType: meal.type,
            scheduledTime: new Date(meal.timing),
            preparationStatus: 'pending',
            deliveryStatus: 'pending'
        }));

        await Delivery.insertMany(deliveries);

        res.status(201).json(dietChart);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update diet chart
router.put('/diet-charts/:id', auth, async (req, res) => {
    try {
        const dietChart = await DietChart.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!dietChart) {
            return res.status(404).json({ message: 'Diet chart not found' });
        }

        // Update related deliveries
        await Delivery.updateMany(
            { dietChartId: dietChart._id },
            { $set: { status: req.body.status } }
        );

        res.json(dietChart);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete diet chart
router.delete('/diet-charts/:id', auth, async (req, res) => {
    try {
        const dietChart = await DietChart.findByIdAndDelete(req.params.id);
        if (!dietChart) {
            return res.status(404).json({ message: 'Diet chart not found' });
        }

        // Delete related deliveries
        await Delivery.deleteMany({ dietChartId: req.params.id });

        res.json({ message: 'Diet chart deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent activities
router.get('/recent-activities', auth, async (req, res) => {
    try {
        const recentDeliveries = await Delivery.find()
            .populate('patientId', 'name roomNumber')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentDietCharts = await DietChart.find()
            .populate('patientId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            recentDeliveries,
            recentDietCharts
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 