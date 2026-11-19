import React, { useState } from 'react';
import { CheckCircle2, Trash2, Edit3, X, ZoomIn } from 'lucide-react';
import RatingStars from './RatingStars';

export const ReviewCard = ({
  review,
  currentUserId,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const isAuthor =
    currentUserId &&
    (review.user?._id === currentUserId ||
      review.user === currentUserId ||
      review.userId === currentUserId);

  const canManage = isAuthor || isAdmin;

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent Impression';

  const defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="bg-white border border-[#E9E1D6] rounded-xl p-5 sm:p-6 shadow-2xs space-y-4 transition hover:shadow-xs">
      {/* Header: Patron Info + Star Rating */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#F5EFE6] pb-4">
        <div className="flex items-center space-x-3.5">
          <img
            src={review.user?.avatar || defaultAvatar}
            alt={review.user?.name || 'Patron'}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = defaultAvatar;
            }}
            className="w-10 h-10 rounded-full object-cover border border-[#C5A059]/40 shadow-2xs"
          />
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h4 className="font-serif-luxury text-sm font-bold text-[#14110C]">
                {review.user?.name || 'Valued Patron'}
              </h4>
              {review.isVerifiedPurchase && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  <span>Verified Purchase</span>
                </span>
              )}
            </div>
            <span className="text-[10.5px] text-gray-400 font-medium block mt-0.5">
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <RatingStars rating={review.rating} size="sm" />
          <span className="text-xs font-bold text-[#14110C] font-mono">
            {review.rating}.0
          </span>
        </div>
      </div>

      {/* Review Commentary */}
      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-light">
        {review.reviewText}
      </p>

      {/* Optional Customer Review Photos */}
      {review.reviewImages && review.reviewImages.length > 0 && (
        <div className="pt-2">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-2 font-medium">
            Patron Photos
          </span>
          <div className="flex flex-wrap gap-2.5">
            {review.reviewImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                className="relative group w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border border-[#E9E1D6] shadow-2xs hover:border-[#C5A059] transition"
              >
                <img
                  src={img}
                  alt={`Review photo ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                  <ZoomIn size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Author / Admin Management Actions */}
      {canManage && (
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#F5EFE6]">
          {onEdit && (
            <button
              onClick={() => onEdit(review)}
              className="text-[11px] font-semibold text-[#A68B66] hover:text-[#14110C] flex items-center space-x-1 transition"
            >
              <Edit3 size={12} />
              <span>Edit Impression</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(review._id)}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center space-x-1 transition"
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-white p-2 rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
            >
              <X size={18} />
            </button>
            <img
              src={selectedImage}
              alt="Review full size"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain max-h-[80vh] rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
