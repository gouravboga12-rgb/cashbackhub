import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    // When running on Vercel production domain, use same-origin relative path
    if (hostname.includes('vercel.app') || hostname.includes('cashbackhub')) {
      return '/api/v1';
    }
    // When running locally (localhost or 192.168.x.x), connect directly to the live cloud backend
    return 'https://cashbackhub-peach.vercel.app/api/v1';
  }
  return 'https://cashbackhub-peach.vercel.app/api/v1';
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
