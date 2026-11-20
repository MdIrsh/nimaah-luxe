import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Star,
  CheckCircle2,
  ChevronRight,
  Zap,
  ArrowLeft,
  Ruler,
  X,
  MessageSquare,
  Crown,
  Share2,
  Check,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { productService } from '../services/productService';
import reviewService from '../services/reviewService';
import { getSocket, joinProductRoom, leaveProductRoom } from '../services/socket';
import RatingStars from '../components/reviews/RatingStars';
import RatingSummaryCard from '../components/reviews/RatingSummaryCard';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewModal from '../components/reviews/ReviewModal';
import CustomerPhotosGallery from '../components/reviews/CustomerPhotosGallery';
import ProductShowcase from '../components/product/ProductShowcase';
import ProductHighlights from '../components/product/ProductHighlights';
import ColorSelector from '../components/product/ColorSelector';
import AuthenticityBanner from '../components/product/AuthenticityBanner';
import MobileStickyBar from '../components/product/MobileStickyBar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { getProductImageUrl, handleImageError, FALLBACK_PRODUCT_IMAGE } from '../utils/imageUtils';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isWishlisted, addToWishlist, removeFromWishlist } = useCart();
  const { user } = useAuth();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'overview';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Reviews & Ratings state
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'WITH_PHOTOS' | 'VERIFIED' | 5 | 4 | 3 | 2 | 1
  const [sortBy, setSortBy] = useState('Most Helpful'); // 'Most Helpful' | 'Most Recent' | 'Highest Rating' | 'Lowest Rating'
  const [selectedTopic, setSelectedTopic] = useState('Overall');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [eligibility, setEligibility] = useState({
    hasReviewed: false,
    existingReview: null,
    isVerifiedBuyer: false,
  });

  const selectedRatingFilter = typeof activeFilter === 'number' ? activeFilter : null;

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getProductById(id);
        if (!isMounted) return;
        if (!data) {
          setError('Product not found in catalog.');
          return;
        }
        setProduct(data);

        // Safe image initialization
        if (Array.isArray(data.images) && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }

        // Safe size initialization
        if (Array.isArray(data.sizes) && data.sizes.length > 0) {
          setSelectedSize(data.sizes.includes('M') ? 'M' : data.sizes[0]);
        } else {
          setSelectedSize('M');
        }

        // Safe color initialization
        if (Array.isArray(data.colors) && data.colors.length > 0) {
          const firstCol = data.colors[0];
          setSelectedColor(typeof firstCol === 'string' ? firstCol : firstCol?.name || '');
        } else {
          setSelectedColor('');
        }

        // Related products
        try {
          const all = await productService.getProducts();
          if (isMounted && Array.isArray(all)) {
            const related = all
              .filter((p) => p && p._id !== data._id && p.category === data.category)
              .slice(0, 3);
            setRelatedProducts(related);
          }
        } catch (relErr) {
          console.warn('Could not load related products:', relErr);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        if (isMounted) {
          setError(err.response?.data?.message || 'Product not found or momentarily unavailable.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    if (initialTab === 'reviews') {
      setTimeout(() => {
        const el = document.getElementById('product-reviews-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return () => {
      isMounted = false;
    };
  }, [id, initialTab]);

  // Fetch reviews & rating summary
  const fetchReviews = useCallback(async (starFilter = selectedRatingFilter) => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const params = {};
      if (starFilter) params.rating = starFilter;
      const data = await reviewService.getProductReviews(id, params);
      if (data) {
        setReviews(data.reviews || []);
        if (data.summary) {
          setRatingSummary(data.summary);
          setProduct((prev) =>
            prev
              ? {
                ...prev,
                ratings: data.summary.averageRating,
                numReviews: data.summary.totalReviews,
              }
              : prev
          );
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [id, selectedRatingFilter]);

  // Check user review eligibility
  useEffect(() => {
    const checkUserEligibility = async () => {
      if (user && id) {
        try {
          const res = await reviewService.checkEligibility(id);
          if (res) {
            setEligibility({
              hasReviewed: Boolean(res.hasReviewed),
              existingReview: res.existingReview || null,
              isVerifiedBuyer: Boolean(res.isVerifiedBuyer),
            });
          }
        } catch { }
      }
    };
    checkUserEligibility();
  }, [user, id]);

  // Load reviews on initial load & rating filter change
  useEffect(() => {
    fetchReviews(selectedRatingFilter);
  }, [fetchReviews, selectedRatingFilter]);

  // Socket.IO real-time subscriptions for instant live updates
  useEffect(() => {
    if (!id) return;

    joinProductRoom(id);
    const socket = getSocket();

    if (socket) {
      const isForThisProduct = (rev) =>
        rev &&
        (rev.product === id ||
          rev.product?._id === id ||
          rev.productId === id ||
          rev.productId?._id === id);

      const onReviewCreated = (data) => {
        if (data?.review && isForThisProduct(data.review)) {
          setReviews((prev) => [data.review, ...prev.filter((r) => r._id !== data.review._id)]);
          if (data.productRating) {
            setRatingSummary(data.productRating);
            setProduct((prev) =>
              prev
                ? {
                  ...prev,
                  ratings: data.productRating.averageRating,
                  numReviews: data.productRating.totalReviews,
                }
                : prev
            );
          }
        }
      };

      const onReviewUpdated = (data) => {
        if (data?.review && isForThisProduct(data.review)) {
          setReviews((prev) =>
            prev.map((r) => (r._id === data.review._id ? data.review : r))
          );
          if (data.productRating) {
            setRatingSummary(data.productRating);
            setProduct((prev) =>
              prev
                ? {
                  ...prev,
                  ratings: data.productRating.averageRating,
                  numReviews: data.productRating.totalReviews,
                }
                : prev
            );
          }
        }
      };

      const onReviewDeleted = (data) => {
        if (data?.productId === id || data?.product === id) {
          setReviews((prev) => prev.filter((r) => r._id !== data.reviewId));
          if (data.productRating) {
            setRatingSummary(data.productRating);
            setProduct((prev) =>
              prev
                ? {
                  ...prev,
                  ratings: data.productRating.averageRating,
                  numReviews: data.productRating.totalReviews,
                }
                : prev
            );
          }
        }
      };

      const onRatingUpdated = (data) => {
        if (data?.productId === id || data?.product === id) {
          setRatingSummary(data);
          setProduct((prev) =>
            prev
              ? {
                ...prev,
                ratings: data.averageRating,
                numReviews: data.totalReviews,
              }
              : prev
          );
        }
      };

      socket.on('review:created', onReviewCreated);
      socket.on('review:updated', onReviewUpdated);
      socket.on('review:deleted', onReviewDeleted);
      socket.on('product:ratingUpdated', onRatingUpdated);

      return () => {
        leaveProductRoom(id);
        socket.off('review:created', onReviewCreated);
        socket.off('review:updated', onReviewUpdated);
        socket.off('review:deleted', onReviewDeleted);
        socket.off('product:ratingUpdated', onRatingUpdated);
      };
    }
  }, [id]);

  const handleOpenWriteReview = () => {
    setEditingReview(eligibility.existingReview || null);
    setIsReviewModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    let result = null;
    if (editingReview) {
      result = await reviewService.updateReview(editingReview._id, formData);
    } else {
      result = await reviewService.createReview(id, formData);
    }

    // Instant local state update for zero-latency live display
    if (result?.review) {
      setReviews((prev) => [
        result.review,
        ...prev.filter((r) => r._id !== result.review._id),
      ]);
      if (result.productRating) {
        setRatingSummary(result.productRating);
        setProduct((prev) =>
          prev
            ? {
                ...prev,
                ratings: result.productRating.averageRating,
                numReviews: result.productRating.totalReviews,
              }
            : prev
        );
      }
    }

    // Fetch synchronized backend state
    fetchReviews();
    if (user && id) {
      try {
        const res = await reviewService.checkEligibility(id);
        if (res) {
          setEligibility({
            hasReviewed: Boolean(res.hasReviewed),
            existingReview: res.existingReview || null,
            isVerifiedBuyer: Boolean(res.isVerifiedBuyer),
          });
        }
      } catch {}
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you wish to withdraw your review?')) {
      try {
        await reviewService.deleteReview(reviewId);
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        setEligibility((prev) => ({ ...prev, hasReviewed: false, existingReview: null }));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center bg-gradient-to-b from-[#F0F7FF] via-white to-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-bold text-lg text-[#0B192C]">Loading Product Experience...</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white border border-blue-100 p-8 sm:p-10 text-center space-y-5 shadow-xl rounded-3xl">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#2563EB]">
            <Crown size={22} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl text-[#0B192C] font-black">
              Product Not Found
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
              {error || 'This item may have been retired or is momentarily unavailable.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="px-6 py-3 bg-[#0B192C] hover:bg-[#1E3A8A] text-white text-xs uppercase tracking-wider font-bold transition rounded-2xl shadow-sm"
            >
              Explore Catalog
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-white border-2 border-slate-200 text-[#0B192C] text-xs uppercase tracking-wider font-bold transition rounded-2xl"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculations
  const safePrice = Number(product.price || 0);
  const safeDiscountedPrice = Number(product.discountedPrice || 0);
  const isPrivilegeOffer = safeDiscountedPrice > 0 && safePrice > 0 && safeDiscountedPrice < safePrice;
  const currentPrice = isPrivilegeOffer ? safeDiscountedPrice : safePrice;
  const discountPercent = isPrivilegeOffer
    ? Math.round(((safePrice - safeDiscountedPrice) / safePrice) * 100)
    : null;

  // Robust rating and review calculations (dynamically derived from database reviews if summary pending)
  const activeSummary = useMemo(() => {
    if (ratingSummary && Number(ratingSummary.totalReviews) > 0) {
      return ratingSummary;
    }
    if (reviews && reviews.length > 0) {
      const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let sum = 0;
      reviews.forEach((r) => {
        const star = Math.max(1, Math.min(5, Math.round(Number(r.rating || 5))));
        dist[star] = (dist[star] || 0) + 1;
        sum += star;
      });
      const avg = Math.round((sum / reviews.length) * 10) / 10;
      const pcts = {};
      for (let s = 1; s <= 5; s++) {
        pcts[s] = Math.round((dist[s] / reviews.length) * 100);
      }
      return {
        averageRating: avg,
        totalReviews: reviews.length,
        ratingDistribution: dist,
        ratingPercentages: pcts,
      };
    }
    return (
      ratingSummary || {
        averageRating: Number(product.ratings || product.averageRating || 0),
        totalReviews: Number(product.numReviews || product.totalReviews || 0),
        ratingDistribution: product.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        ratingPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    );
  }, [ratingSummary, reviews, product]);

  const totalReviewsCount = Number(activeSummary.totalReviews || 0);
  const rawRating = Number(activeSummary.averageRating || 0);
  const hasReviews = totalReviewsCount > 0 && rawRating > 0;
  const safeRatingDisplay = hasReviews ? rawRating.toFixed(1) : '0.0';

  const productImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean).map(getProductImageUrl)
      : [FALLBACK_PRODUCT_IMAGE];
  const displayImage = getProductImageUrl(selectedImage) || productImages[0];

  const productColors = Array.isArray(product.colors) ? product.colors : [];
  const availableSizes =
    Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : [];

  const stockCount = Number(product.stockCount || 0);
  const isFavorited = isWishlisted(product._id);
  const brandName = product.brand || "Ni'maah Luxe";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F7FF]/50 via-white to-[#F0F7FF]/30 pb-28 sm:pb-20">
      {/* Top Header & Breadcrumb Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="flex items-center justify-between border-b border-blue-100/60 pb-3">
          {/* Brand Logo & Breadcrumb */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <Link
              to="/shop"
              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition shadow-2xs"
              title="Back to Catalog"
            >
              <ArrowLeft size={16} />
            </Link>

            <span className="text-xl sm:text-2xl font-black text-[#0B192C] tracking-tight lowercase">
              {brandName.toLowerCase()}
            </span>

            <span className="text-slate-300">|</span>

            <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Link to="/" className="hover:text-blue-600 transition">Home</Link>
              <ChevronRight size={12} />
              <Link to={`/shop?category=${encodeURIComponent(product.category || 'All')}`} className="hover:text-blue-600 transition">
                {product.category || 'Luxury'}
              </Link>
              <ChevronRight size={12} />
              <span className="text-[#0B192C] font-bold truncate max-w-[140px] sm:max-w-xs">
                {product.title}
              </span>
            </nav>
          </div>

          {/* Quick Close / Return Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition shadow-2xs cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Showcase & Right Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: 3D Pedestal Showcase + Thumbnails */}
          <div className="lg:col-span-6 xl:col-span-6">
            <ProductShowcase
              images={productImages}
              selectedImage={displayImage}
              onSelectImage={setSelectedImage}
              productTitle={product.title}
              isBestSeller={product.isBestSeller ?? true}
              discountPercent={discountPercent}
            />
          </div>

          {/* Right Column: Modern Product Specs & Buy CTA */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-5 sm:space-y-6">
            {/* Brand Verification Badge */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EBF3FE] text-[#1D4ED8] font-bold text-xs border border-blue-100 shadow-2xs">
                <span>{brandName}</span>
                <CheckCircle2 size={13} className="text-blue-600 fill-blue-600 text-white" />
              </div>

              {stockCount > 0 ? (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <PackageCheck size={13} />
                  <span>In Stock</span>
                </span>
              ) : (
                <span className="text-amber-700 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-full">
                  Pre-order Dispatch
                </span>
              )}
            </div>

            {/* Product Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B192C] tracking-tight leading-tight">
                {product.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium">
                {product.subtitle || product.tagline || (product.fabric ? `${product.fabric} • Handcrafted Luxury` : 'Handcrafted Luxury • Premium Quality')}
              </p>
            </div>

            {/* Rating & Reviews Jump Link (Click scrolls to reviews) */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('product-reviews-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 group cursor-pointer pt-0.5"
              title="Click to view live customer ratings & reviews"
            >
              <div className="bg-[#15803D] text-white text-xs font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                <span>★</span>
                <span>{safeRatingDisplay}</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600 font-bold group-hover:text-blue-600 transition">
                {totalReviewsCount > 0
                  ? `(${totalReviewsCount.toLocaleString('en-IN')}+ Ratings)`
                  : '(Be the first to rate)'}
              </span>
              <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
            </button>

            {/* Attractive Price & Discount Row */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-[#0B192C]">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {isPrivilegeOffer && (
                  <span className="text-lg text-slate-400 line-through font-normal">
                    ₹{safePrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent && (
                  <span className="bg-[#DCFCE7] text-[#15803D] font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Free Delivery Tag */}
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#16A34A]">
                <Zap size={14} className="fill-amber-400 text-amber-500 flex-shrink-0" />
                <span>Free Delivery</span>
                <span className="text-slate-400 font-normal ml-2 hidden sm:inline">
                  • Dispatched directly from atelier
                </span>
              </div>
            </div>

            {/* Product Highlights 3-Card Grid */}
            <ProductHighlights category={product.category} customHighlights={product.highlights} />

            {/* Interactive Color Selection */}
            {productColors.length > 0 && (
              <ColorSelector
                colors={productColors}
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
              />
            )}

            {/* Dress Size Selector (for apparel garments) */}
            {availableSizes.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0B192C]">
                    Select Size: <span className="font-normal text-slate-500">{selectedSize}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Ruler size={13} />
                    <span>Size Guide Chart</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-12 py-2 px-3 text-xs font-bold rounded-xl border transition ${selectedSize === sz
                        ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'
                        }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 100% Authentic Products & Brand Warranty Banner */}
            <AuthenticityBanner brand={brandName} />

            {/* Action Buttons: Separate Wishlist & Add to Cart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
              <button
                type="button"
                onClick={() => (isFavorited ? removeFromWishlist(product._id) : addToWishlist(product))}
                className="w-full py-4 rounded-2xl border-2 border-[#0B192C] bg-white hover:bg-slate-50 text-[#0B192C] font-bold text-sm transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <Heart
                  size={18}
                  fill={isFavorited ? '#EF4444' : 'none'}
                  color={isFavorited ? '#EF4444' : '#0B192C'}
                />
                <span>{isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl bg-[#0B192C] hover:bg-[#1E3A8A] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <ShoppingCart size={18} />
                <span>{addedSuccess ? 'Added to Bag ✓' : 'Add to Cart'}</span>
              </button>
            </div>

            {/* Added Success Banner */}
            {addedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600" />
                  Item successfully added to your shopping bag!
                </span>
                <Link to="/cart" className="underline hover:text-emerald-950">
                  View Bag →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SCROLL-DOWN SECTION: FLIPKART STYLE LIVE RATINGS & REVIEWS */}
      {/* ======================================================== */}
      <div id="product-reviews-section" className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 space-y-6">
        {/* Header: Back Arrow & All Reviews Title */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-slate-800 hover:text-blue-600 transition cursor-pointer"
              title="Back to Product Showcase"
            >
              <ArrowLeft size={20} strokeWidth={2.4} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              All Reviews
            </h2>
          </div>

          <button
            type="button"
            onClick={handleOpenWriteReview}
            className="px-4 py-2 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Star size={13} className="fill-blue-600 text-blue-600" />
            <span>{eligibility.hasReviewed ? 'Edit Review' : 'Rate Product'}</span>
          </button>
        </div>

        {/* Feature / Topic Filter Chips Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['Overall', 'Fabric & Weave', 'Fit & Silhouette', 'Craftsmanship'].map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${selectedTopic === topic
                ? 'bg-[#EBF3FE] text-[#1D4ED8] border border-blue-500 font-bold shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Rating Breakdown: Green Stars & Total Count (Left) vs 5★-1★ Green Bars (Right) */}
        <RatingSummaryCard
          summary={activeSummary}
          selectedRatingFilter={typeof activeFilter === 'number' ? activeFilter : null}
          onSelectRatingFilter={(star) => setActiveFilter(activeFilter === star ? 'ALL' : star)}
          onOpenWriteReview={handleOpenWriteReview}
          canReview={true}
          hasReviewed={eligibility.hasReviewed}
          isVerifiedBuyer={eligibility.isVerifiedBuyer}
          brand={brandName}
        />

        {/* Customer Uploaded Photos Row (Square Thumbnails Strip) */}
        <div className="space-y-1.5 pt-1">
          <CustomerPhotosGallery
            reviews={reviews}
            onFilterWithPhotos={() => setActiveFilter('WITH_PHOTOS')}
          />
        </div>

        {/* Interactive Customer Review Filters */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filter Reviews
            </span>
            {activeFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'ALL', label: 'All Reviews' },
              { id: 'WITH_PHOTOS', label: '📷 With Photos' },
              { id: 'VERIFIED', label: '✓ Verified Purchases' },
              { id: 5, label: '5 Star ★' },
              { id: 4, label: '4 Star ★' },
              { id: 3, label: '3 Star ★' },
              { id: 2, label: '2 Star ★' },
              { id: 1, label: '1 Star ★' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${activeFilter === f.id
                  ? 'bg-[#EBF3FE] text-[#1D4ED8] border border-blue-500 font-bold shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Reviews Sorted By Filter Section */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-900">User reviews sorted by</h4>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['Most Helpful', 'Most Recent', 'Highest Rating', 'Lowest Rating'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSortBy(opt)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${sortBy === opt
                  ? 'bg-[#EBF3FE] text-[#1D4ED8] border border-blue-500 font-bold shadow-2xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Sorted Flipkart Review Cards List */}
        <div className="divide-y divide-slate-200/90 pt-1">
          {(() => {
            // Strictly real database reviews only (No mock / dummy data)
            let filtered = [...reviews];

            if (activeFilter === 'WITH_PHOTOS') {
              filtered = filtered.filter((r) => {
                const imgs =
                  (Array.isArray(r.uploadedImages) && r.uploadedImages.length > 0)
                    ? r.uploadedImages
                    : (Array.isArray(r.reviewImages) && r.reviewImages.length > 0)
                    ? r.reviewImages
                    : (Array.isArray(r.images) ? r.images : []);
                return (
                  imgs.filter(
                    (img) => img && typeof img === 'string' && !img.includes('unsplash.com')
                  ).length > 0
                );
              });
            } else if (activeFilter === 'VERIFIED') {
              filtered = filtered.filter(
                (r) => Boolean(r.verifiedPurchase || r.isVerifiedPurchase)
              );
            } else if (typeof activeFilter === 'number') {
              filtered = filtered.filter(
                (r) => Math.round(Number(r.rating || 0)) === activeFilter
              );
            }

            // Sort reviews
            if (sortBy === 'Most Recent') {
              filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } else if (sortBy === 'Highest Rating') {
              filtered.sort((a, b) => b.rating - a.rating);
            } else if (sortBy === 'Lowest Rating') {
              filtered.sort((a, b) => a.rating - b.rating);
            } else {
              // Most Helpful
              filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
            }

            if (filtered.length === 0) {
              return (
                <div className="py-12 text-center space-y-3 bg-white rounded-2xl border border-slate-100 p-8 shadow-2xs">
                  <Star size={36} className="mx-auto text-slate-300" strokeWidth={1.5} />
                  <h4 className="text-base font-bold text-slate-900">
                    {activeFilter !== 'ALL'
                      ? 'No reviews match the selected filter.'
                      : 'No customer reviews recorded yet.'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {activeFilter !== 'ALL'
                      ? 'Try clearing the filter to see all patron reviews.'
                      : 'Be the first patron to share your experience and upload photos of this piece.'}
                  </p>
                  <div className="pt-1 flex items-center justify-center gap-3">
                    {activeFilter !== 'ALL' ? (
                      <button
                        type="button"
                        onClick={() => setActiveFilter('ALL')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleOpenWriteReview}
                        className="px-5 py-2.5 bg-[#0B192C] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                      >
                        Write First Review
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return filtered.map((rev) => (
              <ReviewCard
                key={rev._id}
                review={rev}
                currentUserId={user?._id}
                isAdmin={user?.role === 'admin'}
                onEdit={() => {
                  setEditingReview(rev);
                  setIsReviewModalOpen(true);
                }}
                onDelete={handleDeleteReview}
              />
            ));
          })()}
        </div>

        {/* Product Story & Specifications Card */}
        <div className="bg-white border border-blue-100 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xs">
          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold text-blue-600 tracking-wider">
              Product Specifications
            </span>
            <h3 className="text-xl font-black text-[#0B192C]">
              About This Silhouette & Craftsmanship
            </h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {product.description}
          </p>
          {product.fabric && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-600 border-t border-slate-100">
              <div>
                <strong className="text-[#0B192C]">Fabric & Composition:</strong> {product.fabric}
              </div>
              <div>
                <strong className="text-[#0B192C]">Care Instructions:</strong> Specialized dry clean / Store in protective cover
              </div>
            </div>
          )}
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-6 sm:pt-8 border-t border-blue-100">
            <div className="mb-8 space-y-1">
              <span className="text-xs uppercase font-black tracking-wider text-blue-600">
                You May Also Admire
              </span>
              <h2 className="text-2xl font-black text-[#0B192C]">Related Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Only Sticky Buy Now / Add to Cart Bar */}
      <MobileStickyBar
        price={currentPrice}
        originalPrice={safePrice}
        discountPercent={discountPercent}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isFavorited={isFavorited}
        onToggleWishlist={() => (isFavorited ? removeFromWishlist(product._id) : addToWishlist(product))}
        addedSuccess={addedSuccess}
      />

      {/* Interactive Size Guide Modal */}
      {isSizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="bg-white border border-blue-100 max-w-xl w-full p-6 sm:p-8 space-y-5 rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs uppercase font-extrabold text-blue-600 tracking-wider">
                  Sizing Guide
                </span>
                <h3 className="text-xl font-black text-[#0B192C]">
                  Size Measurement Chart (Inches)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[#0B192C] font-bold">
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Bust</th>
                    <th className="py-2.5 px-3">Waist</th>
                    <th className="py-2.5 px-3">Hips</th>
                    <th className="py-2.5 px-3">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { size: 'XS', bust: '32"', waist: '25"', hips: '35"', length: '54"' },
                    { size: 'S', bust: '34"', waist: '27"', hips: '37"', length: '55"' },
                    { size: 'M', bust: '36"', waist: '29"', hips: '39"', length: '56"' },
                    { size: 'L', bust: '38"', waist: '31"', hips: '41"', length: '57"' },
                    { size: 'XL', bust: '40"', waist: '33"', hips: '43"', length: '58"' },
                    { size: 'XXL', bust: '42"', waist: '36"', hips: '46"', length: '59"' },
                  ].map((row) => (
                    <tr
                      key={row.size}
                      onClick={() => {
                        if (availableSizes.includes(row.size)) {
                          setSelectedSize(row.size);
                          setIsSizeGuideOpen(false);
                        }
                      }}
                      className={`cursor-pointer transition ${selectedSize === row.size
                        ? 'bg-blue-50 font-bold text-blue-700'
                        : 'hover:bg-slate-50 text-slate-600'
                        }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-[#0B192C]">{row.size}</td>
                      <td className="py-2.5 px-3">{row.bust}</td>
                      <td className="py-2.5 px-3">{row.waist}</td>
                      <td className="py-2.5 px-3">{row.hips}</td>
                      <td className="py-2.5 px-3">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              Click any row above to select that size immediately.
            </p>
          </div>
        </div>
      )}

      {/* Real-time Review Creation & Edit Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleModalSubmit}
        existingReview={editingReview}
        productTitle={product.title}
        productImage={
          (displayImage && !displayImage.includes('unsplash.com'))
            ? displayImage
            : (product.images?.[0] && !product.images[0].includes('unsplash.com'))
            ? product.images[0]
            : ''
        }
        productBrand={brandName}
        isVerifiedBuyer={eligibility.isVerifiedBuyer}
      />
    </div>
  );
};

export default ProductDetailPage;
