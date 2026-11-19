import api from './api';

export const paymentService = {
  // Step 1: Create Razorpay Order with server-side validation
  createRazorpayOrder: async (amount, receipt, cartItems = []) => {
    const response = await api.post('/payment/create-order', {
      amount,
      receipt,
      cartItems,
    });
    return response.data.data;
  },

  // Step 2: Verify Cryptographic Razorpay Signature and Commit Order
  verifyPayment: async (payload) => {
    const response = await api.post('/payment/verify-and-order', payload);
    return response.data.data;
  },

  // Step 3: Report Payment Failure to Backend
  reportFailure: async (error, orderId) => {
    const response = await api.post('/payment/failure', { error, orderId });
    return response.data.data;
  },

  // Step 4: Customer Payment & Transaction History
  getPaymentHistory: async () => {
    const response = await api.get('/payment/history');
    return response.data.data;
  },

  // Step 5: Admin Issue Refund
  issueRefund: async (orderId, amount, reason) => {
    const response = await api.post(`/payment/refund/${orderId}`, { amount, reason });
    return response.data.data;
  },
};

export default paymentService;
