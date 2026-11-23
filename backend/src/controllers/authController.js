import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Register a new customer account
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, 'An account already exists with this email address', 400);
    }

    // Security Rule: Registrations are strictly assigned the 'customer' role.
    // Administrative accounts can only be created via secure backend seeding / admin promotion.
    const user = await User.create({
      name,
      email,
      password,
      role: 'customer',
    });

    return successResponse(
      res,
      'User registered successfully',
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id),
      },
      201
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Helper for resilient password comparison (handles case variations from mobile keyboards and zero-width spaces)
const verifyPasswordResilient = async (user, rawPassword) => {
  if (!user || !rawPassword) return false;
  const clean = String(rawPassword).trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  if (await user.comparePassword(clean)) return true;
  if (clean.toLowerCase() !== clean && (await user.comparePassword(clean.toLowerCase()))) {
    return true;
  }
  return false;
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

    if (!cleanEmail || !cleanPassword) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user || !(await verifyPasswordResilient(user, cleanPassword))) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Safely update lastLogin without triggering document pre-save hooks
    await User.findByIdAndUpdate(user._id, {
      $set: { lastLoginAt: new Date() },
      $inc: { loginCount: 1 },
    });

    return successResponse(res, 'Login successful', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
      lastLoginAt: new Date(),
      loginCount: (user.loginCount || 0) + 1,
      token: generateToken(user._id),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, 'Profile retrieved', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.name = req.body.name || user.name;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    return successResponse(res, 'Profile updated successfully', {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      addresses: updatedUser.addresses,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Admin specific login (validates credentials and asserts admin role)
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim().replace(/[\u200B-\u200D\uFEFF]/g, '');

    if (!cleanEmail || !cleanPassword) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid administrator email or password', 401);
    }

    const isMatch = await verifyPasswordResilient(user, cleanPassword);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return errorResponse(res, 'Access denied: Administrative privileges required', 403);
    }

    // Safely update without triggering pre-save hooks
    await User.findByIdAndUpdate(user._id, {
      $set: { lastLoginAt: new Date() },
      $inc: { loginCount: 1 },
    });

    return successResponse(res, 'Admin authenticated successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
