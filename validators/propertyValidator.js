const { body, param, query } = require('express-validator');

const createPropertyValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ min: 2, max: 200 }).withMessage('Location must be between 2 and 200 characters'),

  body('type')
    .trim()
    .notEmpty().withMessage('Property type is required')
    .isIn(['Apartment', 'House', 'Villa', 'Condo', 'Land', 'Office', 'Commercial'])
    .withMessage('Invalid property type')
];

const updatePropertyValidator = [
  param('id')
    .isMongoId().withMessage('Invalid property ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Location must be between 2 and 200 characters'),

  body('type')
    .optional()
    .trim()
    .isIn(['Apartment', 'House', 'Villa', 'Condo', 'Land', 'Office', 'Commercial'])
    .withMessage('Invalid property type')
];

const addReviewValidator = [
  param('id')
    .isMongoId().withMessage('Invalid property ID'),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ min: 2, max: 1000 }).withMessage('Comment must be between 2 and 1000 characters')
];

const mongoIdParamValidator = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

module.exports = {
  createPropertyValidator,
  updatePropertyValidator,
  addReviewValidator,
  mongoIdParamValidator
};