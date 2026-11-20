import React, { useState } from 'react';
import { Star, CheckCircle2, ThumbsUp, ThumbsDown, MoreVertical, Edit3, Trash2, X } from 'lucide-react';
import { handleImageError } from '../../utils/imageUtils';

export const ReviewCard = ({
  review,
  currentUserId,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  // Helpful state
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount ?? 2048);
  const [unhelpfulCount, setUnhelpfulCount] = useState(review.unhelpfulCount ?? 558);
  const [userVoted, setUserVoted] = useState(null); // 'helpful' | 'unhelpful' | null

  const handleHelpful = () => {
    if (userVoted === 'helpful') {
      setUserVoted(null);
      setHelpfulCount((c) => Math.max(0, c - 1));
    } else {
      if (userVoted === 'unhelpful') setUnhelpfulCount((c) => Math.max(0, c - 1));
      setUserVoted('helpful');
      setHelpfulCount((c) => c + 1);
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
    : 'Sep, 2022';

  const reviewerName = review.user?.name || 'Sarfraz Alam';
  const reviewerCity = review.user?.city || review.user?.addresses?.[0]?.city || 'Gorakhpur';

  const defaultHeadline =
    review.rating === 5
      ? 'Perfect product!'
      : review.rating === 4
      ? 'Pretty good'
      : review.rating === 3
      ? 'Satisfactory experience'
      : 'Could be better';

  return (
    <div className="py-4 border-b border-slate-200/90 space-y-2.5 transition">
      {/* 1. Star Rating, Score & Headline */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={
                star <= review.rating
                  ? 'text-[#16A34A] fill-[#16A34A]'
                  : 'text-slate-200 fill-slate-200'
              }
            />
          ))}
        </div>
        <span className="text-xs font-bold text-[#16A34A] font-mono ml-0.5">
          {Number(review.rating || 4).toFixed(1)}
        </span>
        <span className="text-slate-400 font-bold">•</span>
        <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
          {review.reviewTitle || defaultHeadline}
        </h5>
      </div>

      {/* 2. Review for Variant Info */}
      <div className="text-[11px] text-slate-400 font-normal">
        Review for: Color Pearl White • Verified Item
      </div>

      {/* 3. Review Description */}
      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
        {review.reviewText}
      </p>

      {/* 4. Customer Review Photos Row */}
      {review.reviewImages && review.reviewImages.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {review.reviewImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border border-slate-200 flex-shrink-0 cursor-pointer hover:opacity-90 transition bg-slate-100"
            >
              <img
                src={img}
                alt=""
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* 5. Reviewer Name & City */}
      <div className="text-xs text-slate-500 font-semibold pt-0.5">
        {reviewerName}, {reviewerCity}
      </div>

      {/* 6. Footer: Helpful, Dislike, Verified Purchase Badge, Menu */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 flex-wrap gap-2">
        {/* Left: Helpful & Dislike Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleHelpful}
            className={`flex items-center gap-1.5 transition cursor-pointer ${
              userVoted === 'helpful' ? 'text-blue-600 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <ThumbsUp
              size={14}
              className={userVoted === 'helpful' ? 'fill-blue-600 text-blue-600' : ''}
            />
            <span>Helpful for {helpfulCount > 999 ? `${(helpfulCount / 1000).toFixed(0)}K` : helpfulCount}</span>
          </button>

          <button
            type="button"
            onClick={handleUnhelpful}
            className={`flex items-center gap-1.5 transition cursor-pointer ${
              userVoted === 'unhelpful' ? 'text-slate-800 font-bold' : 'hover:text-slate-800'
            }`}
          >
            <ThumbsDown
              size={14}
              className={userVoted === 'unhelpful' ? 'fill-slate-800 text-slate-800' : ''}
            />
            <span>{unhelpfulCount}</span>
          </button>
        </div>

        {/* Right: Verified Purchase Badge + More Action */}
        <div className="flex items-center gap-3 relative">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <CheckCircle2 size={13} className="text-slate-900 fill-slate-900 text-white flex-shrink-0" />
            <span>Verified Purchase • {formattedDate}</span>
          </div>

          {canManage && (
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
                <div className="absolute right-0 bottom-full mb-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(review);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit3 size={13} />
                      <span>Edit Review</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(review._id);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white p-3 rounded-2xl shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">
                Photo by {reviewerName}
              </span>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
              >
                <X size={15} />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-hidden rounded-xl bg-black/5 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Review full size"
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="max-h-[65vh] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
