import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderTracking,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, adminOnly, getAllOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/tracking').get(protect, getOrderTracking);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/status').put(protect, adminOnly, updateOrderStatus);

export default router;
