const express = require('express');
const router = express.Router();
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  addReview,
  getFeaturedProperties
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createPropertyValidator,
  updatePropertyValidator,
  addReviewValidator,
  mongoIdParamValidator
} = require('../validators/propertyValidator');
const validate = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimiter');

router.get('/featured', getFeaturedProperties);

router.route('/')
  .get(getProperties)
  .post(
    protect,
    authorize('admin', 'agent'),
    apiLimiter,
    upload.single('featuredImage'),
    createPropertyValidator,
    validate,
    createProperty
  );

router.route('/:id')
  .get(mongoIdParamValidator, validate, getProperty)
  .put(
    protect,
    authorize('admin', 'agent'),
    mongoIdParamValidator,
    updatePropertyValidator,
    validate,
    updateProperty
  )
  .delete(
    protect,
    authorize('admin'),
    mongoIdParamValidator,
    validate,
    deleteProperty
  );

router.post(
  '/:id/reviews',
  protect,
  apiLimiter,
  addReviewValidator,
  validate,
  addReview
);

module.exports = router;