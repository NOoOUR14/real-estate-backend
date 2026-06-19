const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBooking,
  getAllBookings,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createBookingValidator, updateBookingStatusValidator } = require('../validators/bookingValidator');
const { mongoIdParamValidator } = require('../validators/propertyValidator');
const validate = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

router.get('/mine', protect, getMyBookings);

router.route('/')
  .post(protect, apiLimiter, createBookingValidator, validate, createBooking)
  .get(protect, authorize('admin'), getAllBookings);

router.get('/:id', protect, mongoIdParamValidator, validate, getBooking);

router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  updateBookingStatusValidator,
  validate,
  updateBookingStatus
);

router.patch(
  '/:id/cancel',
  protect,
  mongoIdParamValidator,
  validate,
  cancelBooking
);

module.exports = router;