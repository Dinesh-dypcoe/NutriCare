const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Patient = require('../models/patient.model');
const DietChart = require('../models/dietChart.model');
const Delivery = require('../models/delivery.model');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

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

// Get all pantry staff
router.get('/pantry-staff', auth, async (req, res) => {
    try {
        const pantryStaff = await User.find({ role: 'pantry' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(pantryStaff);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create pantry staff
router.post('/pantry-staff', auth, async (req, res) => {
    try {
        const { name, email, contactNumber, location } = req.body;
        const password = 'Password@2025'; // Default password
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const staff = new User({
            name,
            email,
            password: hashedPassword,
            contactNumber,
            location,
            role: 'pantry'
        });
        
        await staff.save();
        res.status(201).json({ message: 'Pantry staff created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update pantry staff
router.put('/pantry-staff/:id', auth, async (req, res) => {
    try {
        const staff = await User.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        ).select('-password');
        
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }
        
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete pantry staff
router.delete('/pantry-staff/:id', auth, async (req, res) => {
    try {
        const staff = await User.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }
        res.json({ message: 'Staff member deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get preparation tasks
router.get('/preparation-tasks', auth, async (req, res) => {
    try {
        const tasks = await Delivery.find({
            preparationStatus: 'pending',
            assignedTo: null
        })
        .populate('patientId', 'name roomNumber')
        .populate('dietChartId')
        .sort({ scheduledTime: 1 });
        
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get available tasks for assignment
router.get('/available-tasks', auth, async (req, res) => {
    try {
        const preparationTasks = await Delivery.find({
            preparationStatus: 'pending',
            assignedTo: null
        })
        .populate('patientId', 'name roomNumber')
        .populate('dietChartId')
        .sort({ scheduledTime: 1 });

        const deliveryTasks = await Delivery.find({
            preparationStatus: 'ready',
            deliveryStatus: 'pending',
            assignedTo: null
        })
        .populate('patientId', 'name roomNumber')
        .sort({ scheduledTime: 1 });

        res.json({
            preparationTasks,
            deliveryTasks
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update the assign-task route
router.post('/assign-task', auth, async (req, res) => {
    try {
        const { staffId, patientId, dietChartId, taskType, mealType, scheduledTime } = req.body;
        
        // Find the staff member
        const staff = await User.findById(staffId);
        if (!staff) {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        // Create new delivery task
        const delivery = new Delivery({
            patientId,
            dietChartId,
            mealType,
            scheduledTime,
            assignedTo: staffId,
            preparationStatus: taskType === 'preparation' ? 'preparing' : 'ready',
            deliveryStatus: taskType === 'delivery' ? 'assigned' : 'pending'
        });

        await delivery.save();

        // Update staff's current tasks
        staff.currentTasks = staff.currentTasks || [];
        staff.currentTasks.push({
            taskId: delivery._id,
            type: taskType
        });
        await staff.save();

        res.json({ message: 'Task assigned successfully', delivery });
    } catch (error) {
        console.error('Error assigning task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all task assignments
router.get('/task-assignments', auth, async (req, res) => {
    try {
        const assignments = await Delivery.find({
            assignedTo: { $ne: null },
            $or: [
                { preparationStatus: { $in: ['preparing', 'ready'] } },
                { deliveryStatus: { $in: ['assigned', 'in-transit'] } }
            ]
        })
        .populate('assignedTo', 'name')
        .populate('patientId', 'name roomNumber')
        .sort({ createdAt: -1 });

        const formattedAssignments = assignments.map(assignment => ({
            _id: assignment._id,
            assignedTo: assignment.assignedTo,
            patientId: assignment.patientId,
            mealType: assignment.mealType,
            scheduledTime: assignment.scheduledTime,
            preparationStatus: assignment.preparationStatus,
            deliveryStatus: assignment.deliveryStatus,
            taskType: assignment.preparationStatus !== 'ready' ? 'preparation' : 'delivery',
            assignedAt: assignment.createdAt
        }));

        res.json(formattedAssignments);
    } catch (error) {
        console.error('Error fetching task assignments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add this new route to get active diet chart for a patient
router.get('/patients/:patientId/active-diet-chart', auth, async (req, res) => {
    try {
        const activeDietChart = await DietChart.findOne({
            patientId: req.params.patientId,
            status: 'active',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        });
        
        if (!activeDietChart) {
            return res.status(404).json({ message: 'No active diet chart found for this patient' });
        }
        
        res.json(activeDietChart);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 