import api from './api';

export const reviewService = {
  // Get paginated reviews for a product with rating filter
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data?.data || response.data;
  },

  // Get rating summary & distribution
  getProductRating: async (productId) => {
    const response = await api.get(`/products/${productId}/rating`);
    return response.data?.data || response.data;
  },

  // Check customer's eligibility to review
  checkEligibility: async (productId) => {
    const response = await api.get(`/products/${productId}/eligibility`);
    return response.data?.data || response.data;
  },

  // Submit review
  createReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data?.data || response.data;
  },

  // Edit existing review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data?.data || response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data?.data || response.data;
  },

  // Admin: Get all reviews
  getAdminReviews: async (params = {}) => {
    const response = await api.get('/admin/reviews', { params });
    return response.data?.data || response.data;
  },

  // Admin: Moderate review status
  moderateReview: async (reviewId, status) => {
    const response = await api.patch(`/admin/reviews/${reviewId}/status`, { status });
    return response.data?.data || response.data;
  },

  // Admin: Approve review
  approveReview: async (reviewId) => {
    const response = await api.patch(`/admin/reviews/${reviewId}/approve`);
    return response.data?.data || response.data;
  },

  // Admin: Reject review
  rejectReview: async (reviewId) => {
    const response = await api.patch(`/admin/reviews/${reviewId}/reject`);
    return response.data?.data || response.data;
  },
};

export default reviewService;
