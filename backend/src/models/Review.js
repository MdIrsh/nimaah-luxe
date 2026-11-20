import mongoose from 'mongoose';
import './User.js'; // Ensure User model is always registered

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
      default: '',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product'],
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    orderId: {
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
    title: {
      type: String,
      trim: true,
      maxlength: [150, 'Review title cannot exceed 150 characters'],
      default: '',
    },
    reviewText: {
      type: String,
      trim: true,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
      default: '',
    },
    reviewMessage: {
      type: String,
      trim: true,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
      default: '',
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
      default: '',
    },
    reviewImages: [
      {
        type: String,
        trim: true,
      },
    ],
    uploadedImages: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    verifiedPurchase: {
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

// Pre-save middleware to keep field aliases 100% in sync
reviewSchema.pre('save', function (next) {
  if (!this.userId && this.user) this.userId = this.user;
  if (!this.user && this.userId) this.user = this.userId;
  if (!this.productId && this.product) this.productId = this.product;
  if (!this.product && this.productId) this.product = this.productId;
  if (!this.orderId && this.order) this.orderId = this.order;
  if (!this.order && this.orderId) this.order = this.orderId;

  // Title sync
  const finalTitle = (this.reviewTitle || this.title || '').trim();
  this.reviewTitle = finalTitle;
  this.title = finalTitle;

  // Text / Message sync
  const finalText = (this.reviewMessage || this.reviewText || this.comment || '').trim();
  this.reviewMessage = finalText;
  this.reviewText = finalText;
  this.comment = finalText;

  // Images sync
  const finalImages =
    (Array.isArray(this.uploadedImages) && this.uploadedImages.length > 0)
      ? this.uploadedImages
      : (Array.isArray(this.reviewImages) && this.reviewImages.length > 0)
      ? this.reviewImages
      : (Array.isArray(this.images) ? this.images : []);

  this.uploadedImages = finalImages;
  this.reviewImages = finalImages;
  this.images = finalImages;

  // Verified purchase sync
  const isVer = Boolean(this.verifiedPurchase || this.isVerifiedPurchase);
  this.verifiedPurchase = isVer;
  this.isVerifiedPurchase = isVer;

  next();
});

// Virtual field aliases for convenience and full specification compatibility
reviewSchema.virtual('userRef').get(function () {
  return this.user;
});

// Ensure a customer cannot submit duplicate reviews for the same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
