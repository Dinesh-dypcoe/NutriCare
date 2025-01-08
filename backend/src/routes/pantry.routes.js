const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Delivery = require('../models/delivery.model');
const User = require('../models/user.model');

// Get dashboard stats
router.get('/dashboard-stats', auth, async (req, res) => {
    try {
        const pendingPreparations = await Delivery.countDocuments({ 
            preparationStatus: 'pending' 
        });
        const activeDeliveries = await Delivery.countDocuments({ 
            deliveryStatus: 'in-transit' 
        });
        const totalDeliveryPersonnel = await User.countDocuments({ 
            role: 'delivery' 
        });

        res.json({
            pendingPreparations,
            activeDeliveries,
            totalDeliveryPersonnel
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get preparation tasks
router.get('/preparation-tasks', auth, async (req, res) => {
    try {
        const tasks = await Delivery.find({
            preparationStatus: { $ne: 'delivered' }
        })
        .populate('patientId', 'name roomNumber')
        .populate('dietChartId', 'specialDietaryRequirements')
        .populate({
            path: 'dietChartId',
            select: 'specialDietaryRequirements meals notes'
        })
        .sort({ scheduledTime: 1 });

        const formattedTasks = tasks.map(task => ({
            _id: task._id,
            patientName: task.patientId.name,
            roomNumber: task.patientId.roomNumber,
            mealType: task.mealType,
            status: task.preparationStatus,
            dietaryRequirements: task.dietChartId.specialDietaryRequirements,
            scheduledTime: task.scheduledTime,
            notes: task.notes,
            mealDetails: task.dietChartId.meals.find(m => m.type === task.mealType)
        }));

        res.json(formattedTasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update preparation status
router.put('/preparation-tasks/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            { preparationStatus: status },
            { new: true }
        );

        // Get updated analytics
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        
        const todaysTasks = await Delivery.find({
            createdAt: { $gte: startDate }
        });

        const analyticsUpdate = {
            totalTasks: todaysTasks.length,
            completedTasks: todaysTasks.filter(task => task.preparationStatus === 'ready').length,
            delayedTasks: todaysTasks.filter(task => task.isDelayed).length
        };

        // Get WebSocket service and notify all pantry staff
        const wsService = req.app.get('wsService');
        wsService.notifyPantryStaff({
            type: 'analytics-update',
            data: analyticsUpdate
        });

        res.json(delivery);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get deliveries for assignment
router.get('/deliveries', auth, async (req, res) => {
    try {
        const deliveries = await Delivery.find({
            preparationStatus: 'ready',
            deliveryStatus: { $ne: 'delivered' }
        })
        .populate('patientId', 'name roomNumber')
        .populate('assignedTo', 'name')
        .sort({ scheduledTime: 1 });

        const formattedDeliveries = deliveries.map(delivery => ({
            _id: delivery._id,
            patientName: delivery.patientId.name,
            roomNumber: delivery.patientId.roomNumber,
            mealType: delivery.mealType,
            status: delivery.deliveryStatus,
            assignedTo: delivery.assignedTo
        }));

        res.json(formattedDeliveries);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Assign delivery to personnel
router.put('/deliveries/:id/assign', auth, async (req, res) => {
    try {
        const { personnelId } = req.body;
        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            { 
                assignedTo: personnelId,
                deliveryStatus: 'in-transit'
            },
            { new: true }
        );
        res.json(delivery);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get delivery personnel
router.get('/delivery-personnel', auth, async (req, res) => {
    try {
        const personnel = await User.find({ role: 'delivery' })
            .select('name email contactNumber');
        
        // Get active deliveries count for each personnel
        const personnelWithDeliveries = await Promise.all(
            personnel.map(async (person) => {
                const activeDeliveries = await Delivery.countDocuments({
                    assignedTo: person._id,
                    deliveryStatus: { $ne: 'delivered' }
                });
                return {
                    ...person.toObject(),
                    activeDeliveries
                };
            })
        );

        res.json(personnelWithDeliveries);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new delivery personnel
router.post('/delivery-personnel', auth, async (req, res) => {
    try {
        const { name, email, contactNumber } = req.body;
        const password = 'Password@2025'; // Default password as specified

        const newPersonnel = new User({
            name,
            email,
            password,
            contactNumber,
            role: 'delivery'
        });

        await newPersonnel.save();
        res.status(201).json(newPersonnel);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update delivery personnel
router.put('/delivery-personnel/:id', auth, async (req, res) => {
    try {
        const { name, email, contactNumber } = req.body;
        const personnel = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, contactNumber },
            { new: true }
        );
        res.json(personnel);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete delivery personnel
router.delete('/delivery-personnel/:id', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Personnel deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add this route to your existing pantry.routes.js file

router.get('/analytics', auth, async (req, res) => {
    try {
        const { timeRange } = req.query;
        let startDate;

        // Calculate start date based on time range
        switch (timeRange) {
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            default: // today
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
        }

        // Get all tasks within the time range
        const tasks = await Delivery.find({
            createdAt: { $gte: startDate }
        });

        // Calculate metrics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.preparationStatus === 'ready').length;
        
        // Calculate average preparation time
        const completedTasksWithTime = tasks.filter(task => 
            task.preparationStatus === 'ready' && task.completedAt
        );
        const avgPrepTime = completedTasksWithTime.reduce((acc, task) => {
            const prepTime = task.completedAt - task.createdAt;
            return acc + prepTime;
        }, 0) / (completedTasksWithTime.length || 1);

        // Calculate distributions
        const mealTypeDistribution = {
            breakfast: tasks.filter(t => t.mealType === 'breakfast').length,
            lunch: tasks.filter(t => t.mealType === 'lunch').length,
            dinner: tasks.filter(t => t.mealType === 'dinner').length
        };

        const statusDistribution = {
            pending: tasks.filter(t => t.preparationStatus === 'pending').length,
            preparing: tasks.filter(t => t.preparationStatus === 'preparing').length,
            ready: tasks.filter(t => t.preparationStatus === 'ready').length
        };

        res.json({
            preparationMetrics: {
                totalTasks,
                completedTasks,
                averagePreparationTime: Math.round(avgPrepTime / (1000 * 60)), // Convert to minutes
                delayedTasks: tasks.filter(t => t.isDelayed).length
            },
            mealTypeDistribution,
            statusDistribution
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 