import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default API Base URLs:
// - Android Emulator: http://10.0.2.2:5000/api/v1
// - iOS Simulator / Local: http://localhost:5000/api/v1
// - Production / Remote: https://cashbackhub-nine.vercel.app/api/v1
const DEFAULT_API_URL = 'https://cashbackhub-nine.vercel.app/api/v1';

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

export default api;
