import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getSocket } from '../services/socket';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const { addToCart, isWishlisted, addToWishlist, removeFromWishlist } = useCart();

  const [liveRating, setLiveRating] = useState(
    product.averageRating || product.ratings || 4.9
  );
  const [liveReviewsCount, setLiveReviewsCount] = useState(
    product.totalReviews || product.numReviews || 0
  );

  useEffect(() => {
    const socket = getSocket();
    if (socket && product?._id) {
      const handleRatingUpdated = (data) => {
        if (data?.productId === product._id) {
          setLiveRating(data.averageRating);
          setLiveReviewsCount(data.totalReviews);
        }
      };
      socket.on('product:ratingUpdated', handleRatingUpdated);
      return () => {
        socket.off('product:ratingUpdated', handleRatingUpdated);
      };
    }
  }, [product?._id]);

  const availableSizes =
    Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const [selectedSize, setSelectedSize] = useState(
    availableSizes.includes('M') ? 'M' : availableSizes[0]
  );
  const [justAdded, setJustAdded] = useState(false);

  const isFavorited = isWishlisted(product._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleSizeSelect = (e, sz) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(sz);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const firstColor = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : null;
    const defaultColor =
      typeof firstColor === 'string'
        ? firstColor
        : firstColor?.name || 'Royal Gold';
    addToCart(product, selectedSize, defaultColor, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const safePrice = Number(product.price || 0);
  const safeDiscountedPrice = Number(product.discountedPrice || 0);
  const discountPercent =
    safeDiscountedPrice > 0 && safePrice > 0 && safeDiscountedPrice < safePrice
      ? Math.round(((safePrice - safeDiscountedPrice) / safePrice) * 100)
      : null;

  const rawRating = Number(liveRating || product.averageRating || product.ratings || 4.9);
  const displayRating = (!isNaN(rawRating) && rawRating > 0 ? rawRating : 4.9).toFixed(1);

  const mainImage = getProductImageUrl(
    (Array.isArray(product.images) && product.images[0]) || product.image
  );
  const secondaryImage = getProductImageUrl(
    (Array.isArray(product.images) && product.images[1]) || mainImage
  );

  return (
    <div className="group relative bg-white border border-[#E9E1D6]/80 rounded-xl sm:rounded-sm flex flex-col luxury-card-hover overflow-hidden shadow-xs">
      {/* Product Image Frame */}
      <Link
        to={`/product/${product._id}`}
        className="relative block aspect-[3/4] overflow-hidden bg-[#FAF9F6]"
      >
        <img
          src={mainImage}
          alt={product.title}
          referrerPolicy="no-referrer"
          onError={handleImageError}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {product.images?.length > 1 && (
          <img
            src={secondaryImage}
            alt={`${product.title} alternate view`}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            loading="lazy"
            className="hidden lg:block w-full h-full object-cover object-top absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
          {discountPercent && (
            <span className="bg-[#29251F]/90 text-[#FAF9F6] text-[8px] sm:text-[9.5px] tracking-[0.12em] uppercase font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-xs shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="hidden sm:inline-block bg-[#C5A059] text-[#29251F] text-[9px] tracking-[0.16em] uppercase font-bold px-2.5 py-0.5 shadow-sm">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-all duration-300 z-10 shadow-sm ${isFavorited
            ? 'bg-[#29251F] text-[#C5A059]'
            : 'bg-white/90 backdrop-blur-sm text-[#29251F] hover:bg-[#29251F] hover:text-[#FAF9F6]'
            }`}
          title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart size={13} className="sm:w-[15px] sm:h-[15px]" fill={isFavorited ? '#C5A059' : 'none'} strokeWidth={1.8} />
        </button>

        {/* Rating Pill on Mobile Image Corner */}
        <div className="sm:hidden absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-semibold text-[#29251F] flex items-center gap-0.5 shadow-xs">
          <Star size={9} fill="#C5A059" color="#C5A059" />
          <span>{displayRating}</span>
        </div>

        {/* Desktop Hover Overlay */}
        <div className="hidden lg:flex absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/75 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 items-center justify-center">
          <button
            onClick={handleQuickAdd}
            className="w-full py-3 bg-[#FAF9F6] text-[#29251F] hover:bg-[#29251F] hover:text-white text-[11px] font-semibold uppercase tracking-[0.18em] transition flex items-center justify-center space-x-2 shadow-lg"
          >
            {justAdded ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span>Added Size {selectedSize}</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Add Size {selectedSize} To Bag</span>
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Meta Information — Compact for 2-Column Phone Grid, Spacious for Desktop */}
      <div className="p-2.5 sm:p-4 lg:p-5 flex flex-col flex-1 bg-white justify-between gap-2 sm:gap-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-1 text-[8.5px] sm:text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.16em] text-[#A68B66]">
            <span className="truncate">{product.category}</span>
            <span className="hidden sm:inline text-gray-400 font-sans truncate">{product.brand || "Ni'maah Luxe"}</span>
          </div>

          <Link to={`/product/${product._id}`} className="block group-hover:text-[#A68B66] transition">
            <h3 className="font-serif-luxury text-sm sm:text-base lg:text-lg font-medium sm:font-normal text-[#29251F] line-clamp-1 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Compact Interactive Size Chips */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-0.5">
            {availableSizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={(e) => handleSizeSelect(e, sz)}
                className={`min-w-[22px] sm:min-w-[28px] px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8.5px] sm:text-[10px] uppercase font-semibold border rounded-xs transition cursor-pointer ${selectedSize === sz
                  ? 'bg-[#29251F] text-[#FAF9F6] border-[#29251F]'
                  : 'bg-[#FAF9F6] text-[#29251F]/80 border-[#E9E1D6] hover:border-[#C5A059]'
                  }`}
              >
                {sz === 'Free Size' ? 'Free' : sz}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing + Mobile Add To Bag */}
        <div className="space-y-2 pt-2 border-t border-[#FAF9F6]">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs sm:text-base font-bold sm:font-semibold text-[#29251F] font-sans sm:font-serif-luxury">
                ₹{(safeDiscountedPrice > 0 && safeDiscountedPrice < safePrice ? safeDiscountedPrice : safePrice).toLocaleString('en-IN')}
              </span>
              {safeDiscountedPrice > 0 && safeDiscountedPrice < safePrice && (
                <span className="text-[9.5px] sm:text-xs text-gray-400 line-through">
                  ₹{safePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="hidden sm:flex items-center space-x-1 text-xs text-[#C5A059]">
              <Star size={12} fill="#C5A059" />
              <span className="font-semibold text-[#29251F] text-[11px]">
                {displayRating}
              </span>
              {liveReviewsCount > 0 && (
                <span className="text-[10px] text-gray-400 font-normal">({liveReviewsCount})</span>
              )}
            </div>
          </div>

          {/* Mobile & Tablet Touch-Friendly Quick Add */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className="lg:hidden w-full py-2 sm:py-2.5 bg-[#29251F] active:bg-[#C5A059] text-[#FAF9F6] text-[9.5px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] sm:tracking-[0.16em] rounded-md sm:rounded-xs transition flex items-center justify-center gap-1.5"
          >
            {justAdded ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span>Added ({selectedSize === 'Free Size' ? 'Free' : selectedSize})</span>
              </>
            ) : (
              <>
                <ShoppingBag size={12} />
                <span className="sm:hidden">Add ({selectedSize === 'Free Size' ? 'Free' : selectedSize})</span>
                <span className="hidden sm:inline">Add Size {selectedSize} To Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
