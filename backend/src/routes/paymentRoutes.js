import express from 'express';
import {
  createOrder,
  verifyAndCreateOrder,
  handlePaymentFailure,
  issueRefund,
  getCustomerPaymentHistory,
  handleWebhook,
} from '../controllers/paymentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer payment endpoints
router.post('/create-order', protect, createOrder);
router.post('/verify-and-order', protect, verifyAndCreateOrder);
router.post('/verify', protect, verifyAndCreateOrder);
router.post('/failure', protect, handlePaymentFailure);
router.get('/history', protect, getCustomerPaymentHistory);

// Admin refund endpoint
router.post('/refund/:orderId', protect, adminOnly, issueRefund);

// Public webhook
router.post('/webhook', handleWebhook);

export default router;
