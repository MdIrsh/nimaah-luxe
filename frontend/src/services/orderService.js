import api from './api';

export const orderService = {
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  },

  async getMyOrders() {
    const response = await api.get('/orders/myorders');
    return response.data.data;
  },

  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  async getAllOrders() {
    const response = await api.get('/orders');
    return response.data.data.orders;
  },

  async updateOrderStatus(id, statusData) {
    const response = await api.put(`/orders/${id}/status`, statusData);
    return response.data.data;
  },
};
