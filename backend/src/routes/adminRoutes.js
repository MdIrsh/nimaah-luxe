import express from 'express';
import { getAdminStats, getAdminCustomers } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/customers', getAdminCustomers);

export default router;
