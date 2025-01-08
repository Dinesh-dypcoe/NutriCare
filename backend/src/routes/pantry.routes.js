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
            preparationStatus: { $in: ['pending', 'preparing'] },
            scheduledTime: { $gte: new Date() }
        })
        .populate('patientId', 'name roomNumber allergies')
        .populate('dietChartId')
        .sort({ scheduledTime: 1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update preparation status
router.put('/preparation-tasks/:id', auth, async (req, res) => {
    try {
        const { preparationStatus } = req.body;
        const delivery = await Delivery.findById(req.params.id);

        if (!delivery) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update preparation times
        if (preparationStatus === 'preparing' && !delivery.preparationStartTime) {
            delivery.preparationStartTime = new Date();
        }
        if (preparationStatus === 'ready' && !delivery.preparationEndTime) {
            delivery.preparationEndTime = new Date();
        }

        delivery.preparationStatus = preparationStatus;
        await delivery.save();

        // Get the WebSocket service
        const wsService = req.app.get('wsService');
        
        // Notify relevant parties about the status change
        wsService.notifyPantryStaff({
            type: 'preparation_status_update',
            message: `Meal preparation status updated to ${preparationStatus}`,
            delivery: delivery
        });

        res.json(delivery);
    } catch (error) {
        console.error('Error updating preparation status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get deliveries for assignment
router.get('/deliveries', auth, async (req, res) => {
    try {
        const deliveries = await Delivery.find({
            preparationStatus: 'ready'
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
            assignedTo: delivery.assignedTo,
            deliveryTime: delivery.deliveryTime
        }));

        res.json(formattedDeliveries);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Assign delivery to personnel
router.put('/deliveries/:id/assign', auth, async (req, res) => {
    try {
        const { deliveryPersonId } = req.body;
        const delivery = await Delivery.findById(req.params.id);

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        if (delivery.assignedTo) {
            return res.status(400).json({ message: 'Delivery already assigned' });
        }

        delivery.assignedTo = deliveryPersonId;
        delivery.deliveryStatus = 'assigned';
        await delivery.save();

        // Get the WebSocket service
        const wsService = req.app.get('wsService');
        
        // Notify relevant parties
        wsService.notifyPantryStaff({
            type: 'delivery_assigned',
            message: 'Delivery has been assigned',
            delivery: delivery
        });

        res.json(delivery);
    } catch (error) {
        console.error('Error assigning delivery:', error);
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

// Add this route to get analytics data
router.get('/analytics', auth, async (req, res) => {
    try {
        // Get today's start date
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        // Get all deliveries for today
        const todaysDeliveries = await Delivery.find({
            createdAt: { $gte: startDate }
        });

        // Calculate preparation metrics
        const completedTasks = todaysDeliveries.filter(d => d.preparationStatus === 'ready').length;
        
        // Calculate delayed tasks
        const delayedTasks = todaysDeliveries.filter(d => {
            const scheduledTime = new Date(d.scheduledTime);
            return scheduledTime < new Date() && d.preparationStatus !== 'ready';
        }).length;

        // Calculate average preparation time (in minutes) for completed tasks
        const completedDeliveries = todaysDeliveries.filter(delivery => 
            delivery.preparationStatus === 'ready' && 
            delivery.updatedAt > delivery.createdAt
        );

        let avgPrepTime = 0;
        if (completedDeliveries.length > 0) {
            const totalPrepTime = completedDeliveries.reduce((acc, delivery) => {
                // Find the time between when preparation started (status changed to 'preparing')
                // and when it was completed (status changed to 'ready')
                const prepStartTime = new Date(delivery.createdAt);
                const prepEndTime = new Date(delivery.updatedAt);
                const timeDiff = prepEndTime - prepStartTime;
                return acc + (timeDiff / (1000 * 60)); // Convert to minutes
            }, 0);
            
            avgPrepTime = Math.round(totalPrepTime / completedDeliveries.length);
        }

        // Get meal type distribution
        const mealTypes = await Delivery.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$mealType', count: { $sum: 1 } } }
        ]);

        // Get status distribution
        const statusTypes = await Delivery.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: '$preparationStatus', count: { $sum: 1 } } }
        ]);

        res.json({
            preparationMetrics: {
                totalTasks: todaysDeliveries.length,
                completedTasks,
                averagePreparationTime: avgPrepTime,
                delayedTasks
            },
            mealTypeDistribution: mealTypes.map(type => ({
                name: type._id,
                value: type.count
            })),
            statusDistribution: statusTypes.map(status => ({
                name: status._id,
                value: status.count
            }))
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add this route to mark delivery as delivered
router.put('/deliveries/:id/delivered', auth, async (req, res) => {
    try {
        const delivery = await Delivery.findById(req.params.id);

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        if (!delivery.assignedTo) {
            return res.status(400).json({ message: 'Delivery must be assigned before marking as delivered' });
        }

        delivery.deliveryStatus = 'delivered';
        delivery.deliveryTime = new Date();
        await delivery.save();

        // Get the WebSocket service
        const wsService = req.app.get('wsService');
        
        // Notify relevant parties
        wsService.notifyPantryStaff({
            type: 'delivery_completed',
            message: 'Delivery has been marked as delivered',
            delivery: delivery
        });

        res.json(delivery);
    } catch (error) {
        console.error('Error marking delivery as delivered:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 