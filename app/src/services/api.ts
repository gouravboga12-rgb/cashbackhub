import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default API Base URLs:
// - Android Emulator: http://10.0.2.2:5000/api/v1
// - iOS Simulator / Local: http://localhost:5000/api/v1
// - Production / Remote: https://perkfy.co.in/api/v1
const DEFAULT_API_URL = 'https://perkfy.co.in/api/v1';

const api = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configure base URL dynamically if user specifies or production is used
export const setApiBaseUrl = (newUrl: string) => {
  api.defaults.baseURL = newUrl;
};

// Callback to trigger when backend detects token expired or account disabled
let onUnauthorizedCallback: (() => void) | null = null;
export const setOnUnauthorizedCallback = (cb: () => void) => {
  onUnauthorizedCallback = cb;
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('cashback_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to retrieve token from storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401/account disabled errors from backend
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response ? error.response.status : null;
    const errorData = error.response ? error.response.data : null;

    if (status === 401 || (status === 403 && errorData?.account_disabled)) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
