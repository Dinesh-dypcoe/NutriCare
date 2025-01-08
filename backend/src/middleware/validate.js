const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        
        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            
            return res.status(400).json({
                message: 'Validation Error',
                errors
            });
        }
        
        next();
    };
};

// Validation schemas
const schemas = {
    delivery: Joi.object({
        patientId: Joi.string().required(),
        mealType: Joi.string().valid('breakfast', 'lunch', 'dinner').required(),
        scheduledTime: Joi.date().required(),
        notes: Joi.string().allow('', null)
    }),

    deliveryStatus: Joi.object({
        status: Joi.string().valid('pending', 'in-transit', 'delivered').required(),
        notes: Joi.string().allow('', null)
    }),

    deliveryPersonnel: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        contactNumber: Joi.string().required(),
        password: Joi.string().min(8)
    })
};

module.exports = {
    validate,
    schemas
}; 