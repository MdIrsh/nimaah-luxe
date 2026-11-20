import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
  color = 'gold', // 'gold' | 'amber'
  interactive = false,
  onChange,
  className = '',
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const starSizes = {
    xs: 11,
    sm: 13,
    md: 16,
    lg: 20,
    xl: 26,
    '2xl': 32,
  };

  const starPx = starSizes[size] || 16;
  const currentRating = interactive && hoveredRating > 0 ? hoveredRating : rating;

  // Color schemes
  const isAmber = color === 'amber';
  const filledStroke = isAmber ? '#D97706' : '#C5A059';
  const filledFill = isAmber ? '#F59E0B' : '#C5A059';
  const unfilledStroke = isAmber ? '#FDE68A' : '#E2D9CC';
  const unfilledFill = isAmber ? '#FEF3C7' : 'transparent';

  return (
    <div
      className={`inline-flex items-center space-x-1.5 ${className}`}
      onMouseLeave={() => interactive && setHoveredRating(0)}
    >
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(currentRating);
        const isHalf =
          !isFilled &&
          currentRating >= index + 0.3 &&
          currentRating < index + 0.8;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoveredRating(starValue)}
            className={`transition-all duration-150 ${
              interactive
                ? 'cursor-pointer hover:scale-120 active:scale-95 focus:outline-none p-0.5'
                : 'cursor-default pointer-events-none'
            }`}
            aria-label={`${starValue} star rating`}
          >
            <Star
              size={starPx}
              stroke={isFilled || isHalf ? filledStroke : unfilledStroke}
              strokeWidth={1.8}
              fill={isFilled ? filledFill : isHalf ? filledFill : unfilledFill}
              className={`transition-colors duration-150 ${
                isAmber && isFilled ? 'drop-shadow-xs' : ''
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
