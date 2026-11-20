import express from 'express';
import {
  createReview,
  getProductReviews,
  getProductRatingSummary,
  checkReviewEligibility,
  updateReview,
  deleteReview,
  markHelpful,
  reportReview,
  getAdminReviews,
  moderateReviewStatus,
  approveReview,
  rejectReview,
} from '../controllers/reviewController.js';
import { protect, protectOptional, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public & Customer Routes:
// POST /api/reviews -> Submit a review (authenticated customer or guest)
router.post('/', protectOptional, createReview);

// GET /api/reviews/:productId -> Fetch reviews for product
router.get('/:productId', getProductReviews);

// GET /api/reviews/:productId/rating -> Fetch rating summary
router.get('/:productId/rating', getProductRatingSummary);

// GET /api/reviews/:productId/eligibility -> Check customer review eligibility
router.get('/:productId/eligibility', protect, checkReviewEligibility);

// Single Review operations:
router
  .route('/:reviewId')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

// Helpful feedback & reporting
router.post('/:reviewId/helpful', protect, markHelpful);
router.post('/:reviewId/report', protect, reportReview);

// Admin Moderation Endpoints:
router.get('/admin/all', protect, adminOnly, getAdminReviews);
router.patch('/admin/:reviewId/approve', protect, adminOnly, approveReview);
router.patch('/admin/:reviewId/reject', protect, adminOnly, rejectReview);
router.patch('/admin/:reviewId/status', protect, adminOnly, moderateReviewStatus);
router.delete('/admin/:reviewId', protect, adminOnly, deleteReview);

export default router;
