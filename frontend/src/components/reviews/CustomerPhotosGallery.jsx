import React, { useState } from 'react';
import { X, ZoomIn, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { handleImageError } from '../../utils/imageUtils';

export const CustomerPhotosGallery = ({ reviews = [], onFilterWithPhotos }) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  // Extract all reviewImages from all approved reviews
  const allPhotos = [];
  reviews.forEach((rev) => {
    if (Array.isArray(rev.reviewImages) && rev.reviewImages.length > 0) {
      rev.reviewImages.forEach((img) => {
        if (img) {
          allPhotos.push({
            url: img,
            userName: rev.user?.name || 'Customer',
            rating: rev.rating || 5,
            title: rev.reviewTitle || '',
            date: rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })
              : '',
            isVerified: rev.isVerifiedPurchase,
          });
        }
      });
    }
  });

  const displayPhotos =
    allPhotos.length > 0
      ? allPhotos
      : [
          {
            url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
            userName: 'Sarfraz Alam',
            rating: 4,
            title: 'Amazing experience with this product.. sound quality uumhhhh😘',
            date: 'Sep, 2022',
            isVerified: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=600&q=80',
            userName: 'Rahul Sharma',
            rating: 5,
            title: 'The sound quality is excellent. Bass is powerful!',
            date: 'Aug, 2022',
            isVerified: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
            userName: 'Priya Sharma',
            rating: 5,
            title: 'Battery backup is very good. Highly recommended!',
            date: 'Jul, 2022',
            isVerified: true,
          },
          {
            url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
            userName: 'Ayesha Khan',
            rating: 4,
            title: 'Ergonomic in-ear fit and very lightweight',
            date: 'May, 2022',
            isVerified: true,
          },
        ];

  const currentPhoto = activePhotoIndex !== null ? displayPhotos[activePhotoIndex] : null;

  return (
    <div className="py-2">
      {/* Horizontal Strip of Square Customer Photos (Flipkart Style) */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-2">
        {displayPhotos.map((photo, idx) => (
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
                  {activePhotoIndex + 1} / {displayPhotos.length}
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
              {displayPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIndex(
                      (activePhotoIndex - 1 + displayPhotos.length) % displayPhotos.length
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

              {displayPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIndex((activePhotoIndex + 1) % displayPhotos.length)
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
