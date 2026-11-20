import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    // When accessing local Vite server (from desktop localhost OR mobile phone via Wi-Fi 192.168.x.x)
    if (window.location.port === '5173' || window.location.port === '3000') {
      return `http://${window.location.hostname}:5000/api`;
    }
    // Production Render single-server deployment
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stylehub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 unauthorized & expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid/expired session data
      localStorage.removeItem('stylehub_token');
      localStorage.removeItem('stylehub_user');
    }
    return Promise.reject(error);
  }
);

export default api;
