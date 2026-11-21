import express from 'express';
import { getAdminStats, getAdminCustomers, updateAdminCustomer } from '../controllers/adminController.js';
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
router.get('/customers', getAdminCustomers);
router.put('/customers/:id', updateAdminCustomer);

// Admin Reviews Management
router.get('/reviews', getAdminReviews);
router.patch('/reviews/:reviewId/approve', approveReview);
router.patch('/reviews/:reviewId/reject', rejectReview);
router.patch('/reviews/:reviewId/status', moderateReviewStatus);
router.delete('/reviews/:reviewId', deleteReview);

export default router;
