const Booking = require('../models/booking');
const Property = require('../models/property');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.createBooking = asyncHandler(async (req, res, next) => {
  const { property, bookingDate, message, phoneNumber } = req.body;

  const propertyExists = await Property.findById(property);
  if (!propertyExists) {
    return next(new ApiError(404, 'Property not found'));
  }

  if (propertyExists.status !== 'available') {
    return next(new ApiError(400, 'Property is not available for booking'));
  }

  const existingBooking = await Booking.findOne({
    user: req.user._id,
    property,
    status: { $in: ['Pending', 'Confirmed'] }
  });

  if (existingBooking) {
    return next(new ApiError(400, 'You already have an active inquiry for this property'));
  }

  const booking = await Booking.create({
    property,
    user: req.user._id,
    bookingDate,
    message,
    phoneNumber
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate({
      path: 'property',
      select: 'title price location featuredImage'
    })
    .populate({
      path: 'user',
      select: 'name email phone'
    });

  res.status(201).json({
    success: true,
    data: populatedBooking
  });
});

exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate({
      path: 'property',
      select: 'title price location featuredImage type status'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate({
      path: 'property',
      select: 'title price location featuredImage type status'
    })
    .populate({
      path: 'user',
      select: 'name email phone'
    });

  if (!booking) {
    return next(new ApiError(404, 'Booking not found'));
  }

  if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new ApiError(403, 'You do not have permission to view this booking'));
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

exports.getAllBookings = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const bookings = await Booking.find(filter)
    .populate({
      path: 'property',
      select: 'title price location'
    })
    .populate({
      path: 'user',
      select: 'name email phone'
    })
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: bookings.length,
    pagination: {
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    },
    data: bookings
  });
});

exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status, adminNotes } = req.body;

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status, adminNotes },
    { new: true, runValidators: true }
  ).populate({
    path: 'property',
    select: 'title price location'
  }).populate({
    path: 'user',
    select: 'name email phone'
  });

  if (!booking) {
    return next(new ApiError(404, 'Booking not found'));
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!booking) {
    return next(new ApiError(404, 'Booking not found'));
  }

  if (booking.status === 'Cancelled' || booking.status === 'Completed') {
    return next(new ApiError(400, `Cannot cancel a booking that is already ${booking.status}`));
  }

  booking.status = 'Cancelled';
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking
  });
});