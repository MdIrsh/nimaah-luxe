import React, { useState } from 'react';
import { X, ZoomIn, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { handleImageError } from '../../utils/imageUtils';

export const CustomerPhotosGallery = ({ reviews = [] }) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  // Extract all reviewImages from all approved reviews
  const allPhotos = [];
  reviews.forEach((rev) => {
    const rawImages =
      (Array.isArray(rev.uploadedImages) && rev.uploadedImages.length > 0)
        ? rev.uploadedImages
        : (Array.isArray(rev.reviewImages) && rev.reviewImages.length > 0)
        ? rev.reviewImages
        : (Array.isArray(rev.images) ? rev.images : []);

    if (rawImages.length > 0) {
      rawImages.forEach((img) => {
        if (img && typeof img === 'string' && !img.includes('unsplash.com')) {
          allPhotos.push({
            url: getProductImageUrl(img),
            userName:
              rev.customerName ||
              rev.user?.name ||
              rev.name ||
              'Customer',
            rating: rev.rating || 5,
            title:
              rev.reviewTitle ||
              rev.title ||
              rev.reviewMessage ||
              rev.reviewText ||
              '',
            date: rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : '',
            isVerified: Boolean(rev.verifiedPurchase || rev.isVerifiedPurchase),
          });
        }
      });
    }
  });

  // STRICTLY NO MOCK PHOTOS: If no customer has uploaded photos yet, render nothing!
  if (allPhotos.length === 0) return null;

  const currentPhoto = activePhotoIndex !== null ? allPhotos[activePhotoIndex] : null;

  return (
    <div className="py-2">
      <div className="flex items-center justify-between pb-1.5">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Customer Photos ({allPhotos.length})
        </span>
      </div>

      {/* Horizontal Strip of Square Customer Photos (Flipkart Style) */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-2">
        {allPhotos.map((photo, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActivePhotoIndex(idx)}
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-md overflow-hidden border border-slate-200 flex-shrink-0 cursor-pointer hover:opacity-90 active:scale-95 transition bg-slate-100 relative group shadow-2xs"
          >
            <img
              src={photo.url}
              alt={photo.title || 'Customer review image'}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
              <ZoomIn size={16} />
            </div>
          </button>
        ))}
      </div>

      {/* Photo Lightbox Modal with Next / Prev Navigation */}
      {currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActivePhotoIndex(null)}
        >
          <div
            className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900">
                  Photo by {currentPhoto.userName}
                </span>
                {currentPhoto.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold">
                    <CheckCircle2 size={11} className="text-slate-800" /> Verified Purchase
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-bold ml-2">
                  {activePhotoIndex + 1} / {allPhotos.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoIndex(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Main Image with Navigation Arrows */}
            <div className="relative max-h-[65vh] overflow-hidden rounded-2xl bg-black/5 flex items-center justify-center">
              {allPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIndex(
                      (activePhotoIndex - 1 + allPhotos.length) % allPhotos.length
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer z-10"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <img
                src={currentPhoto.url}
                alt=""
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="max-h-[65vh] max-w-full object-contain"
              />

              {allPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIndex((activePhotoIndex + 1) % allPhotos.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer z-10"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            {currentPhoto.title && (
              <p className="text-xs text-slate-600 font-medium italic pt-1">
                "{currentPhoto.title}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPhotosGallery;