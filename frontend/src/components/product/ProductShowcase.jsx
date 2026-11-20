import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Crown, Image as ImageIcon, Play } from 'lucide-react';
import { handleImageError } from '../../utils/imageUtils';

export const ProductShowcase = ({
  images = [],
  selectedImage = '',
  onSelectImage,
  productTitle = '',
  isBestSeller = true,
  discountPercent = null,
}) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const validImages = images.length > 0 ? images : ['/images/placeholder.jpg'];
  const currentIndex = Math.max(0, validImages.indexOf(selectedImage));

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + validImages.length) % validImages.length;
    onSelectImage(validImages[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % validImages.length;
    onSelectImage(validImages[nextIdx]);
  };

  return (
    <div className="space-y-4">
      {/* 3D Pedestal Main Display Box */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#EBF3FE] via-[#E2EFFF] to-[#D5E6FE] p-3.5 sm:p-10 flex items-center justify-center border border-blue-100/70 shadow-sm overflow-hidden group">
        {/* Soft Pedestal Base Glow Effect */}
        <div className="absolute bottom-3 sm:bottom-6 inset-x-8 sm:inset-x-14 h-16 sm:h-20 bg-gradient-to-t from-[#B9D5FA]/70 via-[#CFE2FD]/40 to-transparent rounded-[100%] blur-sm pointer-events-none" />

        {/* Floating Sparkles in corners */}
        <span className="absolute top-4 left-5 text-blue-300 text-sm select-none pointer-events-none">✦</span>
        <span className="absolute bottom-16 right-6 text-blue-300 text-xs select-none pointer-events-none">✦</span>

        {/* Best Seller Crown Badge (Top-Right) */}
        {isBestSeller && (
          <div className="absolute top-4 right-4 bg-[#2563EB] text-white text-[11px] sm:text-xs font-bold px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm z-10 animate-in fade-in">
            <Crown size={13} className="text-amber-300 fill-amber-300" />
            <span>Best Seller</span>
          </div>
        )}

        {/* Privilege Discount Tag (Top-Left) */}
        {discountPercent && (
          <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-full shadow-xs z-10">
            {discountPercent}% OFF
          </div>
        )}

        {/* Left Navigation Arrow */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xs shadow-md border border-slate-200/70 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-white hover:scale-105 active:scale-95 transition cursor-pointer z-10"
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
        )}

        {/* Right Navigation Arrow */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-xs shadow-md border border-slate-200/70 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-white hover:scale-105 active:scale-95 transition cursor-pointer z-10"
          >
            <ChevronRight size={20} strokeWidth={2.4} />
          </button>
        )}

        {/* Main Product Image */}
        <div className="relative w-full h-full flex items-center justify-center z-5">
          <img
            src={selectedImage || validImages[0]}
            alt={productTitle}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="max-h-[82%] max-w-[85%] object-contain drop-shadow-[0_15px_25px_rgba(30,58,138,0.18)] transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Image Counter Badge (Bottom-Right) */}
        <div className="absolute bottom-3.5 right-3.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 z-10">
          <ImageIcon size={12} />
          <span>{currentIndex + 1} / {validImages.length}</span>
        </div>
      </div>

      {/* Thumbnails Row */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-1">
          {validImages.map((img, idx) => {
            const isSelected = (selectedImage || validImages[0]) === img;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectImage(img)}
                aria-label={`View thumbnail ${idx + 1}`}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white flex-shrink-0 p-1 transition-all cursor-pointer border-2 ${isSelected
                  ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm scale-102'
                  : 'border-slate-200/80 hover:border-blue-300 opacity-80 hover:opacity-100'
                  }`}
              >
                <img
                  src={img}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </button>
            );
          })}

          {/* Bonus 360 / Video Preview Card */}
          <button
            type="button"
            onClick={() => {
              if (validImages.length > 0) onSelectImage(validImages[0]);
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-900 relative flex-shrink-0 border-2 border-slate-200/80 hover:border-blue-400 group transition shadow-xs cursor-pointer"
            title="360° Studio Showcase"
          >
            <img
              src={validImages[0]}
              alt=""
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-white/90 group-hover:bg-blue-600 group-hover:text-white text-slate-900 flex items-center justify-center transition shadow-sm">
                <Play size={12} fill="currentColor" className="ml-0.5" />
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductShowcase;
