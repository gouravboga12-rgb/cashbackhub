import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }
    // Dynamic local network IP fallback for mobile/other devices on same Wi-Fi
    return `http://${hostname}:5000/api/v1`;
  }
  return '/api/v1';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach user token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cashback_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Admin API client with admin token
export const adminApi = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

adminApi.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('cashback_admin_token');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
