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
 * Optional Authentication Middleware:
 * If a valid Bearer token is attached, attaches req.user.
 * If no token is provided or invalid, proceeds gracefully with req.user = null.
 */
export const protectOptional = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecret_nimaah_luxe_jwt_key_2026'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // Graceful fallback to guest session
      req.user = null;
    }
  } else {
    req.user = null;
  }
  return next();
};

/**
 * Role-Based Access Control Middleware Generator
 * Ensures req.user holds one of the authorized roles.
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Authentication token required',
      });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedRoles = roles.map((r) => r.toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

/**
 * AdminOnly middleware: Strictly enforces that req.user holds an ADMIN or SUPER_ADMIN role.
 * Customers and guests are strictly barred with 403 Forbidden.
 */
export const adminOnly = authorizeRoles('admin', 'super_admin');

/**
 * SuperAdminOnly middleware: Strictly enforces that req.user holds a SUPER_ADMIN role.
 */
export const superAdminOnly = authorizeRoles('super_admin');
