import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';

/**
 * Atomic recalculation of a product's rating summary
 * Aggregates approved reviews and updates the Product document
 */
export const recalculateProductRating = async (productId) => {
  if (!productId) return null;

  const objectId = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : productId;

  // Aggregate approved reviews for this product
  const stats = await Review.aggregate([
    {
      $match: {
        product: objectId,
        status: 'APPROVED',
      },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ]);

  let totalReviews = 0;
  let totalScore = 0;
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  stats.forEach((item) => {
    const star = item._id;
    const count = item.count;
    if (distribution[star] !== undefined) {
      distribution[star] = count;
      totalReviews += count;
      totalScore += star * count;
    }
  });

  // Calculate average to 1 decimal place. If no approved reviews, default to 0 (or 5.0 unreviewed)
  const averageRating =
    totalReviews > 0 ? Math.round((totalScore / totalReviews) * 10) / 10 : 0;

  const percentages = {};
  for (let s = 1; s <= 5; s++) {
    percentages[s] =
      totalReviews > 0 ? Math.round((distribution[s] / totalReviews) * 100) : 0;
  }

  // Update product in database
  await Product.findByIdAndUpdate(productId, {
    ratings: averageRating,
    averageRating,
    numReviews: totalReviews,
    totalReviews,
    ratingDistribution: distribution,
  });

  return {
    productId: productId.toString(),
    averageRating,
    totalReviews,
    ratingDistribution: distribution,
    ratingPercentages: percentages,
  };
};
