const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Delivery = require('../models/delivery.model');
const User = require('../models/user.model');

// Get delivery personnel dashboard stats
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.userData.userId;

        const pendingDeliveries = await Delivery.countDocuments({
            assignedTo: userId,
            deliveryStatus: { $in: ['pending', 'in-transit'] }
        });

        const completedToday = await Delivery.countDocuments({
            assignedTo: userId,
            deliveryStatus: 'delivered',
            deliveryTime: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lte: new Date().setHours(23, 59, 59, 999)
            }
        });

        const totalDelivered = await Delivery.countDocuments({
            assignedTo: userId,
            deliveryStatus: 'delivered'
        });

        res.json({
            pendingDeliveries,
            completedToday,
            totalDelivered
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get assigned deliveries
router.get('/assigned-deliveries', auth, async (req, res) => {
    try {
        const userId = req.userData.userId;
        const deliveries = await Delivery.find({
            assignedTo: userId,
            deliveryStatus: { $ne: 'delivered' }
        })
        .populate('patientId', 'name roomNumber')
        .populate('dietChartId', 'specialDietaryRequirements')
        .sort({ scheduledTime: 1 });

        const formattedDeliveries = deliveries.map(delivery => ({
            _id: delivery._id,
            patientName: delivery.patientId.name,
            roomNumber: delivery.patientId.roomNumber,
            mealType: delivery.mealType,
            status: delivery.deliveryStatus,
            scheduledTime: delivery.scheduledTime,
            dietaryRequirements: delivery.dietChartId.specialDietaryRequirements
        }));

        res.json(formattedDeliveries);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark delivery as delivered
router.put('/mark-delivered/:id', auth, async (req, res) => {
    try {
        const { notes } = req.body;
        const userId = req.userData.userId;

        const delivery = await Delivery.findOne({
            _id: req.params.id,
            assignedTo: userId
        });

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        delivery.deliveryStatus = 'delivered';
        delivery.deliveryTime = new Date();
        delivery.deliveryNotes = notes;

        await delivery.save();

        // Get updated analytics data
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const deliveriesPerDay = await Delivery.aggregate([
            {
                $match: {
                    deliveryStatus: 'delivered',
                    deliveryTime: {
                        $gte: startDate,
                        $lte: today
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

        // Fill in missing dates
        const allDates = [];
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const existingData = deliveriesPerDay.find(d => d._id === dateStr);
            allDates.push({
                date: dateStr,
                count: existingData ? existingData.count : 0
            });
        }

        // Get WebSocket service and notify with updated data
        const wsService = req.app.get('wsService');
        wsService.notifyPantryStaff({
            type: 'delivery_completed',
            message: 'Delivery has been marked as delivered',
            updateType: 'analytics',
            data: {
                deliveriesPerDay: allDates,
                delivery
            }
        });

        res.json(delivery);
    } catch (error) {
        console.error('Error marking delivery as delivered:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get delivery history
router.get('/history', auth, async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { startDate, endDate } = req.query;

        const query = {
            assignedTo: userId,
            deliveryStatus: 'delivered'
        };

        if (startDate && endDate) {
            query.deliveryTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const deliveries = await Delivery.find(query)
            .populate('patientId', 'name roomNumber')
            .sort({ deliveryTime: -1 })
            .limit(50);

        const formattedDeliveries = deliveries.map(delivery => ({
            _id: delivery._id,
            patientName: delivery.patientId.name,
            roomNumber: delivery.patientId.roomNumber,
            mealType: delivery.mealType,
            deliveryTime: delivery.deliveryTime,
            notes: delivery.deliveryNotes
        }));

        res.json(formattedDeliveries);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update delivery status to in-transit
router.put('/start-delivery/:id', auth, async (req, res) => {
    try {
        const userId = req.userData.userId;
        const delivery = await Delivery.findOneAndUpdate(
            {
                _id: req.params.id,
                assignedTo: userId,
                deliveryStatus: 'pending'
            },
            { deliveryStatus: 'in-transit' },
            { new: true }
        );

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found or already in transit' });
        }

        res.json(delivery);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get deliveries for logged-in delivery personnel
router.get('/my-deliveries', auth, async (req, res) => {
    try {
        // Get deliveries assigned to the logged-in user
        const deliveries = await Delivery.find({
            assignedTo: req.userData.userId,  // Changed from req.user.userId to req.userData.userId
            deliveryStatus: { $in: ['pending', 'in-transit'] }
        })
        .populate('patientId', 'name roomNumber')
        .populate('dietChartId')
        .sort({ scheduledTime: 1 });

        const formattedDeliveries = deliveries.map(delivery => ({
            _id: delivery._id,
            patientName: delivery.patientId.name,
            roomNumber: delivery.patientId.roomNumber,
            mealType: delivery.mealType,
            status: delivery.deliveryStatus,
            scheduledTime: delivery.scheduledTime,
            dietDetails: delivery.dietChartId ? {
                restrictions: delivery.dietChartId.restrictions,
                instructions: delivery.dietChartId.instructions
            } : null
        }));

        res.json(formattedDeliveries);
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 