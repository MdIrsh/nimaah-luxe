import React, { useState } from 'react';
import { Camera, X, ZoomIn, CheckCircle2 } from 'lucide-react';
import { handleImageError } from '../../utils/imageUtils';

export const CustomerPhotosGallery = ({ reviews = [] }) => {
  const [activePhoto, setActivePhoto] = useState(null);

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
                  day: 'numeric',
                  year: 'numeric',
                })
              : '',
            isVerified: rev.isVerifiedPurchase,
          });
        }
      });
    }
  });

  if (allPhotos.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50/60 via-white to-sky-50/40 border border-blue-100 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-2xs">
            <Camera size={13} />
          </div>
          <h4 className="text-sm sm:text-base font-extrabold text-[#0B192C]">
            Customer Review Photos ({allPhotos.length})
          </h4>
        </div>
        <span className="text-xs text-blue-600 font-semibold hidden sm:inline">
          Real customer uploads
        </span>
      </div>

      {/* Horizontal Scrollable Strip of Customer Photos */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {allPhotos.map((photo, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActivePhoto(photo)}
            className="relative group w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-xs hover:border-blue-500 hover:scale-105 active:scale-95 transition flex-shrink-0 cursor-pointer bg-slate-100"
          >
            <img
              src={photo.url}
              alt={photo.title || 'Customer review image'}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:brightness-95 transition"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
              <ZoomIn size={18} />
            </div>
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              ★ {photo.rating}
            </div>
          </button>
        ))}
      </div>

      {/* Photo Lightbox Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-[#0B192C]">
                  Photo by {activePhoto.userName}
                </span>
                {activePhoto.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                    <CheckCircle2 size={11} /> Verified Buyer
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActivePhoto(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-2xl bg-black/5 flex items-center justify-center">
              <img
                src={activePhoto.url}
                alt=""
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="max-h-[60vh] max-w-full object-contain"
              />
            </div>

            {activePhoto.title && (
              <p className="text-xs text-slate-600 font-medium italic">
                "{activePhoto.title}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPhotosGallery;
