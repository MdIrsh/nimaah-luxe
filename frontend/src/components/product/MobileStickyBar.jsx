import React from 'react';
import { ShoppingCart, Heart, Zap } from 'lucide-react';

export const MobileStickyBar = ({
  price,
  originalPrice,
  discountPercent,
  onAddToCart,
  onBuyNow,
  isFavorited,
  onToggleWishlist,
  addedSuccess,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/98 backdrop-blur-md border-t border-blue-100 px-4 py-3 shadow-[0_-8px_30px_rgba(11,25,44,0.12)] flex items-center gap-3 sm:hidden animate-in slide-in-from-bottom duration-300">
      {/* Price Summary */}
      <div className="flex flex-col min-w-[90px]">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-[#0B192C]">
            ₹{price?.toLocaleString('en-IN')}
          </span>
        </div>
        {originalPrice && originalPrice > price && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 line-through">
              ₹{originalPrice?.toLocaleString('en-IN')}
            </span>
            {discountPercent && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        )}
      </div>

      {/* Wishlist Icon Button */}
      <button
        type="button"
        onClick={onToggleWishlist}
        aria-label="Wishlist"
        className="w-11 h-11 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 active:scale-95 transition flex-shrink-0"
      >
        <Heart
          size={18}
          fill={isFavorited ? '#EF4444' : 'none'}
          color={isFavorited ? '#EF4444' : '#0B192C'}
        />
      </button>

      {/* Add To Cart CTA Button */}
      <button
        type="button"
        onClick={onAddToCart}
        className="py-3 px-3.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.98] text-[#0B192C] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
      >
        <ShoppingCart size={15} />
        <span>{addedSuccess ? 'Added ✓' : 'Add to Bag'}</span>
      </button>

      {/* Instant Buy Now Button */}
      <button
        type="button"
        onClick={onBuyNow}
        className="flex-1 py-3 px-4 rounded-2xl bg-[#0B192C] hover:bg-[#1E3A8A] active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition"
      >
        <Zap size={15} className="fill-amber-400 text-amber-400" />
        <span>Buy Now</span>
      </button>
    </div>
  );
};

export default MobileStickyBar;
