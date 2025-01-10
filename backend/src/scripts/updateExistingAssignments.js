const mongoose = require('mongoose');
const Delivery = require('../models/delivery.model');
const User = require('../models/user.model');
require('dotenv').config();

const updateAssignments = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all deliveries that need staff assignment
        const deliveries = await Delivery.find({
            $or: [
                { assignedTo: null },
                { assignedTo: undefined }
            ]
        });

        console.log(`Found ${deliveries.length} deliveries that need staff assignment`);

        // Get available staff
        const pantryStaff = await User.findOne({ role: 'pantry' });
        const deliveryStaff = await User.findOne({ role: 'delivery' });

        if (!pantryStaff || !deliveryStaff) {
            console.error('Required staff not found');
            return;
        }

        // Update each delivery
        for (const delivery of deliveries) {
            const isPreparationTask = delivery.preparationStatus === 'pending' || 
                                    delivery.preparationStatus === 'preparing';
            
            // Assign to appropriate staff based on task type
            const staffToAssign = isPreparationTask ? pantryStaff : deliveryStaff;

            await Delivery.findByIdAndUpdate(
                delivery._id,
                { 
                    assignedTo: staffToAssign._id,
                    // Update status if needed
                    preparationStatus: isPreparationTask ? 'preparing' : delivery.preparationStatus,
                    deliveryStatus: !isPreparationTask ? 'assigned' : delivery.deliveryStatus
                }
            );

            console.log(`Updated delivery ${delivery._id} with staff ${staffToAssign.name}`);
        }

        console.log('Successfully updated all assignments');
        process.exit(0);
    } catch (error) {
        console.error('Error updating assignments:', error);
        process.exit(1);
    }
};

updateAssignments(); 