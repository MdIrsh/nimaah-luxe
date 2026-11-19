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
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED', // Approved by default for live instant review display, with Admin moderation controls
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field aliases for convenience
reviewSchema.virtual('userId').get(function () {
  return this.user;
});
reviewSchema.virtual('productId').get(function () {
  return this.product;
});
reviewSchema.virtual('orderId').get(function () {
  return this.order;
});

// Ensure a customer cannot submit duplicate reviews for the same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
