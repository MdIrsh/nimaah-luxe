import api from './api';

export const orderService = {
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response.data.data;
    } catch (error) {
      console.warn('API error, saving order locally for preview:', error.message);
      const fallbackOrder = {
        _id: 'ORD-' + Date.now(),
        ...orderData,
        orderStatus: 'Admin Received',
        createdAt: new Date().toISOString(),
        paymentResult: {
          id: orderData.paymentId || 'PAY-MOCK-' + Date.now(),
          status: 'COMPLETED',
          transactionRef: 'NLX-TXN-' + Date.now(),
        },
      };
      const existing = JSON.parse(localStorage.getItem('stylehub_orders') || '[]');
      existing.unshift(fallbackOrder);
      localStorage.setItem('stylehub_orders', JSON.stringify(existing));
      return fallbackOrder;
    }
  },

  async getMyOrders() {
    try {
      const response = await api.get('/orders/myorders');
      return response.data.data;
    } catch (error) {
      const local = JSON.parse(localStorage.getItem('stylehub_orders') || '[]');
      return local;
    }
  },

  async getOrderById(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.data;
    } catch (error) {
      const local = JSON.parse(localStorage.getItem('stylehub_orders') || '[]');
      const found = local.find((o) => o._id === id);
      if (found) return found;
      throw error;
    }
  },

  async getAllOrders() {
    try {
      const response = await api.get('/orders');
      return response.data.data.orders;
    } catch (error) {
      return JSON.parse(localStorage.getItem('stylehub_orders') || '[]');
    }
  },

  async updateOrderStatus(id, statusData) {
    try {
      const response = await api.put(`/orders/${id}/status`, statusData);
      return response.data.data;
    } catch (error) {
      const local = JSON.parse(localStorage.getItem('stylehub_orders') || '[]');
      const index = local.findIndex((o) => o._id === id);
      if (index !== -1) {
        local[index] = { ...local[index], ...statusData };
        localStorage.setItem('stylehub_orders', JSON.stringify(local));
        return local[index];
      }
      throw error;
    }
  },
};
