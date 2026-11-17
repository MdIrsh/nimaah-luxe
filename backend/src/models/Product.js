import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter product title'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    brand: {
      type: String,
      default: 'StyleHub Atelier',
    },
    description: {
      type: String,
      required: [true, 'Please enter description'],
    },
    price: {
      type: Number,
      required: [true, 'Please enter original price'],
      default: 0.0,
    },
    discountedPrice: {
      type: Number,
      default: 0.0,
    },
    category: {
      type: String,
      required: [true, 'Please select category'],
      enum: [
        'Dresses',
        'Tops',
        'Jeans',
        'Sarees',
        'Kurtis',
        'Western Wear',
        'Ethnic Wear',
        'Accessories',
      ],
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    sizes: {
      type: [String],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
      default: ['S', 'M', 'L'],
    },
    colors: [
      {
        name: { type: String, required: true },
        hexCode: { type: String, default: '#000000' },
      },
    ],
    fabric: {
      type: String,
      default: 'Pure Georgette / Silk Blend',
    },
    stockCount: {
      type: Number,
      required: true,
      default: 15,
    },
    ratings: {
      type: Number,
      default: 4.8,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

export const Product = mongoose.model('Product', productSchema);
