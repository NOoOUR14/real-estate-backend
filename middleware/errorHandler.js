const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(400, message);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue).join(', ');
  const message = `Duplicate value for ${field}. Please use another value.`;
  return new ApiError(400, message);
};

const handleValidationErrorDB = (err) => {
  const messages = Object.values(err.errors).map((el) => el.message).join(', ');
  return new ApiError(400, messages);
};

const handleJWTError = () => new ApiError(401, 'Invalid token. Please log in again.');

const handleJWTExpiredError = () => new ApiError(401, 'Token has expired. Please log in again.');

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  if (env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: err.stack,
      statusCode
    });

    return res.status(statusCode).json({
      success: false,
      status,
      message: error.message,
      stack: err.stack,
      error: err
    });
  }

  if (!error.isOperational) {
    console.error('UNEXPECTED ERROR:', error);
    return res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong. Please try again later.'
    });
  }

  res.status(statusCode).json({
    success: false,
    status,
    message: error.message
  });
};

module.exports = errorHandler;