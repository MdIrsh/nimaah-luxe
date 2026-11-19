import React from 'react';
import { Star, ShieldCheck, Check } from 'lucide-react';
import RatingStars from './RatingStars';

export const RatingSummaryCard = ({
  summary,
  selectedRatingFilter,
  onSelectRatingFilter,
  onOpenWriteReview,
  canReview = true,
  hasReviewed = false,
  isVerifiedBuyer = false,
}) => {
  const numAverage = Number(summary?.averageRating || 0);
  const average = !isNaN(numAverage) ? numAverage : 0;
  const numTotal = Number(summary?.totalReviews || 0);
  const total = !isNaN(numTotal) ? numTotal : 0;
  const distribution = summary?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const percentages = summary?.ratingPercentages || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="bg-white border border-[#E9E1D6] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#F2ECE1]">
        {/* Left: Overall Score */}
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <span className="font-serif-luxury text-4xl sm:text-5xl font-bold text-[#14110C] block leading-none">
              {average > 0 ? average.toFixed(1) : '5.0'}
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-semibold mt-1 block">
              Out of 5.0
            </span>
          </div>

          <div className="space-y-1.5 border-l border-[#F2ECE1] pl-6">
            <RatingStars rating={average > 0 ? average : 5} size="lg" />
            <p className="text-xs text-gray-500 font-medium">
              Based on <strong className="text-[#14110C]">{total}</strong> {total === 1 ? 'patron impression' : 'patron impressions'}
            </p>
            <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-700 font-medium">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>100% Genuine Verified Patron Feedback</span>
            </div>
          </div>
        </div>

        {/* Right: Write / Edit Review Button */}
        {canReview && (
          <div className="w-full md:w-auto">
            <button
              onClick={onOpenWriteReview}
              className="w-full md:w-auto px-6 py-3 bg-[#14110C] hover:bg-[#C5A059] text-white text-xs uppercase tracking-[0.2em] font-semibold transition duration-300 shadow-sm flex items-center justify-center space-x-2 rounded-xs"
            >
              <Star size={14} className="text-[#C5A059]" fill="#C5A059" />
              <span>{hasReviewed ? 'Edit Your Impression' : 'Write Patron Review'}</span>
            </button>
            {isVerifiedBuyer && (
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-center md:justify-end gap-1 mt-1.5">
                <Check size={11} /> You are an eligible verified buyer
              </span>
            )}
          </div>
        )}
      </div>

      {/* Star Rating Breakdown Progress Bars */}
      <div className="space-y-2.5 max-w-xl">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-600">
            Rating Breakdown
          </span>
          {selectedRatingFilter && (
            <button
              onClick={() => onSelectRatingFilter && onSelectRatingFilter(null)}
              className="text-[11px] text-[#C5A059] hover:underline font-semibold"
            >
              Clear filter (showing {selectedRatingFilter}★)
            </button>
          )}
        </div>

        {[5, 4, 3, 2, 1].map((star) => {
          const count = Number(distribution[star] || distribution[String(star)] || 0);
          const pct = Number(percentages[star] || percentages[String(star)] || 0);
          const isSelected = selectedRatingFilter === star;

          return (
            <button
              key={star}
              type="button"
              onClick={() =>
                onSelectRatingFilter &&
                onSelectRatingFilter(isSelected ? null : star)
              }
              className={`w-full flex items-center space-x-3 text-xs p-1.5 rounded-lg transition text-left group ${
                isSelected
                  ? 'bg-[#FAF7F2] border border-[#C5A059]/40'
                  : 'hover:bg-[#FAF9F6]'
              }`}
            >
              <div className="w-14 flex items-center space-x-1 text-gray-700 font-medium">
                <span>{star}</span>
                <Star size={12} fill="#C5A059" stroke="#C5A059" />
              </div>

              {/* Progress Bar Track */}
              <div className="flex-1 h-2 bg-[#F2ECE1] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C5A059] to-[#E3C385] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="w-16 text-right text-[11px] text-gray-500 font-mono">
                <span>{pct}%</span>{' '}
                <span className="text-gray-400">({count})</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RatingSummaryCard;
