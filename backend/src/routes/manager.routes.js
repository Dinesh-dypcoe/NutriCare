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
        console.log('Creating diet chart with data:', JSON.stringify(req.body, null, 2));

        // Validate required fields
        if (!req.body.patientId) {
            return res.status(400).json({ message: 'Patient ID is required' });
        }

        if (!req.body.meals || !Array.isArray(req.body.meals) || req.body.meals.length === 0) {
            return res.status(400).json({ message: 'At least one meal is required' });
        }

        const dietChart = new DietChart({
            patientId: req.body.patientId,
            meals: req.body.meals.map(meal => ({
                type: meal.type,
                items: meal.items || [],
                specialInstructions: meal.specialInstructions || [],
                timing: meal.timing
            })),
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            specialDietaryRequirements: req.body.specialDietaryRequirements || [],
            status: 'active'
        });

        console.log('Created diet chart object:', dietChart);

        await dietChart.save();
        console.log('Diet chart saved successfully');

        res.status(201).json(dietChart);
    } catch (error) {
        console.error('Error creating diet chart:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation Error', 
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ message: 'Failed to save diet chart', error: error.message });
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
        console.log('Attempting to delete diet chart:', req.params.id);

        const dietChart = await DietChart.findById(req.params.id);
        if (!dietChart) {
            console.log('Diet chart not found');
            return res.status(404).json({ message: 'Diet chart not found' });
        }

        // Delete the diet chart
        await DietChart.findByIdAndDelete(req.params.id);
        console.log('Diet chart deleted successfully');

        // Delete related deliveries if they exist
        await Delivery.deleteMany({ dietChartId: req.params.id });
        console.log('Related deliveries deleted');

        res.json({ message: 'Diet chart deleted successfully' });
    } catch (error) {
        console.error('Error deleting diet chart:', error);
        res.status(500).json({ 
            message: 'Failed to delete diet chart', 
            error: error.message 
        });
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
        // Get all tasks with their assignments
        const assignments = await Delivery.find()
            .populate({
                path: 'assignedTo',
                select: 'name role'
            })
            .populate('patientId', 'name roomNumber')
            .sort({ createdAt: -1 });

        console.log('Found assignments:', assignments); // Debug log

        const formattedAssignments = assignments
            .filter(assignment => assignment.assignedTo) // Only include assignments with staff assigned
            .map(assignment => ({
                _id: assignment._id,
                assignedTo: {
                    _id: assignment.assignedTo._id,
                    name: assignment.assignedTo.name,
                    role: assignment.assignedTo.role
                },
                patientId: assignment.patientId,
                mealType: assignment.mealType,
                scheduledTime: assignment.scheduledTime,
                preparationStatus: assignment.preparationStatus,
                deliveryStatus: assignment.deliveryStatus,
                taskType: assignment.preparationStatus === 'pending' || 
                         assignment.preparationStatus === 'preparing' ? 'preparation' : 'delivery',
                assignedAt: assignment.createdAt
            }));

        console.log('Formatted assignments:', formattedAssignments); // Debug log
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

// Update the analytics endpoint
router.get('/analytics', auth, async (req, res) => {
    try {
        // Get date range for last 7 days
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        // Get deliveries per day for last 7 days
        const deliveriesPerDay = await Delivery.aggregate([
            {
                $match: {
                    deliveryStatus: 'delivered',
                    deliveryTime: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$deliveryTime" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        console.log('Raw deliveries per day:', deliveriesPerDay); // Debug log

        // Fill in missing dates with zero deliveries
        const allDates = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const existingData = deliveriesPerDay.find(d => d._id === dateStr);
            allDates.push({
                date: dateStr,
                count: existingData ? existingData.count : 0
            });
        }

        console.log('Formatted dates:', allDates); // Debug log

        res.json({
            preparationMetrics: {
                totalTasks: await Delivery.countDocuments({ 
                    scheduledTime: { 
                        $gte: new Date().setHours(0, 0, 0, 0),
                        $lte: new Date().setHours(23, 59, 59, 999)
                    }
                }),
                pendingTasks: await Delivery.countDocuments({ 
                    preparationStatus: 'pending',
                    scheduledTime: { 
                        $gte: new Date().setHours(0, 0, 0, 0),
                        $lte: new Date().setHours(23, 59, 59, 999)
                    }
                }),
                preparingTasks: await Delivery.countDocuments({ 
                    preparationStatus: 'preparing',
                    scheduledTime: { 
                        $gte: new Date().setHours(0, 0, 0, 0),
                        $lte: new Date().setHours(23, 59, 59, 999)
                    }
                }),
                completedTasks: await Delivery.countDocuments({ 
                    preparationStatus: 'ready',
                    scheduledTime: { 
                        $gte: new Date().setHours(0, 0, 0, 0),
                        $lte: new Date().setHours(23, 59, 59, 999)
                    }
                })
            },
            mealTypeDistribution: await Delivery.aggregate([
                {
                    $match: {
                        scheduledTime: { 
                            $gte: new Date().setHours(0, 0, 0, 0),
                            $lte: new Date().setHours(23, 59, 59, 999)
                        }
                    }
                },
                {
                    $group: {
                        _id: '$mealType',
                        count: { $sum: 1 }
                    }
                }
            ]),
            statusDistribution: await Delivery.aggregate([
                {
                    $match: {
                        scheduledTime: { 
                            $gte: new Date().setHours(0, 0, 0, 0),
                            $lte: new Date().setHours(23, 59, 59, 999)
                        }
                    }
                },
                {
                    $group: {
                        _id: '$preparationStatus',
                        count: { $sum: 1 }
                    }
                }
            ]),
            deliveriesPerDay: allDates
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update task assignment
router.put('/task-assignments/:id', auth, async (req, res) => {
    try {
        const task = await Delivery.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        .populate('assignedTo', 'name role')
        .populate('patientId', 'name roomNumber');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete task assignment
router.delete('/task-assignments/:id', auth, async (req, res) => {
    try {
        const task = await Delivery.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 