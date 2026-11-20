import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // Primary & Aliased User identifiers
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

    // Primary & Aliased Product identifiers
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

    // Order reference for verified purchase check
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

    // Star Rating (1 to 5)
    rating: {
      type: Number,
      required: [true, 'Please provide a star rating between 1 and 5'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },

    // Review Title
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

    // Detailed Review Commentary / Message
    reviewText: {
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

    // Customer Uploaded Product Photos (array of permanent image URLs)
    reviewImages: [
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

    // Verified Purchase Badge
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },

    // Helpful & Feedback counts
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

    // Moderation & Status
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
      default: 'APPROVED', // Instant publication with admin moderation power
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save synchronization hook: Guarantees 100% field parity
reviewSchema.pre('save', function (next) {
  // Sync title
  if (this.reviewTitle && !this.title) this.title = this.reviewTitle;
  if (this.title && !this.reviewTitle) this.reviewTitle = this.title;

  // Sync comment / reviewText
  if (this.reviewText && !this.comment) this.comment = this.reviewText;
  if (this.comment && !this.reviewText) this.reviewText = this.comment;

  // Sync images array
  const activeImages =
    (Array.isArray(this.images) && this.images.length > 0)
      ? this.images
      : (Array.isArray(this.reviewImages) && this.reviewImages.length > 0)
      ? this.reviewImages
      : [];

  this.images = activeImages;
  this.reviewImages = activeImages;

  // Sync verified purchase flag
  const isDelivered = Boolean(this.isVerifiedPurchase || this.verifiedPurchase);
  this.isVerifiedPurchase = isDelivered;
  this.verifiedPurchase = isDelivered;

  // Sync IDs
  if (this.user && !this.userId) this.userId = this.user;
  if (this.userId && !this.user) this.user = this.userId;

  if (this.product && !this.productId) this.productId = this.product;
  if (this.productId && !this.product) this.product = this.productId;

  if (this.order && !this.orderId) this.orderId = this.order;
  if (this.orderId && !this.order) this.order = this.orderId;

  next();
});

// Ensure a customer cannot submit duplicate reviews for the same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
export default Review;
