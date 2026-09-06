import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }
    // Mobile / local network IP check (e.g., 192.168.x.x)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return `http://${hostname}:5000/api/v1`;
    }
    // Production / Vercel domain (use same origin relative route)
    return '/api/v1';
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
