import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { registerForPushNotificationsAsync, showInAppNotification } from '../services/notificationService';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  avatar?: string;
  referral_code?: string;
  auth_provider?: string;
}

export interface Wallet {
  available_points: number;
  total_earned: number;
  total_redeemed: number;
  points_to_rupee_ratio?: number;
  min_withdrawal_rupees?: number;
}

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isLoading: boolean;
  login: (emailOrMobile: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (data: any) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (credential: string, fallbackUser?: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('cashback_token');
      const storedUser = await AsyncStorage.getItem('cashback_user');
      const storedWallet = await AsyncStorage.getItem('cashback_wallet');

      if (storedToken) {
        setToken(storedToken);
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedWallet) {
        setWallet(JSON.parse(storedWallet));
      }

      if (storedToken) {
        // Verify with backend if connected
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            await AsyncStorage.setItem('cashback_user', JSON.stringify(res.data.user));
          }
        } catch (e) {
          console.warn('Backend auth/me check skipped or offline');
        }
        await fetchWalletBalance();
      }
    } catch (err) {
      console.warn('Error loading session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      if (res.data?.success && res.data.wallet) {
        setWallet(res.data.wallet);
        await AsyncStorage.setItem('cashback_wallet', JSON.stringify(res.data.wallet));
      }
    } catch (e) {
      console.warn('Wallet balance fetch fallback to cached state');
    }
  };

  const registerPushTokenWithBackend = async (userId: string) => {
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await api.post('/notifications/register-token', {
          token: pushToken,
          user_id: userId,
          platform: 'mobile'
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Could not register push token:', err);
    }
  };

  const login = async (emailOrMobile: string, password: string) => {
    try {
      const res = await api.post('/auth/login', {
        email_or_mobile: emailOrMobile,
        password: password,
      });

      if (res.data?.success) {
        const authToken = res.data.token;
        const loggedUser = res.data.user;

        setToken(authToken);
        setUser(loggedUser);

        await AsyncStorage.setItem('cashback_token', authToken);
        await AsyncStorage.setItem('cashback_user', JSON.stringify(loggedUser));

        if (res.data.wallet) {
          setWallet(res.data.wallet);
          await AsyncStorage.setItem('cashback_wallet', JSON.stringify(res.data.wallet));
        } else {
          await fetchWalletBalance();
        }

        registerPushTokenWithBackend(loggedUser.id);
        showInAppNotification('Welcome Back!', `Logged in as ${loggedUser.name}`);

        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Network error during login';
      return { success: false, message: msg };
    }
  };

  const registerUser = async (data: any) => {
    try {
      const res = await api.post('/auth/register', data);
      if (res.data?.success) {
        const authToken = res.data.token;
        const newUser = res.data.user;

        setToken(authToken);
        setUser(newUser);

        await AsyncStorage.setItem('cashback_token', authToken);
        await AsyncStorage.setItem('cashback_user', JSON.stringify(newUser));

        if (res.data.wallet) {
          setWallet(res.data.wallet);
          await AsyncStorage.setItem('cashback_wallet', JSON.stringify(res.data.wallet));
        } else {
          await fetchWalletBalance();
        }

        registerPushTokenWithBackend(newUser.id);
        showInAppNotification('Welcome Bonus!', 'Account created with 100 Welcome Points!');

        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Network error during registration';
      return { success: false, message: msg };
    }
  };

  const googleLogin = async (credential: string, fallbackUser?: any) => {
    try {
      const res = await api.post('/auth/google', {
        credential,
        fallback_email: fallbackUser?.email,
        fallback_name: fallbackUser?.name,
        fallback_avatar: fallbackUser?.photo,
      });

      if (res.data?.success) {
        const authToken = res.data.token;
        const loggedUser = res.data.user;

        setToken(authToken);
        setUser(loggedUser);

        await AsyncStorage.setItem('cashback_token', authToken);
        await AsyncStorage.setItem('cashback_user', JSON.stringify(loggedUser));

        if (res.data.wallet) {
          setWallet(res.data.wallet);
          await AsyncStorage.setItem('cashback_wallet', JSON.stringify(res.data.wallet));
        } else {
          await fetchWalletBalance();
        }

        registerPushTokenWithBackend(loggedUser.id);
        showInAppNotification('Google Sign-In Successful', `Welcome, ${loggedUser.name}!`);

        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Google authentication failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Google login error';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'cashback_token',
        'cashback_user',
        'cashback_wallet'
      ]);
    } catch (e) {}

    setToken(null);
    setUser(null);
    setWallet(null);
    showInAppNotification('Logged Out', 'You have been safely signed out.', 'info');
  };

  const refreshWallet = async () => {
    await fetchWalletBalance();
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        await AsyncStorage.setItem('cashback_user', JSON.stringify(res.data.user));
      }
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        isLoading,
        login,
        registerUser,
        googleLogin,
        logout,
        refreshWallet,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
