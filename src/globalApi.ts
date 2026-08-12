import { useAuthStore } from '@/store/AuthStore';
import { useProfileStore } from '@/store/ProfileStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const axiosClient = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_SERVER_URI}`,
  withCredentials: true,
});

// Refresh lock to prevent concurrent refresh calls
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// Request interceptor — always reads from SecureStore (iOS-safe)
axiosClient.interceptors.request.use(async (config) => {
  const accessToken = await SecureStore.getItemAsync('accessToken'); // ← Key fix

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

const UNAUTHORIZED_MESSAGES = new Set([
  'session expired',
  'Invalid or expired token',
  'Please provide a valid authorization token.',
  'Your session is not valid for this resource.',
  'Your session has expired. Please log in again.',
]);

const isUnauthorizedError = (error: any): boolean => {
  if (error.response?.status !== 401) return false;
  const { message, error: errField } = error.response?.data || {};
  return UNAUTHORIZED_MESSAGES.has(message) || UNAUTHORIZED_MESSAGES.has(errField);
};

const clearSessionAndRedirect = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await AsyncStorage.removeItem('userProfile');
  useAuthStore.getState().logout();
  useProfileStore.getState().clearProfile();
  router.replace('/(onboarding)/Login');
};

// Response interceptor with refresh lock
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!isUnauthorizedError(error) || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(axiosClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/auth/refresh-token`,
        { refresh_token: refreshToken }
      );

      const newAccessToken = refreshResponse.data.accessToken;

      // Persist first, then update memory
      await SecureStore.setItemAsync('accessToken', newAccessToken);
      useAuthStore.getState().login(newAccessToken);

      onRefreshed(newAccessToken); // ← Unblock queued requests

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      console.error('Failed to refresh token:', refreshError);
      refreshSubscribers = []; // ← Clear queue on failure
      await clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false; // ← Always reset lock
    }
  }
);

export { axiosClient };