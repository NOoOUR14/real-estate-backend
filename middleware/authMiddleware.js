const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/user');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized, no token provided'));
  }

  try {
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id).select('+passwordChangedAt +isActive');

    if (!user) {
      return next(new ApiError(401, 'User belonging to this token no longer exists'));
    }

    if (!user.isActive) {
      return next(new ApiError(401, 'User account has been deactivated'));
    }

    if (user.isPasswordChangedAfter(decoded.iat)) {
      return next(new ApiError(401, 'Password changed recently. Please log in again'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token has expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token'));
    }
    return next(new ApiError(401, 'Not authorized, token authentication failed'));
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};

module.exports = { protect, authorize };