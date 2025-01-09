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

        delivery.preparationStatus = preparationStatus;
        
        // When marking as ready, ensure it's unassigned
        if (preparationStatus === 'ready') {
            delivery.assignedTo = null;
            delivery.deliveryStatus = 'pending';
        }

        await delivery.save();
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

        // Only allow assignment if task is ready
        if (delivery.preparationStatus !== 'ready') {
            return res.status(400).json({ 
                message: 'Can only assign deliveries that are ready' 
            });
        }

        delivery.assignedTo = deliveryPersonId;
        delivery.deliveryStatus = 'assigned';
        await delivery.save();

        // Return populated delivery object
        const populatedDelivery = await Delivery.findById(delivery._id)
            .populate('assignedTo', 'name');
        
        res.json(populatedDelivery);
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
        // Get today's start and end date
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        // Get today's tasks with better status filtering
        const todaysTasks = await Delivery.find({
            scheduledTime: { 
                $gte: startDate,
                $lte: endDate
            }
        });

        // Calculate metrics more accurately
        const preparationMetrics = {
            totalTasks: todaysTasks.length,  // All tasks scheduled for today
            pendingTasks: todaysTasks.filter(d => d.preparationStatus === 'pending').length,
            preparingTasks: todaysTasks.filter(d => d.preparationStatus === 'preparing').length,
            completedTasks: todaysTasks.filter(d => d.preparationStatus === 'ready').length
        };

        // Get last 7 days dates
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            return date;
        });

        // Get deliveries for last 7 days with proper date range query
        const deliveryData = await Delivery.aggregate([
            {
                $match: {
                    scheduledTime: { 
                        $gte: last7Days[6], // 7 days ago
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { 
                            format: "%Y-%m-%d", 
                            date: "$scheduledTime" 
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id": 1
                }
            }
        ]);

        // Create a map of date to count
        const deliveryMap = new Map(
            deliveryData.map(item => [item._id, item.count])
        );

        // Format the data for all 7 days, including zeros for days with no deliveries
        const deliveriesPerDay = last7Days.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            return {
                date: dateStr,
                count: deliveryMap.get(dateStr) || 0
            };
        }).reverse(); // Reverse to show oldest to newest

        // Get meal type and status distributions
        const mealTypes = await Delivery.aggregate([
            {
                $match: {
                    scheduledTime: { 
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: '$mealType',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusTypes = await Delivery.aggregate([
            {
                $match: {
                    scheduledTime: { 
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: '$preparationStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            preparationMetrics,
            mealTypeDistribution: mealTypes.map(type => ({
                name: type._id,
                value: type.count
            })),
            statusDistribution: statusTypes.map(status => ({
                name: status._id,
                value: status.count
            })),
            deliveriesPerDay
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