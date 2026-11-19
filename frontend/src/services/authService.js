import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
    });
    if (response.data.data.token) {
      localStorage.setItem('stylehub_token', response.data.data.token);
      localStorage.setItem('stylehub_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('stylehub_token', response.data.data.token);
      localStorage.setItem('stylehub_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.data) {
      localStorage.setItem('stylehub_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('stylehub_token');
    localStorage.removeItem('stylehub_user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('stylehub_user');
    return user ? JSON.parse(user) : null;
  },
};
