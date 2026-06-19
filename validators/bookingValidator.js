const { body, param } = require('express-validator');

const createBookingValidator = [
  body('property')
    .notEmpty().withMessage('Property ID is required')
    .isMongoId().withMessage('Invalid property ID'),

  body('bookingDate')
    .notEmpty().withMessage('Booking date is required')
    .isISO8601().withMessage('Booking date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= Date.now()) {
        throw new Error('Booking date must be in the future');
      }
      return true;
    }),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 2, max: 500 }).withMessage('Message must be between 2 and 500 characters'),

  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{6,15}$/)
    .withMessage('Please provide a valid phone number')
];

const updateBookingStatusValidator = [
  param('id')
    .isMongoId().withMessage('Invalid booking ID'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Pending', 'Confirmed', 'Cancelled', 'Completed'])
    .withMessage('Invalid booking status')
];

module.exports = { createBookingValidator, updateBookingStatusValidator };