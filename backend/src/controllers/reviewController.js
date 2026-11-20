import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import '../models/User.js'; // Ensure User model is loaded
import { recalculateProductRating } from '../services/reviewService.js';
import { broadcastReviewEvent } from '../config/socket.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Helper to normalize review object for JSON responses
export const formatReviewResponse = (reviewDoc) => {
  if (!reviewDoc) return null;
  const r = typeof reviewDoc.toObject === 'function' ? reviewDoc.toObject() : { ...reviewDoc };

  const finalTitle = (r.reviewTitle || r.title || '').trim();
  const finalMessage = (r.reviewMessage || r.reviewText || r.comment || '').trim();
  const finalImages =
    (Array.isArray(r.uploadedImages) && r.uploadedImages.length > 0)
      ? r.uploadedImages
      : (Array.isArray(r.reviewImages) && r.reviewImages.length > 0)
      ? r.reviewImages
      : (Array.isArray(r.images) ? r.images : []);

  const isVerified = Boolean(r.verifiedPurchase || r.isVerifiedPurchase);
  const custName = r.customerName || r.user?.name || 'Customer';
  const custAvatar =
    r.user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  return {
    _id: r._id,
    id: r._id,
    productId: r.productId || r.product?._id || r.product,
    product: r.product,
    userId: r.userId || r.user?._id || r.user,
    user: r.user,
    customerName: custName,
    customerAvatar: custAvatar,
    rating: Number(r.rating || 5),
    reviewTitle: finalTitle,
    title: finalTitle,
    reviewMessage: finalMessage,
    reviewText: finalMessage,
    comment: finalMessage,
    uploadedImages: finalImages,
    reviewImages: finalImages,
    images: finalImages,
    verifiedPurchase: isVerified,
    isVerifiedPurchase: isVerified,
    helpfulCount: Number(r.helpfulCount || 0),
    unhelpfulCount: Number(r.unhelpfulCount || 0),
    helpfulUsers: r.helpfulUsers || [],
    unhelpfulUsers: r.unhelpfulUsers || [],
    isReported: Boolean(r.isReported),
    status: r.status || 'APPROVED',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
};

// @desc    Submit a new review for a product (or update existing)
// @route   POST /api/reviews OR POST /api/products/:productId/reviews
// @access  Private (Authenticated Customer)
export const createReview = async (req, res) => {
  try {
    const productId = req.params.productId || req.body.productId;
    const rating = req.body.rating;
    const title = req.body.reviewTitle || req.body.title || '';
    const comment =
      req.body.reviewMessage ||
      req.body.reviewText ||
      req.body.comment ||
      req.body.message ||
      '';
    const images =
      req.body.uploadedImages ||
      req.body.reviewImages ||
      req.body.images ||
      [];

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

    // Clean review images
    const imagesList = Array.isArray(images)
      ? images
          .filter((img) => img && typeof img === 'string')
          .map((s) => s.trim())
          .filter((s) => !s.startsWith('blob:')) // Disallow temporary browser blob URLs
      : [];

    // Verify Purchase: check if customer has a delivered order containing this product
    const deliveredOrder = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      orderStatus: 'Delivered',
    });

    const isVerifiedBuyer = Boolean(deliveredOrder);
    const customerName = req.user.name || req.body.customerName || 'Customer';

    // Check for existing review by the same user
    const existing = await Review.findOne({
      $or: [
        { product: productId, user: req.user._id },
        { productId: productId, userId: req.user._id },
      ],
    });

    let review;
    if (existing) {
      // Update existing review gracefully instead of throwing error
      existing.rating = starRating;
      existing.reviewTitle = title.trim();
      existing.title = title.trim();
      existing.reviewText = comment.trim();
      existing.reviewMessage = comment.trim();
      existing.comment = comment.trim();
      existing.uploadedImages = imagesList;
      existing.reviewImages = imagesList;
      existing.images = imagesList;
      existing.customerName = customerName;
      existing.isVerifiedPurchase = isVerifiedBuyer;
      existing.verifiedPurchase = isVerifiedBuyer;
      existing.status = 'APPROVED';
      await existing.save();
      review = existing;
    } else {
      // Create new review
      review = await Review.create({
        user: req.user._id,
        userId: req.user._id,
        customerName,
        product: productId,
        productId,
        order: deliveredOrder ? deliveredOrder._id : null,
        orderId: deliveredOrder ? deliveredOrder._id : null,
        rating: starRating,
        reviewTitle: title.trim(),
        title: title.trim(),
        reviewText: comment.trim(),
        reviewMessage: comment.trim(),
        comment: comment.trim(),
        reviewImages: imagesList,
        uploadedImages: imagesList,
        images: imagesList,
        isVerifiedPurchase: isVerifiedBuyer,
        verifiedPurchase: isVerifiedBuyer,
        status: 'APPROVED',
        helpfulCount: 0,
        unhelpfulCount: 0,
        helpfulUsers: [],
        unhelpfulUsers: [],
        isReported: false,
      });
    }

    await review.populate('user', 'name email avatar role');

    // Recalculate aggregate ratings
    const productRating = await recalculateProductRating(productId);
    const formattedReview = formatReviewResponse(review);

    // Broadcast real-time Socket.IO events
    broadcastReviewEvent('review:created', {
      review: formattedReview,
      productRating,
    });
    broadcastReviewEvent('product:ratingUpdated', productRating);

    return successResponse(
      res,
      'Review submitted and published successfully',
      { review: formattedReview, productRating },
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
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const starFilter = parseInt(req.query.rating);
    const sort = req.query.sort || 'newest';
    const withPhotos = req.query.withPhotos === 'true';
    const verifiedOnly = req.query.verifiedOnly === 'true';

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return errorResponse(res, 'Valid Product ID is required', 400);
    }

    const objectId = mongoose.Types.ObjectId.isValid(productId)
      ? new mongoose.Types.ObjectId(productId)
      : productId;

    const query = {
      $or: [
        { product: objectId },
        { product: productId.toString() },
        { productId: objectId },
        { productId: productId.toString() },
      ],
      status: { $ne: 'REJECTED' },
    };

    if (starFilter && starFilter >= 1 && starFilter <= 5) {
      query.rating = starFilter;
    }

    if (withPhotos) {
      query.$and = [
        {
          $or: [
            { 'uploadedImages.0': { $exists: true } },
            { 'reviewImages.0': { $exists: true } },
            { 'images.0': { $exists: true } },
          ],
        },
      ];
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
    const rawReviews = await Review.find(query)
      .populate('user', 'name email avatar')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    // Format every review to include all field aliases
    const reviews = rawReviews.map(formatReviewResponse);

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
      review.reviewTitle = newTitle ? newTitle.trim() : '';
    }

    const newText = reviewText !== undefined ? reviewText : comment;
    if (newText !== undefined) {
      if (!newText.trim()) {
        return errorResponse(res, 'Review commentary cannot be empty', 400);
      }
      review.reviewText = newText.trim();
    }

    const newImages = reviewImages !== undefined ? reviewImages : images;
    if (newImages !== undefined && Array.isArray(newImages)) {
      review.reviewImages = newImages.filter((img) => img && typeof img === 'string').map((s) => s.trim());
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
