import express from 'express';
import {
  getAdminStats,
  getAdminCustomers,
  createAdminCustomer,
  updateAdminCustomer,
  addCustomerNote,
  toggleCustomerStatus,
  deleteAdminCustomer,
} from '../controllers/adminController.js';
import {
  getAdminReviews,
  moderateReviewStatus,
  approveReview,
  rejectReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getAdminStats);

// Customer Management
router.get('/customers', getAdminCustomers);
router.post('/customers', createAdminCustomer);
router.put('/customers/:id', updateAdminCustomer);
router.post('/customers/:id/notes', addCustomerNote);
router.patch('/customers/:id/status', toggleCustomerStatus);
router.delete('/customers/:id', deleteAdminCustomer);

// Admin Reviews Management
router.get('/reviews', getAdminReviews);
router.patch('/reviews/:reviewId/approve', approveReview);
router.patch('/reviews/:reviewId/reject', rejectReview);
router.patch('/reviews/:reviewId/status', moderateReviewStatus);
router.delete('/reviews/:reviewId', deleteReview);

export default router;
