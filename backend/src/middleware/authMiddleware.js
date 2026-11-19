import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Protect middleware: Ensures the request carries a valid JWT authentication token
 * and attaches the authenticated user document to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecret_nimaah_luxe_jwt_key_2026'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: User account no longer exists',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Authentication token expired or invalid',
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Not authorized: Bearer token is required to access this resource',
  });
};

/**
 * AdminOnly middleware: Strictly enforces that req.user holds an ADMIN or SUPER_ADMIN role.
 * Customers and guests are strictly barred with 403 Forbidden.
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: Authentication required',
    });
  }

  const role = (req.user.role || '').toLowerCase();
  if (role !== 'admin' && role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Access denied. Only authorized administrators can access this area.',
    });
  }

  next();
};
