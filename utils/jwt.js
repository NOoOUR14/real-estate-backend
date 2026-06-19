const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRE,
      issuer: env.JWT_ISSUER
    }
  );
};

const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRE,
      issuer: env.JWT_ISSUER
    }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};