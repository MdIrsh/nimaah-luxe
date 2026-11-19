import api from './api';

export const paymentService = {
  // Step 1: Create Razorpay Order
  createRazorpayOrder: async (amount, receipt) => {
    const response = await api.post('/payment/create-order', {
      amount,
      receipt,
    });
    return response.data.data;
  },

  // Step 2: Verify Razorpay Signature and Commit Order
  verifyPayment: async (payload) => {
    const response = await api.post('/payment/verify-and-order', payload);
    return response.data.data;
  },
};

export default paymentService;
