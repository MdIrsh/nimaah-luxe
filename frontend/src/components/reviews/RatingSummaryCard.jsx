import React from 'react';
import { Star } from 'lucide-react';

export const RatingSummaryCard = ({
  summary,
  selectedRatingFilter,
  onSelectRatingFilter,
  onOpenWriteReview,
  canReview = true,
}) => {
  const numAverage = Number(summary?.averageRating || 0);
  const average = !isNaN(numAverage) && numAverage > 0 ? numAverage : 0;
  const numTotal = Number(summary?.totalReviews || 0);
  const totalReviews = !isNaN(numTotal) ? numTotal : 0;
  const totalRatings = totalReviews; // Exact MongoDB ratings count

  const distribution = summary?.ratingDistribution || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  const percentages = summary?.ratingPercentages || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Top Split: Stars & Count (Left) vs Progress Bars (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Side: 5 Stars & Total Ratings/Reviews Count */}
        <div className="md:col-span-5 space-y-2 text-left">
          {/* Stars Row */}
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={22}
                className={
                  average > 0 && star <= Math.round(average)
                    ? 'text-[#16A34A] fill-[#16A34A]'
                    : 'text-slate-200 fill-slate-200'
                }
              />
            ))}
          </div>

          {/* Ratings and Reviews Count Text */}
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            {totalReviews > 0 ? (
              <>
                <strong className="text-slate-800 font-bold">
                  {totalRatings.toLocaleString('en-IN')}
                </strong>{' '}
                ratings and{' '}
                <strong className="text-slate-800 font-bold">
                  {totalReviews.toLocaleString('en-IN')}
                </strong>{' '}
                reviews
              </>
            ) : (
              <span className="text-slate-400">0 customer ratings & 0 reviews</span>
            )}
          </p>

          {/* Write Review Action Link */}
          {canReview && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenWriteReview}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition cursor-pointer"
              >
                <span>Rate & Review Product</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: 5★ to 1★ Distribution Bars with Real Database Counts */}
        <div className="md:col-span-7 space-y-1.5">
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
                className={`w-full flex items-center gap-2.5 text-xs py-0.5 rounded-md transition cursor-pointer group ${isSelected ? 'bg-blue-50/80 px-1.5' : 'hover:bg-slate-50 px-1'
                  }`}
                title={`Filter by ${star} star reviews`}
              >
                {/* Star Number */}
                <span className="w-7 flex items-center justify-start gap-0.5 text-slate-700 font-semibold text-xs">
                  <span>{star}</span>
                  <Star size={11} className="fill-slate-700 text-slate-700" />
                </span>

                {/* Progress Bar Track */}
                <div className="flex-1 h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#16A34A] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                {/* Review Count formatted */}
                <span className="w-18 text-right text-[11px] text-slate-500 font-sans">
                  {count.toLocaleString('en-IN')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RatingSummaryCard;
