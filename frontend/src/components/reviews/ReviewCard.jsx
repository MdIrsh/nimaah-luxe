import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Edit3,
  Trash2,
  X,
  Flag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getProductImageUrl, handleImageError } from '../../utils/imageUtils';
import reviewService from '../../services/reviewService';

export const ReviewCard = ({
  review,
  currentUserId,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [reported, setReported] = useState(review.isReported || false);

  // Real database helpful counts (default 0)
  const [helpfulCount, setHelpfulCount] = useState(Number(review.helpfulCount || 0));
  const [unhelpfulCount, setUnhelpfulCount] = useState(Number(review.unhelpfulCount || 0));
  const [userVoted, setUserVoted] = useState(null);

  const handleHelpful = async () => {
    try {
      if (userVoted === 'helpful') {
        setUserVoted(null);
        setHelpfulCount((c) => Math.max(0, c - 1));
      } else {
        if (userVoted === 'unhelpful') setUnhelpfulCount((c) => Math.max(0, c - 1));
        setUserVoted('helpful');
        setHelpfulCount((c) => c + 1);
      }
      if (review._id && review._id.length === 24) {
        await reviewService.markHelpful(review._id);
      }
    } catch (err) {
      console.warn('Helpful sync:', err.message);
    }
  };

  const handleUnhelpful = () => {
    if (userVoted === 'unhelpful') {
      setUserVoted(null);
      setUnhelpfulCount((c) => Math.max(0, c - 1));
    } else {
      if (userVoted === 'helpful') setHelpfulCount((c) => Math.max(0, c - 1));
      setUserVoted('unhelpful');
      setUnhelpfulCount((c) => c + 1);
    }
  };

  const handleReport = async () => {
    const reason = window.prompt(
      'Why would you like to report this review? (e.g. Inappropriate language, fake review, spam)'
    );
    if (!reason) return;
    try {
      if (review._id && review._id.length === 24) {
        await reviewService.reportReview(review._id, reason);
      }
      setReported(true);
      setShowMenu(false);
      alert('Thank you. This review has been submitted to moderators for evaluation.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to report review');
    }
  };

  const isAuthor =
    currentUserId &&
    (review.user?._id === currentUserId ||
      review.user === currentUserId ||
      review.userId === currentUserId);

  const canManage = isAuthor || isAdmin;

  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
    : '';

  const reviewerName =
    review.customerName ||
    review.user?.name ||
    review.name ||
    'Customer';

  const reviewerAvatar =
    review.user?.avatar ||
    review.customerAvatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const reviewerLocation = review.user?.city || review.user?.addresses?.[0]?.city || '';

  const reviewTitle = (review.reviewTitle || review.title || '').trim();
  const reviewMessage = (
    review.reviewMessage ||
    review.reviewText ||
    review.comment ||
    ''
  ).trim();

  const rawImages =
    (Array.isArray(review.uploadedImages) && review.uploadedImages.length > 0)
      ? review.uploadedImages
      : (Array.isArray(review.reviewImages) && review.reviewImages.length > 0)
      ? review.reviewImages
      : (Array.isArray(review.images) ? review.images : []);

  const imagesList = rawImages.filter((img) => img && typeof img === 'string');
  const isVerifiedBuyer = Boolean(review.verifiedPurchase || review.isVerifiedPurchase);

  return (
    <div className="py-4 border-b border-slate-200/90 space-y-2.5 transition">
      {/* 1. Star Rating, Score & Title */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={
                star <= (review.rating || 5)
                  ? 'text-[#16A34A] fill-[#16A34A]'
                  : 'text-slate-200 fill-slate-200'
              }
            />
          ))}
        </div>
        <span className="text-xs font-bold text-[#16A34A] font-mono ml-0.5">
          {Number(review.rating || 5).toFixed(1)} / 5
        </span>
        {reviewTitle && (
          <>
            <span className="text-slate-400 font-bold">•</span>
            <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              {reviewTitle}
            </h5>
          </>
        )}
      </div>

      {/* 2. Review Description */}
      {reviewMessage ? (
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
          {reviewMessage}
        </p>
      ) : null}

      {/* 3. Customer Review Photos Gallery */}
      {imagesList.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {imagesList.map((img, idx) => {
            const resolvedUrl = getProductImageUrl(img);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border border-slate-200 flex-shrink-0 cursor-pointer hover:opacity-90 transition bg-slate-100 relative group shadow-2xs"
                title={`Click to view photo ${idx + 1}`}
              >
                <img
                  src={resolvedUrl}
                  alt="Customer review photo"
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Reviewer Name & Location */}
      <div className="flex items-center gap-2 pt-0.5">
        <img
          src={reviewerAvatar}
          alt={reviewerName}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
          }}
          className="w-5 h-5 rounded-full object-cover border border-slate-200"
        />
        <span className="text-xs text-slate-500 font-semibold">
          {reviewerName}
          {reviewerLocation ? `, ${reviewerLocation}` : ''}
        </span>
      </div>

      {/* 5. Footer: Helpful, Dislike, Verified Purchase Badge, Menu */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 flex-wrap gap-2">
        {/* Left: Helpful & Dislike Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleHelpful}
            className={`flex items-center gap-1.5 transition cursor-pointer ${userVoted === 'helpful' ? 'text-blue-600 font-bold' : 'hover:text-slate-800'
              }`}
          >
            <ThumbsUp
              size={14}
              className={userVoted === 'helpful' ? 'fill-blue-600 text-blue-600' : ''}
            />
            <span>
              Helpful {helpfulCount > 0 ? `(${helpfulCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={handleUnhelpful}
            className={`flex items-center gap-1.5 transition cursor-pointer ${userVoted === 'unhelpful' ? 'text-slate-800 font-bold' : 'hover:text-slate-800'
              }`}
          >
            <ThumbsDown
              size={14}
              className={userVoted === 'unhelpful' ? 'fill-slate-800 text-slate-800' : ''}
            />
            {unhelpfulCount > 0 && <span>({unhelpfulCount})</span>}
          </button>
        </div>

        {/* Right: Verified Purchase Badge + More Options Menu */}
        <div className="flex items-center gap-3 relative">
          {isVerifiedBuyer && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
              <CheckCircle2 size={13} className="text-emerald-600 fill-emerald-600 text-white flex-shrink-0" />
              <span>Verified Purchase {formattedDate ? `• ${formattedDate}` : ''}</span>
            </div>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              aria-label="More options"
            >
              <MoreVertical size={15} />
            </button>

            {showMenu && (
              <div className="absolute right-0 bottom-full mb-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in">
                {canManage && onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(review);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Edit Review</span>
                  </button>
                )}
                {canManage && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(review._id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReport}
                  className="w-full px-3 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                >
                  <Flag size={13} />
                  <span>{reported ? 'Reported ✓' : 'Report Review'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Image Preview Modal with Image Navigation */}
      {lightboxIndex !== null && imagesList.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-xl w-full bg-white p-4 rounded-3xl shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Photo by {reviewerName}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {lightboxIndex + 1} / {imagesList.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Lightbox Main Image + Navigation Arrows */}
            <div className="relative max-h-[65vh] overflow-hidden rounded-2xl bg-black/5 flex items-center justify-center">
              {imagesList.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + imagesList.length) % imagesList.length
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer z-10"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <img
                src={getProductImageUrl(imagesList[lightboxIndex])}
                alt="Review full size"
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="max-h-[65vh] max-w-full object-contain"
              />

              {imagesList.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % imagesList.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer z-10"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
