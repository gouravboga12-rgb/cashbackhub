import axios from 'axios';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // When running in production on any domain or IP (perkfy.co.in, etc.), use same-origin relative path /api/v1
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return '/api/v1';
    }
  }
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return '/api/v1';
};


const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach user token (or admin token fallback)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cashback_token') || localStorage.getItem('cashback_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Cache-Control'] = 'no-cache';
  config.headers['Pragma'] = 'no-cache';
  if (config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() };
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
  config.headers['Cache-Control'] = 'no-cache';
  config.headers['Pragma'] = 'no-cache';
  if (config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() };
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
