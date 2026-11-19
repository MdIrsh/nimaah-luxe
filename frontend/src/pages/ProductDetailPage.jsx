import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  Check,
  ChevronRight,
  Crown,
  Ruler,
  X,
  MessageSquare,
} from 'lucide-react';
import { productService, DEMO_PRODUCTS } from '../services/productService';
import reviewService from '../services/reviewService';
import { getSocket, joinProductRoom, leaveProductRoom } from '../services/socket';
import RatingStars from '../components/reviews/RatingStars';
import RatingSummaryCard from '../components/reviews/RatingSummaryCard';
import ReviewCard from '../components/reviews/ReviewCard';
import ReviewModal from '../components/reviews/ReviewModal';
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
  const initialTab = searchParams.get('tab') || 'description';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Reviews & Ratings state
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [eligibility, setEligibility] = useState({
    hasReviewed: false,
    existingReview: null,
    isVerifiedBuyer: false,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getProductById(id);
        if (!isMounted) return;
        if (!data) {
          setError('Product not found in atelier catalog.');
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

        // Related products (defensive)
        try {
          const all = await productService.getProducts();
          if (isMounted && Array.isArray(all)) {
            const related = all
              .filter((p) => p && p._id !== data._id && p.category === data.category)
              .slice(0, 3);
            setRelatedProducts(related);
          }
        } catch (relErr) {
          console.warn('Could not load related silhouettes:', relErr);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        if (isMounted) {
          setError(err.response?.data?.message || 'Silhouette not found or momentarily unavailable.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    if (initialTab === 'reviews') {
      setTimeout(() => {
        const el = document.getElementById('product-tabs-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return () => {
      isMounted = false;
    };
  }, [id, initialTab]);

  // Fetch reviews & rating summary (Hook: Must be at top level before early returns)
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

  // Check buyer eligibility (Hook: Must be at top level before early returns)
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

  // Load reviews on initial load & rating filter change (Hook: Must be at top level)
  useEffect(() => {
    fetchReviews(selectedRatingFilter);
  }, [fetchReviews, selectedRatingFilter]);

  // Socket.IO real-time subscriptions for instant live updates (Hook: Must be at top level)
  useEffect(() => {
    if (!id) return;

    joinProductRoom(id);
    const socket = getSocket();

    if (socket) {
      const onReviewCreated = (data) => {
        if (data?.review && (data.review.product === id || data.review.product?._id === id)) {
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
        if (data?.review && (data.review.product === id || data.review.product?._id === id)) {
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
        if (data?.productId === id) {
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
        if (data?.productId === id) {
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
    if (!user) {
      navigate('/login');
      return;
    }
    setEditingReview(eligibility.existingReview || null);
    setIsReviewModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    if (editingReview) {
      await reviewService.updateReview(editingReview._id, formData);
    } else {
      await reviewService.createReview(id, formData);
    }
    fetchReviews();
    if (user && id) {
      const res = await reviewService.checkEligibility(id);
      if (res) {
        setEligibility({
          hasReviewed: Boolean(res.hasReviewed),
          existingReview: res.existingReview || null,
          isVerifiedBuyer: Boolean(res.isVerifiedBuyer),
        });
      }
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you wish to withdraw your impression?')) {
      try {
        await reviewService.deleteReview(reviewId);
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        setEligibility((prev) => ({ ...prev, hasReviewed: false, existingReview: null }));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete review');
      }
    }
  };

  // Safe Cart / Buy Now actions (defined before early return)
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
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-serif-luxury text-xl text-[#29251F]">Curating Ni'maah Luxe Piece...</p>
        </div>
      </div>
    );
  }

  // 2. Error or Missing Product State
  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white border border-[#E9E1D6] p-8 sm:p-10 text-center space-y-5 shadow-lg rounded-sm">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A059]/40 flex items-center justify-center mx-auto text-[#C5A059]">
            <Crown size={22} />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif-luxury text-2xl text-[#29251F] font-bold">
              Silhouette Not Found
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
              {error || 'This bespoke piece may have been retired or is momentarily unavailable in our collection.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="px-6 py-2.5 bg-[#29251F] hover:bg-[#C5A059] text-white text-xs uppercase tracking-[0.2em] font-semibold transition shadow-sm rounded-xs"
            >
              Explore Collection
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 bg-white border border-[#E9E1D6] hover:border-[#A68B66] text-[#29251F] text-xs uppercase tracking-[0.2em] font-semibold transition rounded-xs"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Guaranteed Safe Calculations (Only runs when product is loaded)
  const safePrice = Number(product.price || 0);
  const safeDiscountedPrice = Number(product.discountedPrice || 0);
  const isPrivilegeOffer = safeDiscountedPrice > 0 && safePrice > 0 && safeDiscountedPrice < safePrice;
  const currentPrice = isPrivilegeOffer ? safeDiscountedPrice : safePrice;
  const discountPercent = isPrivilegeOffer
    ? Math.round(((safePrice - safeDiscountedPrice) / safePrice) * 100)
    : null;

  const totalReviewsCount = Number(
    ratingSummary?.totalReviews ?? product.numReviews ?? product.totalReviews ?? reviews.length ?? 0
  );
  const rawRating = Number(ratingSummary?.averageRating ?? product.ratings ?? product.averageRating ?? 0);
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
      : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const stockCount = Number(product.stockCount || 0);
  const isFavorited = isWishlisted(product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16 space-y-12 sm:space-y-20">
      {/* Breadcrumb with Crisp Margins */}
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs text-gray-400 uppercase tracking-[0.16em] sm:tracking-[0.2em]">
        <Link to="/" className="hover:text-black">Home</Link>
        <ChevronRight size={12} />
        <Link to={`/shop?category=${encodeURIComponent(product.category || 'All')}`} className="hover:text-black">
          {product.category || 'Collection'}
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#29251F] font-semibold truncate max-w-[200px] sm:max-w-xs">{product.title || 'Haute Couture Piece'}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16">
        {/* Gallery Thumbnails + Main View */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-5">
          {productImages.length > 1 && (
            <div className="flex sm:flex-col gap-3.5 overflow-x-auto sm:overflow-visible">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 aspect-[3/4] flex-shrink-0 border-2 overflow-hidden bg-[#FAF9F6] transition shadow-xs ${displayImage === img ? 'border-[#C5A059]' : 'border-transparent hover:border-gray-300'
                    }`}
                >
                  <img
                    src={img}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 aspect-[3/4] bg-[#FAF9F6] border border-[#E9E1D6] overflow-hidden relative group shadow-sm">
            <img
              src={displayImage}
              alt={product.title || 'Haute Couture Silhouette'}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className="w-full h-full object-cover object-top transition duration-700 hover:scale-105 cursor-crosshair"
            />
            {discountPercent && (
              <span className="absolute top-5 left-5 bg-[#29251F] text-[#FAF9F6] text-xs uppercase tracking-[0.25em] font-bold px-3.5 py-1.5 shadow-md">
                -{discountPercent}% Privilege
              </span>
            )}
          </div>
        </div>

        {/* Right Details Column with Symmetrical Spacing */}
        <div className="lg:col-span-5 space-y-7">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-[0.3em] text-[#C5A059] font-cinzel font-semibold">
              <Crown size={14} />
              <span>{product.brand || "Ni'maah Luxe Atelier"} • {product.category || 'Atelier Collection'}</span>
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl text-[#29251F] leading-tight font-normal">
              {product.title}
            </h1>

            {/* Rating breakdown with Reusable RatingStars */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('reviews');
                const el = document.getElementById('product-tabs-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center space-x-2.5 pt-1 text-left group cursor-pointer hover:opacity-85 transition"
              title="Click to view and write patron reviews"
            >
              <RatingStars
                rating={hasReviews ? rawRating : 0}
                size="sm"
              />
              <span className="text-xs font-semibold text-[#29251F]">
                {safeRatingDisplay}
              </span>
              <span className="text-xs text-gray-400 font-light group-hover:text-[#C5A059] group-hover:underline transition">
                {totalReviewsCount > 0
                  ? `(${totalReviewsCount} patron ${totalReviewsCount === 1 ? 'review' : 'reviews'})`
                  : '(0 reviews • Be the first to rate)'}
              </span>
            </button>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline space-x-4 border-y border-[#E9E1D6] py-5">
            <span className="font-serif-luxury text-3xl sm:text-4xl font-semibold text-[#29251F]">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {isPrivilegeOffer && (
              <span className="text-base text-gray-400 line-through">
                ₹{safePrice.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-[11px] text-[#A68B66] uppercase tracking-wider font-semibold ml-auto">
              Inclusive of luxury GST
            </span>
          </div>

          {/* Color Palette Selector */}
          {productColors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-[0.18em] font-semibold text-[#29251F]">
                  Color: <span className="font-normal text-[#A68B66]">{selectedColor}</span>
                </span>
              </div>
              <div className="flex items-center space-x-3.5">
                {productColors.map((col, idx) => {
                  const colName = typeof col === 'string' ? col : col?.name || `Color ${idx + 1}`;
                  const colHex = typeof col === 'string' ? '#A68B66' : col?.hexCode || '#A68B66';
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(colName)}
                      className={`p-1 rounded-full border-2 transition ${selectedColor === colName ? 'border-[#29251F]' : 'border-transparent hover:border-gray-300'
                        }`}
                      title={colName}
                    >
                      <span
                        className="block w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: colHex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector with Exact Padding */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-[0.18em] font-semibold text-[#29251F]">
                Dress Size: <span className="font-normal text-[#A68B66]">{selectedSize}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-[11px] text-[#A68B66] hover:text-[#29251F] underline uppercase tracking-wider inline-flex items-center space-x-1 cursor-pointer"
              >
                <Ruler size={12} />
                <span>Size Guide Chart</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`min-w-14 py-2.5 px-3.5 text-xs uppercase tracking-widest font-semibold border transition ${selectedSize === sz
                    ? 'bg-[#29251F] text-white border-[#29251F]'
                    : 'bg-white border-[#E9E1D6] text-gray-700 hover:border-[#A68B66]'
                    }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Stock Indicator */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-7 pt-1">
            <div className="flex items-center border border-[#E9E1D6] bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2.5 text-sm hover:bg-[#FAF9F6] transition font-bold"
              >
                -
              </button>
              <span className="px-5 py-2.5 text-xs font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2.5 text-sm hover:bg-[#FAF9F6] transition font-bold"
              >
                +
              </button>
            </div>

            <div className="text-xs">
              {stockCount > 0 ? (
                <span className="text-emerald-700 font-semibold flex items-center space-x-1.5">
                  <Check size={14} className="flex-shrink-0" />
                  <span>Atelier In Stock ({stockCount} available)</span>
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">Bespoke Tailoring on Pre-order</span>
              )}
            </div>
          </div>

          {/* CTAs with Generous Heights & Mobile Touch Ergonomics */}
          <div className="space-y-3 pt-2 sm:pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={handleAddToCart}
                className="w-full py-3.5 sm:py-4 bg-[#29251F] hover:bg-[#C5A059] text-white text-xs uppercase tracking-[0.2em] font-semibold transition flex items-center justify-center space-x-2.5 shadow-md"
              >
                <ShoppingBag size={16} />
                <span>{addedSuccess ? 'Added to Bag ✓' : `Add Size ${selectedSize} To Bag`}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 sm:py-4 bg-[#E9E1D6] hover:bg-[#d8cebf] text-[#29251F] text-xs uppercase tracking-[0.2em] font-semibold transition flex items-center justify-center space-x-2 shadow-xs"
              >
                <span>Acquire Now</span>
              </button>
            </div>

            <button
              onClick={() => (isFavorited ? removeFromWishlist(product._id) : addToWishlist(product))}
              className="w-full py-3.5 bg-white border border-[#E9E1D6] hover:border-[#A68B66] text-[#29251F] text-xs uppercase tracking-[0.2em] transition flex items-center justify-center space-x-2 shadow-xs font-medium"
            >
              <Heart size={16} fill={isFavorited ? '#C5A059' : 'none'} color={isFavorited ? '#C5A059' : '#29251F'} />
              <span>{isFavorited ? 'Saved in Private Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="border-t border-[#E9E1D6] pt-6 sm:pt-7 space-y-3 text-xs text-gray-600 font-light">
            <div className="flex items-center space-x-3.5">
              <Truck size={17} className="text-[#C5A059] flex-shrink-0" />
              <span>White-Glove Expedited Delivery in 2–4 Business Days</span>
            </div>
            <div className="flex items-center space-x-3.5">
              <RefreshCw size={17} className="text-[#C5A059] flex-shrink-0" />
              <span>Complimentary 14-Day Alterations & Exchanges</span>
            </div>
            <div className="flex items-center space-x-3.5">
              <ShieldCheck size={17} className="text-[#C5A059] flex-shrink-0" />
              <span>100% Authentic Handloom Silk & Real Zari Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Details with Horizontal Scroll on Mobile */}
      <div id="product-tabs-section" className="border-t border-[#E9E1D6] pt-10 sm:pt-14">
        <div className="flex space-x-6 sm:space-x-10 border-b border-[#E9E1D6] pb-3.5 overflow-x-auto no-scrollbar whitespace-nowrap">
          {['description', 'fabric', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] font-semibold transition pb-3 relative font-cinzel flex-shrink-0 ${activeTab === tab ? 'text-[#29251F]' : 'text-gray-400 hover:text-black'
                }`}
            >
              {tab === 'description' && 'Creation Story'}
              {tab === 'fabric' && 'Fabric & Preservation'}
              {tab === 'reviews' && `Patron Reviews (${ratingSummary?.totalReviews ?? product.numReviews ?? reviews.length})`}
              {activeTab === tab && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#C5A059]"></span>
              )}
            </button>
          ))}
        </div>

        <div className="py-10">
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-4 text-sm text-gray-700 leading-relaxed font-light">
              <p>{product.description}</p>
              <p>
                Each silhouette from Ni'maah Luxe is crafted to balance royal modesty and contemporary elegance. Tailored with an internal boned support structure and flowing drapery for flawless poise on life's most memorable stages.
              </p>
            </div>
          )}

          {activeTab === 'fabric' && (
            <div className="max-w-2xl space-y-4 text-xs text-gray-700 font-light leading-relaxed">
              <p><strong className="text-[#29251F] font-semibold">Fabric Composition:</strong> {product.fabric || 'Pure Mulberry Silk & Korean Organza'}</p>
              <p><strong className="text-[#29251F] font-semibold">Artisanal Weave:</strong> Hand-guided Zari needlework / Banarasi jacquard</p>
              <p><strong className="text-[#29251F] font-semibold">Care:</strong> Specialized dry clean only. Wrap in breathable unbleached muslin cloth.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-10 max-w-4xl">
              {/* Summary Breakdown Card */}
              <RatingSummaryCard
                summary={
                  ratingSummary || {
                    averageRating: hasReviews ? rawRating : 0,
                    totalReviews: totalReviewsCount,
                    ratingDistribution: product.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    ratingPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                  }
                }
                selectedRatingFilter={selectedRatingFilter}
                onSelectRatingFilter={(star) => setSelectedRatingFilter(star)}
                onOpenWriteReview={handleOpenWriteReview}
                canReview={true}
                hasReviewed={eligibility.hasReviewed}
                isVerifiedBuyer={eligibility.isVerifiedBuyer}
              />

              {/* Reviews List */}
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
                  <div className="flex items-center space-x-2">
                    <MessageSquare size={16} className="text-[#C5A059]" />
                    <h3 className="font-serif-luxury text-base font-bold text-[#14110C]">
                      Patron Impressions {selectedRatingFilter ? `(${selectedRatingFilter} Stars)` : ''}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400">
                    Showing {reviews.length} {reviews.length === 1 ? 'impression' : 'impressions'}
                  </span>
                </div>

                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white p-6 border border-[#E9E1D6] rounded-xl animate-pulse space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                          <div className="space-y-1.5">
                            <div className="w-28 h-3.5 bg-gray-200 rounded"></div>
                            <div className="w-16 h-2.5 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                        <div className="w-full h-12 bg-gray-100 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="bg-white border border-[#E9E1D6] rounded-xl p-12 text-center space-y-3 shadow-2xs">
                    <Star size={32} className="mx-auto text-gray-300" strokeWidth={1.5} />
                    <p className="font-serif-luxury text-lg text-[#14110C] font-semibold">
                      {selectedRatingFilter
                        ? `No ${selectedRatingFilter}-star impressions yet.`
                        : 'Be the first patron to share an impression of this piece.'}
                    </p>
                    <p className="text-xs text-gray-400 font-light max-w-md mx-auto">
                      Your refined critique helps fellow fashion connoisseurs discover sovereign tailoring.
                    </p>
                    <button
                      onClick={handleOpenWriteReview}
                      className="px-6 py-2.5 bg-[#14110C] hover:bg-[#C5A059] text-white text-xs uppercase tracking-widest font-semibold transition rounded-xs mt-2"
                    >
                      Write First Review
                    </button>
                  </div>
                ) : (
                  reviews.map((rev) => (
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
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-[#E9E1D6] pt-16 mt-16">
          <div className="mb-10 space-y-1">
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#C5A059] font-cinzel font-semibold">
              Complete The Look
            </span>
            <h2 className="font-serif-luxury text-3xl text-[#29251F]">Related Silhouettes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Interactive Dress Size Guide Modal */}
      {isSizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="bg-white border border-[#E9E1D6] max-w-xl w-full p-7 sm:p-8 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E9E1D6] pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-cinzel font-semibold">
                  Ni'maah Luxe Tailoring
                </span>
                <h3 className="font-serif-luxury text-2xl text-[#29251F]">
                  Women's Dress Size Chart (Inches)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1.5 text-gray-400 hover:text-black transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F6] border-b border-[#E9E1D6] text-[#29251F] uppercase tracking-wider font-cinzel">
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Bust</th>
                    <th className="py-3 px-4">Waist</th>
                    <th className="py-3 px-4">Hips</th>
                    <th className="py-3 px-4">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF9F6]">
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
                        ? 'bg-[#E9E1D6]/60 font-semibold text-[#29251F]'
                        : 'hover:bg-[#FAF9F6] text-gray-600'
                        }`}
                    >
                      <td className="py-3 px-4 font-bold text-[#29251F]">{row.size}</td>
                      <td className="py-3 px-4">{row.bust}</td>
                      <td className="py-3 px-4">{row.waist}</td>
                      <td className="py-3 px-4">{row.hips}</td>
                      <td className="py-3 px-4">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-gray-500 font-light">
              Tip: Click any row above to immediately select that dress size. For bespoke custom tailoring, contact our Chennai Atelier at <strong>+91 8618621612</strong>.
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
        isVerifiedBuyer={eligibility.isVerifiedBuyer}
      />
    </div>
  );
};

export default ProductDetailPage;
