import express from 'express';
import {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.route('/profile').get(protect, getProfile).put(protect, updateProfile);

export default router;
