import { User } from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Admin: Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return successResponse(res, 'Users retrieved', users);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Customer: Add shipping address
// @route   POST /api/users/address
// @access  Private
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.addresses.push(req.body);
    await user.save();

    return successResponse(res, 'Address saved successfully', user.addresses);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
