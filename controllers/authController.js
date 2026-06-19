const User = require('../models/user');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const createTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  user.refreshToken = refreshToken;

  res.status(statusCode).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    },
    tokens: {
      accessToken,
      refreshToken
    }
  });
};

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user'
  });

  createTokenResponse(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +isActive');

  if (!user) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  if (!user.isActive) {
    return next(new ApiError(401, 'Account has been deactivated. Contact support.'));
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ApiError(401, 'Invalid email or password'));
  }

  createTokenResponse(user, 200, res);
});

exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ApiError(400, 'Refresh token is required'));
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return next(new ApiError(401, 'Invalid refresh token'));
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      tokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired refresh token'));
  }
});

exports.logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const user = await User.findOne({ refreshToken }).select('+refreshToken');
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie('refreshToken');

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  res.json({
    success: true,
    data: user
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  res.json({
    success: true,
    data: user
  });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return next(new ApiError(400, 'Current password is incorrect'));
  }

  user.password = newPassword;
  await user.save();

  createTokenResponse(user, 200, res);
});