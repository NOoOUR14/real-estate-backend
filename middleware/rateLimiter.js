const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || `Too many requests. Please try again later.`
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

const globalLimiter = createRateLimiter(
  env.RATE_LIMIT_WINDOW_MS,
  env.RATE_LIMIT_MAX,
  'Too many requests from this IP. Please try again later.'
);

const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many authentication attempts. Please try again after 15 minutes.'
);

const apiLimiter = createRateLimiter(
  60 * 1000,
  30,
  'Too many API requests. Please slow down.'
);

module.exports = { globalLimiter, authLimiter, apiLimiter };