import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { recalculateProductRating } from '../services/reviewService.js';
import { broadcastReviewEvent } from '../config/socket.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Submit a new review for a product
// @route   POST /api/products/:productId/reviews
// @access  Private (Authenticated Customer)
export const createReview = async (req, res) => {
  try {
    const productId = req.params.productId || req.body.productId;
    const { rating, reviewText, reviewImages } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(res, 'Valid Product ID is required', 400);
    }

    const starRating = Number(rating);
    if (!starRating || starRating < 1 || starRating > 5) {
      return errorResponse(res, 'Rating must be an integer between 1 and 5', 400);
    }

    if (!reviewText || !reviewText.trim()) {
      return errorResponse(res, 'Review commentary is required', 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Check for duplicate review by the same user
    const existing = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existing) {
      return errorResponse(
        res,
        'You have already shared your impression for this creation. You can edit your existing review.',
        400
      );
    }

    // Verify Purchase: check if customer has a delivered order containing this product
    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      orderStatus: 'Delivered',
    });

    // Clean review images
    const imagesList = Array.isArray(reviewImages)
      ? reviewImages.filter((img) => img && typeof img === 'string').map((s) => s.trim())
      : [];

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: deliveredOrder ? deliveredOrder._id : null,
      rating: starRating,
      reviewText: reviewText.trim(),
      reviewImages: imagesList,
      isVerifiedPurchase: Boolean(deliveredOrder),
      status: 'APPROVED', // Instant live publication with admin moderation power
    });

    await review.populate('user', 'name email avatar role');

    // Recalculate aggregate ratings
    const productRating = await recalculateProductRating(productId);

    // Broadcast real-time Socket.IO events
    broadcastReviewEvent('review:created', {
      review,
      productRating,
    });
    broadcastReviewEvent('product:ratingUpdated', productRating);

    return successResponse(
      res,
      'Your patron review has been recorded with honor',
      { review, productRating },
      201
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get all reviews for a product with pagination & star filter
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const starFilter = parseInt(req.query.rating);
    const sort = req.query.sort || 'newest';

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(res, 'Valid Product ID is required', 400);
    }

    const query = {
      product: productId,
      status: 'APPROVED',
    };

    if (starFilter && starFilter >= 1 && starFilter <= 5) {
      query.rating = starFilter;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'highest') sortOptions = { rating: -1, createdAt: -1 };
    if (sort === 'lowest') sortOptions = { rating: 1, createdAt: -1 };

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'name email avatar')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    // Also fetch fresh product rating summary
    const summary = await recalculateProductRating(productId);

    return successResponse(res, 'Reviews retrieved successfully', {
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        limit,
      },
      summary,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get product rating summary & breakdown
// @route   GET /api/products/:productId/rating
// @access  Public
export const getProductRatingSummary = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(res, 'Valid Product ID is required', 400);
    }

    const summary = await recalculateProductRating(productId);
    return successResponse(res, 'Rating summary retrieved', summary);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Check customer's review eligibility & prior reviews for this product
// @route   GET /api/products/:productId/eligibility
// @access  Private
export const checkReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(res, 'Valid Product ID is required', 400);
    }

    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    }).populate('user', 'name avatar email');

    // Check for delivered order
    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      orderStatus: 'Delivered',
    });

    // Check for any ongoing order
    const anyOrder = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
    });

    return successResponse(res, 'Eligibility checked', {
      hasReviewed: Boolean(existingReview),
      existingReview: existingReview || null,
      isVerifiedBuyer: Boolean(deliveredOrder),
      deliveredOrderId: deliveredOrder ? deliveredOrder._id : null,
      isOrderInTransit: Boolean(anyOrder && !deliveredOrder),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private (Owner or Admin)
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, reviewText, reviewImages } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return errorResponse(res, 'Review not found', 404);
    }

    // Check ownership
    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (!isOwner && !isAdmin) {
      return errorResponse(res, 'Unauthorized to modify this review', 403);
    }

    if (rating !== undefined) {
      const starRating = Number(rating);
      if (starRating < 1 || starRating > 5) {
        return errorResponse(res, 'Rating must be between 1 and 5', 400);
      }
      review.rating = starRating;
    }

    if (reviewText !== undefined) {
      if (!reviewText.trim()) {
        return errorResponse(res, 'Review commentary cannot be empty', 400);
      }
      review.reviewText = reviewText.trim();
    }

    if (reviewImages !== undefined && Array.isArray(reviewImages)) {
      review.reviewImages = reviewImages.filter((img) => img && typeof img === 'string').map((s) => s.trim());
    }

    await review.save();
    await review.populate('user', 'name email avatar');

    const productRating = await recalculateProductRating(review.product);

    // Broadcast real-time Socket.IO event
    broadcastReviewEvent('review:updated', {
      review,
      productRating,
    });
    broadcastReviewEvent('product:ratingUpdated', productRating);

    return successResponse(res, 'Review updated successfully', {
      review,
      productRating,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (Owner or Admin)
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      return errorResponse(res, 'Review not found', 404);
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (!isOwner && !isAdmin) {
      return errorResponse(res, 'Unauthorized to delete this review', 403);
    }

    const productId = review.product;
    await Review.findByIdAndDelete(reviewId);

    const productRating = await recalculateProductRating(productId);

    // Broadcast real-time Socket.IO events
    broadcastReviewEvent('review:deleted', {
      reviewId,
      productId: productId.toString(),
      productRating,
    });
    broadcastReviewEvent('product:ratingUpdated', productRating);

    return successResponse(res, 'Review deleted successfully', {
      reviewId,
      productId,
      productRating,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Admin: List all customer reviews with search, rating filter & moderation
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getAdminReviews = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 15));
    const { search, rating, status, productId } = req.query;

    const query = {};

    if (rating && Number(rating) >= 1 && Number(rating) <= 5) {
      query.rating = Number(rating);
    }

    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      query.product = productId;
    }

    // Populate reviews with user and product details
    let reviews = await Review.find(query)
      .populate('user', 'name email avatar')
      .populate('product', 'title images price category ratings numReviews')
      .sort({ createdAt: -1 });

    // Filter by search query if provided (customer name, email, or product title)
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      reviews = reviews.filter((r) => {
        const uName = r.user?.name?.toLowerCase() || '';
        const uEmail = r.user?.email?.toLowerCase() || '';
        const pTitle = r.product?.title?.toLowerCase() || '';
        const text = r.reviewText?.toLowerCase() || '';
        return (
          uName.includes(s) ||
          uEmail.includes(s) ||
          pTitle.includes(s) ||
          text.includes(s)
        );
      });
    }

    const total = reviews.length;
    const paginated = reviews.slice((page - 1) * limit, page * limit);

    // Global Statistics for Admin Header
    const allReviews = await Review.find({});
    const totalAllReviews = allReviews.length;
    const totalApproved = allReviews.filter((r) => r.status === 'APPROVED').length;
    const totalPending = allReviews.filter((r) => r.status === 'PENDING').length;
    const totalRejected = allReviews.filter((r) => r.status === 'REJECTED').length;
    const verifiedCount = allReviews.filter((r) => r.isVerifiedPurchase).length;

    const avgScore =
      totalApproved > 0
        ? Math.round(
            (allReviews
              .filter((r) => r.status === 'APPROVED')
              .reduce((acc, r) => acc + r.rating, 0) /
              totalApproved) *
              10
          ) / 10
        : 0;

    return successResponse(res, 'Admin reviews list retrieved', {
      reviews: paginated,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        limit,
      },
      stats: {
        totalReviews: totalAllReviews,
        approvedReviews: totalApproved,
        pendingReviews: totalPending,
        rejectedReviews: totalRejected,
        verifiedPurchases: verifiedCount,
        averageRating: avgScore,
      },
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Admin: Moderate review status (Approve / Reject / Pending)
// @route   PATCH /api/admin/reviews/:reviewId/status
// @access  Private/Admin
export const moderateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return errorResponse(
        res,
        'Invalid status. Allowed: PENDING, APPROVED, REJECTED',
        400
      );
    }

    const review = await Review.findById(reviewId)
      .populate('user', 'name email avatar')
      .populate('product', 'title images');

    if (!review) {
      return errorResponse(res, 'Review not found', 404);
    }

    review.status = status.toUpperCase();
    await review.save();

    // Recalculate rating for the product
    const productRating = await recalculateProductRating(review.product._id);

    // Broadcast updates via Socket.IO
    broadcastReviewEvent('review:updated', {
      review,
      productRating,
    });
    broadcastReviewEvent('product:ratingUpdated', productRating);

    return successResponse(
      res,
      `Review status updated to ${review.status}`,
      { review, productRating }
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
