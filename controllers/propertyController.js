const Property = require('../models/property');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const paginationHelper = require('../utils/paginationHelper');

exports.getProperties = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };

  const removeFields = ['select', 'sort', 'page', 'limit', 'keyword'];
  removeFields.forEach((param) => delete reqQuery[param]);

  if (req.query.keyword) {
    reqQuery.$or = [
      { title: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } },
      { location: { $regex: req.query.keyword, $options: 'i' } }
    ];
  }

  Object.keys(reqQuery).forEach((key) => {
    if (reqQuery[key] === '') {
      delete reqQuery[key];
    }
  });

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|nin|eq|ne)\b/g, (match) => `$${match}`);

  let query = Property.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  const { page, limit, skip } = paginationHelper(req.query);
  query = query.skip(skip).limit(limit);

  const properties = await query;
  const total = await Property.countDocuments(JSON.parse(queryStr));

  res.status(200).json({
    success: true,
    count: properties.length,
    pagination: {
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    },
    data: properties
  });
});

exports.getProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id).populate({
    path: 'reviews.user',
    select: 'name email'
  }).populate({
    path: 'listedBy',
    select: 'name email phone'
  });

  if (!property) {
    return next(new ApiError(404, 'Property not found'));
  }

  res.status(200).json({
    success: true,
    data: property
  });
});

exports.createProperty = asyncHandler(async (req, res, next) => {
  const propertyData = {
    ...req.body,
    listedBy: req.user._id
  };

  if (req.file) {
    propertyData.featuredImage = req.file.filename;
  }

  if (req.files && req.files.length > 0) {
    propertyData.images = req.files.map((file) => file.filename);
  }

  const property = await Property.create(propertyData);

  res.status(201).json({
    success: true,
    data: property
  });
});

exports.updateProperty = asyncHandler(async (req, res, next) => {
  let property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ApiError(404, 'Property not found'));
  }

  if (req.file) {
    req.body.featuredImage = req.file.filename;
  }

  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((file) => file.filename);
  }

  property = await Property.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: property
  });
});

exports.deleteProperty = asyncHandler(async (req, res, next) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ApiError(404, 'Property not found'));
  }

  await property.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Property removed successfully'
  });
});

exports.addReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;

  const property = await Property.findById(req.params.id);

  if (!property) {
    return next(new ApiError(404, 'Property not found'));
  }

  const alreadyReviewed = property.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return next(new ApiError(400, 'You have already reviewed this property'));
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    user: req.user._id
  };

  property.reviews.push(review);

  property.numReviews = property.reviews.length;
  property.rating = property.reviews.reduce((acc, item) => item.rating + acc, 0) / property.reviews.length;

  await property.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: {
      rating: property.rating,
      numReviews: property.numReviews
    }
  });
});

exports.getFeaturedProperties = asyncHandler(async (req, res, next) => {
  const properties = await Property.find({ isFeatured: true, status: 'available' })
    .sort('-createdAt')
    .limit(8);

  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties
  });
});