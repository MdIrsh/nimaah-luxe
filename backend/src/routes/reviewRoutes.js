import express from 'express';
import {
  createReview,
  getProductReviews,
  getProductRatingSummary,
  checkReviewEligibility,
  updateReview,
  deleteReview,
  getAdminReviews,
  moderateReviewStatus,
} from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// General review operations
router
  .route('/:reviewId')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

// Admin moderation endpoints
router.get('/admin', protect, adminOnly, getAdminReviews);
router.patch('/admin/:reviewId/status', protect, adminOnly, moderateReviewStatus);
router.delete('/admin/:reviewId', protect, adminOnly, deleteReview);

export default router;
