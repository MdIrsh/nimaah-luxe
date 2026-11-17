import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart, isWishlisted, addToWishlist, removeFromWishlist } = useCart();

  const availableSizes =
    product.sizes && product.sizes.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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
    const defaultColor =
      product.colors && product.colors.length > 0 ? product.colors[0].name : 'Royal Gold';
    addToCart(product, selectedSize, defaultColor, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const discountPercent =
    product.discountedPrice && product.price
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : null;

  const mainImage =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images?.[1] || mainImage;

  return (
    <div className="group relative bg-white border border-[#E9E1D6]/80 flex flex-col luxury-card-hover overflow-hidden shadow-xs">
      {/* Product Image Frame */}
      <Link
        to={`/product/${product._id}`}
        className="relative block aspect-[3/4] overflow-hidden bg-[#FAF9F6]"
      >
        <img
          src={mainImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {product.images?.length > 1 && (
          <img
            src={secondaryImage}
            alt={`${product.title} alternate view`}
            loading="lazy"
            className="hidden lg:block w-full h-full object-cover object-top absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="bg-[#29251F] text-[#FAF9F6] text-[9px] sm:text-[9.5px] tracking-[0.16em] uppercase font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 shadow-sm">
              -{discountPercent}% Off
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#C5A059] text-[#29251F] text-[8.5px] sm:text-[9px] tracking-[0.16em] uppercase font-bold px-2 sm:px-2.5 py-0.5 shadow-sm">
              Bestseller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#E9E1D6] text-[#29251F] text-[8.5px] sm:text-[9px] tracking-[0.16em] uppercase font-semibold px-2 sm:px-2.5 py-0.5 shadow-sm">
              New Runway
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10 shadow-sm ${
            isFavorited
              ? 'bg-[#29251F] text-[#C5A059]'
              : 'bg-white/90 backdrop-blur-sm text-[#29251F] hover:bg-[#29251F] hover:text-[#FAF9F6]'
          }`}
          title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label="Wishlist toggle"
        >
          <Heart size={15} fill={isFavorited ? '#C5A059' : 'none'} strokeWidth={1.8} />
        </button>

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

      {/* Meta Information with Balanced Mobile & Desktop Padding */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white justify-between space-y-3.5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em] text-[#A68B66]">
            <span className="truncate">{product.brand || "Ni'maah Luxe"}</span>
            <span className="text-gray-400 font-sans flex-shrink-0">{product.category}</span>
          </div>

          <Link to={`/product/${product._id}`} className="block group-hover:text-[#A68B66] transition">
            <h3 className="font-serif-luxury text-base sm:text-lg font-normal text-[#29251F] line-clamp-1 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Interactive Size Selector */}
          <div className="pt-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                Select Size:
              </span>
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center space-x-1.5">
                  {product.colors.slice(0, 3).map((col, idx) => (
                    <span
                      key={idx}
                      className="w-2.5 h-2.5 rounded-full border border-gray-300"
                      style={{ backgroundColor: col.hexCode }}
                      title={col.name}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={(e) => handleSizeSelect(e, sz)}
                  className={`min-w-[30px] px-2 py-1 text-[10px] uppercase font-semibold border transition cursor-pointer ${
                    selectedSize === sz
                      ? 'bg-[#29251F] text-[#FAF9F6] border-[#29251F]'
                      : 'bg-[#FAF9F6] text-[#29251F]/80 border-[#E9E1D6] hover:border-[#C5A059]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing + Mobile/Tablet Always-Visible Add To Bag Button */}
        <div className="space-y-3 pt-3 border-t border-[#FAF9F6]">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-base font-semibold text-[#29251F] font-serif-luxury">
                ₹{(product.discountedPrice || product.price).toLocaleString('en-IN')}
              </span>
              {product.discountedPrice && product.discountedPrice < product.price && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1 text-xs text-[#C5A059]">
              <Star size={12} fill="#C5A059" />
              <span className="font-semibold text-[#29251F] text-[11px]">{product.ratings || 4.9}</span>
            </div>
          </div>

          {/* Mobile & Tablet Touch-Friendly Quick Add Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className="lg:hidden w-full py-2.5 bg-[#29251F] active:bg-[#C5A059] text-[#FAF9F6] text-[11px] font-semibold uppercase tracking-[0.16em] transition flex items-center justify-center space-x-2"
          >
            {justAdded ? (
              <>
                <Check size={14} className="text-emerald-400" />
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
      </div>
    </div>
  );
};

export default ProductCard;
