import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get all fashion products with filtering, search & sorting
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { keyword, category, size, color, minPrice, maxPrice, sort, brand } = req.query;

    const query = {};

    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (brand && brand !== 'All') {
      query.brand = brand;
    }

    if (size) {
      query.sizes = size;
    }

    if (color) {
      query['colors.name'] = { $regex: color, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'rating') sortOptions = { ratings: -1 };
    if (sort === 'popular') sortOptions = { numReviews: -1 };

    const products = await Product.find(query).sort(sortOptions);

    return successResponse(res, 'Products fetched successfully', {
      count: products.length,
      products,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    let product;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(req.params.id);
    } else {
      product = await Product.findOne({ slug: req.params.id });
    }

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }
    return successResponse(res, 'Product found', product);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Helper to extract clean direct image URL from Google Images or raw URLs
export const sanitizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // If user pasted a Google Images search result link:
  // e.g. https://www.google.com/imgres?q=...&imgurl=https%3A%2F%2F...
  if (trimmed.includes('google.') && (trimmed.includes('/imgres') || trimmed.includes('imgurl='))) {
    try {
      const parsed = new URL(trimmed);
      const imgurl = parsed.searchParams.get('imgurl');
      if (imgurl) return decodeURIComponent(imgurl);
    } catch {}
  }

  // Handle Google redirect URLs: https://www.google.com/url?url=https%3A%2F%2F...
  if (trimmed.includes('google.') && trimmed.includes('/url?')) {
    try {
      const parsed = new URL(trimmed);
      const targetUrl = parsed.searchParams.get('url') || parsed.searchParams.get('q');
      if (targetUrl) return decodeURIComponent(targetUrl);
    } catch {}
  }

  return trimmed;
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    if (req.body.images && Array.isArray(req.body.images)) {
      req.body.images = req.body.images.map(sanitizeImageUrl);
    }
    const product = new Product(req.body);
    const createdProduct = await product.save();
    return successResponse(res, 'Product created successfully', createdProduct, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    if (req.body.images && Array.isArray(req.body.images)) {
      req.body.images = req.body.images.map(sanitizeImageUrl);
    }

    let product = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    // Fallback: If not found or ID was a demo ID (e.g. 'prod_4'), match by title
    if (!product && req.body.title) {
      product = await Product.findOneAndUpdate(
        { title: new RegExp(`^${req.body.title.trim()}$`, 'i') },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      // If still not found, upsert a new product creation
      if (!product) {
        product = new Product(req.body);
        await product.save();
      }
    }

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    return successResponse(res, 'Product updated successfully', product);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    let product = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findByIdAndDelete(req.params.id);
    } else {
      product = await Product.findOneAndDelete({
        $or: [{ slug: req.params.id }, { title: req.params.id }],
      });
    }

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }
    return successResponse(res, 'Product deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Add review
// @route   POST /api/products/:id/reviews
// @access  Private
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return errorResponse(res, 'Product already reviewed by you', 400);
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    return successResponse(res, 'Review added successfully', product);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// @desc    Seed comprehensive fashion catalog for StyleHub
// @route   POST /api/products/seed
// @access  Public
export const seedSampleProducts = async (req, res) => {
  try {
    await Product.deleteMany({});

    const styleHubCatalog = [
      {
        title: 'Aura Velvet Midnight Evening Gown',
        brand: 'StyleHub Atelier',
        description: 'Handcrafted floor-length luxury velvet evening gown with delicate crystal bead embellishments and an elegant flowing train.',
        price: 18500,
        discountedPrice: 14999,
        category: 'Dresses',
        images: [
          'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Midnight Navy', hexCode: '#0f172a' },
          { name: 'Emerald Velvet', hexCode: '#064e3b' },
          { name: 'Royal Onyx', hexCode: '#18181b' },
        ],
        fabric: 'Imported Royal Velvet & Swarovski Crystals',
        stockCount: 15,
        ratings: 4.9,
        numReviews: 28,
        isFeatured: true,
        isBestSeller: true,
      },
      {
        title: 'Celestial Silk Pleated Midi Dress',
        brand: 'StyleHub Paris',
        description: 'Midi-length silk silhouette featuring sculptural cowl neckline and a softly pleated bodice, tailored for high-end celebrations.',
        price: 12900,
        discountedPrice: 9999,
        category: 'Dresses',
        images: [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['S', 'M', 'L'],
        colors: [
          { name: 'Champagne Gold', hexCode: '#fef08a' },
          { name: 'Rose Quartz', hexCode: '#f43f5e' },
          { name: 'Pearl Ivory', hexCode: '#f8fafc' },
        ],
        fabric: '100% Mulberry Satin Silk',
        stockCount: 20,
        ratings: 4.8,
        numReviews: 19,
        isNewArrival: true,
      },
      {
        title: 'Chantilly Lace Corset Top',
        brand: 'StyleHub Modern',
        description: 'Bespoke boned corset top featuring French Chantilly lace overlays and satin ribbon back closure. Perfect for evening styling.',
        price: 6499,
        discountedPrice: 4999,
        category: 'Tops',
        images: [
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['XS', 'S', 'M', 'L'],
        colors: [
          { name: 'Warm Beige', hexCode: '#E9E1D6' },
          { name: 'Charcoal Black', hexCode: '#29251F' },
        ],
        fabric: 'French Lace & Italian Silk Crepe',
        stockCount: 25,
        ratings: 4.7,
        numReviews: 14,
        isTrending: true,
      },
      {
        title: 'High-Rise Sculpt Wide-Leg Trousers',
        brand: 'StyleHub Luxe',
        description: 'Tailored premium Japanese denim with deep indigo wash, high-rise silhouette and contrast ecru topstitching.',
        price: 7999,
        discountedPrice: 5999,
        category: 'Jeans',
        images: [
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Raw Indigo', hexCode: '#1e3a8a' },
          { name: 'Off-White Ecru', hexCode: '#FAF9F6' },
        ],
        fabric: '100% Organic Selvedge Cotton Denim',
        stockCount: 18,
        ratings: 4.8,
        numReviews: 32,
        isFeatured: true,
      },
      {
        title: 'Varanasi Zari Heritage Silk Saree',
        brand: 'StyleHub Heritage',
        description: 'Authentic handloom Banarasi Katan silk saree woven with antique gold zari bootis and an ornate grand pallu.',
        price: 32000,
        discountedPrice: 26500,
        category: 'Sarees',
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['Free Size'],
        colors: [
          { name: 'Royal Crimson', hexCode: '#881337' },
          { name: 'Mustard Gold', hexCode: '#ca8a04' },
          { name: 'Peacock Teal', hexCode: '#0f766e' },
        ],
        fabric: 'Pure Mulberry Katan Silk & Real Zari',
        stockCount: 8,
        ratings: 5.0,
        numReviews: 42,
        isBestSeller: true,
        isFeatured: true,
      },
      {
        title: 'Kashmiri Tilla Embroidered Anarkali Kurti',
        brand: 'StyleHub Ethnic',
        description: 'Flared silk georgette Kurti embellished with artisanal Kashmiri gold tilla needlework along the neckline and cuffs.',
        price: 14500,
        discountedPrice: 11999,
        category: 'Kurtis',
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Soft Gold', hexCode: '#A68B66' },
          { name: 'Sage Green', hexCode: '#15803d' },
          { name: 'Midnight Charcoal', hexCode: '#29251F' },
        ],
        fabric: 'Viscose Georgette with Pure Santoon Lining',
        stockCount: 14,
        ratings: 4.9,
        numReviews: 21,
        isTrending: true,
      },
      {
        title: 'Tailored Structured Double-Breasted Blazer',
        brand: 'StyleHub Modern',
        description: 'Sharply tailored blazer crafted from tropical Italian wool with peaked lapels and horn buttons. Contemporary power dressing.',
        price: 16900,
        discountedPrice: 13500,
        category: 'Western Wear',
        images: [
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['XS', 'S', 'M', 'L'],
        colors: [
          { name: 'Warm Beige', hexCode: '#E9E1D6' },
          { name: 'Charcoal Black', hexCode: '#29251F' },
        ],
        fabric: 'Super 120s Italian Virgin Wool Blend',
        stockCount: 16,
        ratings: 4.9,
        numReviews: 25,
        isFeatured: true,
        isNewArrival: true,
      },
      {
        title: 'Artisan Quilted Leather Shoulder Bag',
        brand: 'StyleHub Accessories',
        description: 'Supple Italian lambskin leather with geometric quilting, convertible gold chain strap, and signature brushed gold clasp.',
        price: 11500,
        discountedPrice: 8999,
        category: 'Accessories',
        images: [
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['Free Size'],
        colors: [
          { name: 'Classic Black', hexCode: '#000000' },
          { name: 'Alabaster White', hexCode: '#ffffff' },
          { name: 'Soft Gold', hexCode: '#A68B66' },
        ],
        fabric: 'Full-Grain Nappa Leather & 24k Gold-Toned Hardware',
        stockCount: 22,
        ratings: 5.0,
        numReviews: 37,
        isBestSeller: true,
      },
    ];

    const inserted = await Product.insertMany(styleHubCatalog);
    return successResponse(res, 'StyleHub luxury collection seeded', inserted, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
