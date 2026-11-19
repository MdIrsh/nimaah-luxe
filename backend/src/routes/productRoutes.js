import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedSampleProducts,
} from '../controllers/productController.js';
import {
  createReview,
  getProductReviews,
  getProductRatingSummary,
  checkReviewEligibility,
} from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, adminOnly, createProduct);
router.post('/seed', protect, adminOnly, seedSampleProducts);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

// Reviews & Ratings for products
router
  .route('/:productId/reviews')
  .post(protect, createReview)
  .get(getProductReviews);

router.get('/:productId/rating', getProductRatingSummary);
router.get('/:productId/eligibility', protect, checkReviewEligibility);

export default router;
