const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Booking = require('../models/booking');
const Property = require('../models/property');
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

router.use(protect, authorize('admin'));

router.get('/dashboard', asyncHandler(async (req, res, next) => {
  const [totalUsers, totalProperties, totalBookings, recentBookings, recentUsers, propertyStats] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    Property.countDocuments(),
    Booking.countDocuments(),
    Booking.find()
      .populate({ path: 'property', select: 'title' })
      .populate({ path: 'user', select: 'name email' })
      .sort('-createdAt')
      .limit(5),
    User.find({ role: { $ne: 'admin' } })
      .select('name email role createdAt')
      .sort('-createdAt')
      .limit(5),
    Property.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    ])
  ]);

  const bookingStats = {
    pending: await Booking.countDocuments({ status: 'Pending' }),
    confirmed: await Booking.countDocuments({ status: 'Confirmed' }),
    cancelled: await Booking.countDocuments({ status: 'Cancelled' }),
    completed: await Booking.countDocuments({ status: 'Completed' })
  };

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalProperties,
        totalBookings,
        bookingStats,
        propertyStats
      },
      recentBookings,
      recentUsers
    }
  });
}));

router.get('/users', asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, role, isActive } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const users = await User.find(filter)
    .select('-refreshToken')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    count: users.length,
    pagination: {
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    },
    data: users
  });
}));

router.patch('/users/:id/toggle-status', asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  if (user.role === 'admin') {
    return next(new ApiError(403, 'Cannot deactivate an admin user'));
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: user
  });
}));

module.exports = router;