const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, admin } = require('../middleware/authMiddleware');


router.post('/', protect, async (req, res) => {
    try {
        const { property, bookingDate, message, phoneNumber } = req.body;

        
        const existingBooking = await Booking.findOne({
            user: req.user._id,
            property: property,
            status: 'Pending'
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending inquiry for this property.'
            });
        }

        const booking = await Booking.create({
            property,
            user: req.user._id,
            bookingDate,
            message,
            phoneNumber
        });

        res.status(201).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


router.get('/', protect, admin, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate({
                path: 'property',
                select: 'title price location image' 
            })
            .populate({
                path: 'user',
                select: 'name email'
            })
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


router.patch('/:id', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;