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
            assignedTo: userId,
            deliveryStatus: { $in: ['pending', 'assigned', 'in-transit'] }
        });

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found or cannot be marked as delivered' });
        }

        delivery.deliveryStatus = 'delivered';
        delivery.deliveryTime = new Date();
        delivery.deliveryNotes = notes;

        await delivery.save();

        // Send success response
        res.json({
            message: 'Delivery marked as completed successfully',
            delivery
        });
    } catch (error) {
        console.error('Error marking delivery as delivered:', error);
        res.status(500).json({ 
            message: 'Failed to mark delivery as delivered',
            error: error.message 
        });
    }
});

// Get delivery history
router.get('/history', auth, async (req, res) => {
    try {
        const userId = req.userData.userId;
        
        // Get all delivered orders for this delivery person
        const deliveries = await Delivery.find({
            assignedTo: userId,
            deliveryStatus: 'delivered'
        })
        .populate('patientId', 'name roomNumber')
        .sort({ deliveryTime: -1 });

        const formattedHistory = deliveries.map(delivery => ({
            _id: delivery._id,
            patientName: delivery.patientId?.name || 'Unknown',
            roomNumber: delivery.patientId?.roomNumber || 'N/A',
            mealType: delivery.mealType,
            deliveryTime: delivery.deliveryTime,
            notes: delivery.deliveryNotes || ''
        }));

        console.log(`Found ${formattedHistory.length} delivered items for user ${userId}`);
        res.json(formattedHistory);
    } catch (error) {
        console.error('Error fetching delivery history:', error);
        res.status(500).json({ 
            message: 'Failed to fetch delivery history',
            error: error.message 
        });
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
        const userId = req.userData.userId;
        console.log('Fetching active deliveries for user:', userId);

        // Get all non-delivered orders for this delivery person
        const deliveries = await Delivery.find({
            assignedTo: userId,
            deliveryStatus: { $in: ['pending', 'assigned', 'in-transit'] }
        })
        .populate({
            path: 'patientId',
            select: 'name roomNumber'
        })
        .populate({
            path: 'dietChartId',
            select: 'specialDietaryRequirements'
        })
        .sort({ scheduledTime: 1 });

        console.log('Found deliveries:', deliveries);

        const formattedDeliveries = deliveries.map(delivery => ({
            _id: delivery._id,
            patientName: delivery.patientId?.name || 'Unknown',
            roomNumber: delivery.patientId?.roomNumber || 'N/A',
            mealType: delivery.mealType,
            scheduledTime: delivery.scheduledTime,
            status: delivery.deliveryStatus,
            dietaryRequirements: delivery.dietChartId?.specialDietaryRequirements || [],
            canMarkDelivered: ['pending', 'assigned', 'in-transit'].includes(delivery.deliveryStatus)
        }));

        console.log('Formatted deliveries:', formattedDeliveries);
        res.json(formattedDeliveries);
    } catch (error) {
        console.error('Error fetching active deliveries:', error);
        res.status(500).json({ 
            message: 'Failed to fetch active deliveries',
            error: error.message 
        });
    }
});

module.exports = router; 