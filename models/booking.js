const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Property ID is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    bookingDate: {
        type: Date,
        required: [true, 'Please specify a date and time for the visit'],
        validate: {
            validator: function(value) {
                return value > Date.now();
            },
            message: 'Booking date must be in the future'
        }
    },
    message: {
        type: String,
        required: [true, 'Please add a message for the property owner'],
        trim: true,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Contact phone number is required'],
        trim: true
    },
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
            message: '{VALUE} is not a valid status'
        },
        default: 'Pending'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

bookingSchema.index({ property: 1, user: 1 });

module.exports = mongoose.model('Booking', bookingSchema);