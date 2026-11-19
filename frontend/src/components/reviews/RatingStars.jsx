import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 0,
  maxRating = 5,
  size = 'md',
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
  };

  const starPx = starSizes[size] || 16;
  const currentRating = interactive && hoveredRating > 0 ? hoveredRating : rating;

  return (
    <div
      className={`inline-flex items-center space-x-1 ${className}`}
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
            className={`transition-transform duration-150 ${
              interactive
                ? 'cursor-pointer hover:scale-115 focus:outline-none p-0.5'
                : 'cursor-default pointer-events-none'
            }`}
            aria-label={`${starValue} star rating`}
          >
            <Star
              size={starPx}
              stroke="#C5A059"
              strokeWidth={1.8}
              fill={isFilled ? '#C5A059' : isHalf ? '#C5A059' : 'transparent'}
              className="transition-colors duration-150"
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
