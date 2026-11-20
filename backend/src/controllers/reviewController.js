import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { recalculateProductRating } from '../services/reviewService.js';
import { broadcastReviewEvent } from '../config/socket.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Submit a new review for a product
// @route   POST /api/reviews OR POST /api/products/:productId/reviews
// @access  Public / Private (Authenticated or Guest with Name)
export const createReview = async (req, res) => {
  try {
    const productId = req.params.productId || req.body.productId;
    const rating = req.body.rating;
    const title = req.body.reviewTitle || req.body.title || '';
    const comment = req.body.reviewText || req.body.comment || '';
    const images = req.body.reviewImages || req.body.images || [];
    const customerName = (req.body.customerName || req.body.name || '').trim();

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(res, 'Valid Product ID is required', 400);
    }

    const starRating = Number(rating);
    if (!starRating || starRating < 1 || starRating > 5) {
      return errorResponse(res, 'Rating must be an integer between 1 and 5', 400);
    }

    if (!comment || !comment.trim()) {
      return errorResponse(res, 'Review commentary is required', 400);
    }

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Resolve Review User (Authenticated patron or Guest customer)
    let reviewUserId = req.user?._id;
    let reviewerName = req.user?.name || customerName || 'Verified Patron';

    if (!reviewUserId) {
      // Find or create customer user document for MongoDB referential integrity
      const guestEmail = `customer_${Date.now()}_${Math.floor(Math.random() * 10000)}@nimaahluxe.store`;
      const guestUser = await User.create({
        name: reviewerName,
        email: guestEmail,
        password: 'GuestPassword123!',
        role: 'customer',
        avatar: '',
      });
      reviewUserId = guestUser._id;
    } else {
      // Check for duplicate review by the same authenticated user
      const existing = await Review.findOne({
        product: productId,
        user: req.user._id,
      });

      if (existing) {
        return errorResponse(
          res,
          'You have already shared a review for this product. You can edit your existing review.',
          400
        );
      }
    }

    // Verify Purchase: check if customer has a delivered order containing this product
    let deliveredOrder = null;
    if (req.user) {
      deliveredOrder = await Order.findOne({
        user: req.user._id,
        'orderItems.product': productId,
        orderStatus: 'Delivered',
      });
    }

    // Clean review images
    const imagesList = Array.isArray(images)
      ? images.filter((img) => img && typeof img === 'string').map((s) => s.trim())
      : [];

    const review = await Review.create({
      user: reviewUserId,
      userId: reviewUserId,
      product: productId,
      productId: productId,
      order: deliveredOrder ? deliveredOrder._id : null,
      orderId: deliveredOrder ? deliveredOrder._id : null,
      rating: starRating,
      reviewTitle: title.trim(),
      title: title.trim(),
      reviewText: comment.trim(),
      comment: comment.trim(),
      reviewImages: imagesList,
      images: imagesList,
      isVerifiedPurchase: Boolean(deliveredOrder),
      verifiedPurchase: Boolean(deliveredOrder),
      status: 'APPROVED', // Instant live publication
      helpfulCount: 0,
      unhelpfulCount: 0,
      helpfulUsers: [],
      unhelpfulUsers: [],
      isReported: false,
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
      'Review submitted and published successfully',
      { review, productRating },
      201
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get all reviews for a product with pagination, filters & sorting
// @route   GET /api/reviews/:productId OR GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const starFilter = parseInt(req.query.rating);
    const sort = req.query.sort || 'newest';
    const withPhotos = req.query.withPhotos === 'true';
    const verifiedOnly = req.query.verifiedOnly === 'true';

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

    if (withPhotos) {
      query['reviewImages.0'] = { $exists: true };
    }

    if (verifiedOnly) {
      query.isVerifiedPurchase = true;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'highest') sortOptions = { rating: -1, createdAt: -1 };
    else if (sort === 'lowest') sortOptions = { rating: 1, createdAt: -1 };
    else if (sort === 'helpful') sortOptions = { helpfulCount: -1, createdAt: -1 };
    else sortOptions = { createdAt: -1 }; // newest / recent

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

// @desc    Get individual review by ID
// @route   GET /api/reviews/:reviewId
// @access  Public
export const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return errorResponse(res, 'Valid Review ID is required', 400);
    }

    const review = await Review.findById(reviewId)
      .populate('user', 'name email avatar')
      .populate('product', 'title images price category ratings');

    if (!review) {
      return errorResponse(res, 'Review not found', 404);
    }

    return successResponse(res, 'Review retrieved successfully', review);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Dispatcher: Get review by ID OR product reviews
// @route   GET /api/reviews/:id
// @access  Public
export const getReviewOrProductReviews = async (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return errorResponse(res, 'Valid identifier is required', 400);
  }

  // Check if ID is a product
  const isProduct = await Product.exists({ _id: id });
  if (isProduct) {
    req.params.productId = id;
    return getProductReviews(req, res);
  }

  // Otherwise check if ID is a single review
  const isReview = await Review.exists({ _id: id });
  if (isReview) {
    req.params.reviewId = id;
    return getReviewById(req, res);
  }

  // Fallback to product reviews query
  req.params.productId = id;
  return getProductReviews(req, res);
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
    const { rating, reviewTitle, title, reviewText, comment, reviewImages, images } = req.body;

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

    const newTitle = reviewTitle !== undefined ? reviewTitle : title;
    if (newTitle !== undefined) {
      const cleanTitle = newTitle ? newTitle.trim() : '';
      review.reviewTitle = cleanTitle;
      review.title = cleanTitle;
    }

    const newText = reviewText !== undefined ? reviewText : comment;
    if (newText !== undefined) {
      if (!newText.trim()) {
        return errorResponse(res, 'Review commentary cannot be empty', 400);
      }
      const cleanText = newText.trim();
      review.reviewText = cleanText;
      review.comment = cleanText;
    }

    const newImages = reviewImages !== undefined ? reviewImages : images;
    if (newImages !== undefined && Array.isArray(newImages)) {
      const cleanedImgs = newImages
        .filter((img) => img && typeof img === 'string')
        .map((s) => s.trim());
      review.reviewImages = cleanedImgs;
      review.images = cleanedImgs;
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

// @desc    Mark review as helpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
export const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      return errorResponse(res, 'Review not found', 404);
    }

    const userId = req.user._id;
    const alreadyHelpful = review.helpfulUsers.some((u) => u.toString() === userId.toString());

    if (alreadyHelpful) {
      review.helpfulUsers = review.helpfulUsers.filter((u) => u.toString() !== userId.toString());
      review.helpfulCount = Math.max(0, (review.helpfulCount || 1) - 1);
    } else {
      review.helpfulUsers.push(userId);
      review.helpfulCount = (review.helpfulCount || 0) + 1;
      // Remove from unhelpful if voted
      review.unhelpfulUsers = review.unhelpfulUsers.filter((u) => u.toString() !== userId.toString());
      review.unhelpfulCount = Math.max(0, (review.unhelpfulCount || 0) - 1);
    }

    await review.save();

    return successResponse(res, 'Helpful feedback recorded', {
      helpfulCount: review.helpfulCount,
      unhelpfulCount: review.unhelpfulCount,
      isHelpful: !alreadyHelpful,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Report an inappropriate review
// @route   POST /api/reviews/:reviewId/report
// @access  Private
export const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return errorResponse(res, 'Review not found', 404);
    }

    review.isReported = true;
    review.reportReason = reason || 'Flagged by customer for moderation';
    await review.save();

    return successResponse(res, 'Review reported for administrative evaluation', {
      isReported: true,
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
    const { search, rating, status, productId, reported } = req.query;

    const query = {};

    if (rating && Number(rating) >= 1 && Number(rating) <= 5) {
      query.rating = Number(rating);
    }

    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    if (reported === 'true' || status === 'REPORTED') {
      query.isReported = true;
    }

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      query.product = productId;
    }

    let reviews = await Review.find(query)
      .populate('user', 'name email avatar')
      .populate('product', 'title images price category ratings numReviews')
      .sort({ createdAt: -1 });

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
    const reportedCount = allReviews.filter((r) => r.isReported).length;

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
        reportedReviews: reportedCount,
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
    // If approving, also clear reported status
    if (review.status === 'APPROVED') {
      review.isReported = false;
    }
    await review.save();

    const productRating = await recalculateProductRating(review.product._id);

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

// @desc    Admin: Approve a review
// @route   PATCH /api/admin/reviews/:reviewId/approve
// @access  Private/Admin
export const approveReview = async (req, res) => {
  req.body.status = 'APPROVED';
  return moderateReviewStatus(req, res);
};

// @desc    Admin: Reject a review
// @route   PATCH /api/admin/reviews/:reviewId/reject
// @access  Private/Admin
export const rejectReview = async (req, res) => {
  req.body.status = 'REJECTED';
  return moderateReviewStatus(req, res);
};
