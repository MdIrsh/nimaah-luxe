import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a star rating between 1 and 5'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    reviewTitle: {
      type: String,
      trim: true,
      maxlength: [150, 'Review title cannot exceed 150 characters'],
      default: '',
    },
    reviewText: {
      type: String,
      required: [true, 'Please share your review thoughts'],
      trim: true,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
    },
    reviewImages: [
      {
        type: String,
        trim: true,
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    unhelpfulCount: {
      type: Number,
      default: 0,
    },
    unhelpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isReported: {
      type: Boolean,
      default: false,
      index: true,
    },
    reportReason: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED', // Instant live review display, with Admin moderation controls
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field aliases for convenience and full specification compatibility
reviewSchema.virtual('userId').get(function () {
  return this.user;
});
reviewSchema.virtual('productId').get(function () {
  return this.product;
});
reviewSchema.virtual('orderId').get(function () {
  return this.order;
});
reviewSchema.virtual('title').get(function () {
  return this.reviewTitle;
});
reviewSchema.virtual('comment').get(function () {
  return this.reviewText;
});
reviewSchema.virtual('images').get(function () {
  return this.reviewImages;
});
reviewSchema.virtual('verifiedPurchase').get(function () {
  return this.isVerifiedPurchase;
});

// Ensure a customer cannot submit duplicate reviews for the same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
