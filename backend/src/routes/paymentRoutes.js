import express from 'express';
import {
  createOrder,
  verifyAndCreateOrder,
  handleWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected user payment routes
router.post('/create-order', protect, createOrder);
router.post('/verify-and-order', protect, verifyAndCreateOrder);

// Public webhook route directly called by Razorpay servers
router.post('/webhook', handleWebhook);

export default router;
