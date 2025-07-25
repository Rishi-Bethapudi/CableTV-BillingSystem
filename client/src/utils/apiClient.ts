import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import store from '../redux/store';
import { setAccessToken, logout } from '../redux/slices/authSlice';
import { toast } from 'sonner';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        let refreshToken = null;
        if (Capacitor.isNativePlatform()) {
          const { value } = await Preferences.get({ key: 'refreshToken' });
          refreshToken = value;
        }

        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
          refreshToken: Capacitor.isNativePlatform() ? refreshToken : undefined,
        });

        const { accessToken: newAccessToken } = res.data;

        store.dispatch(setAccessToken(newAccessToken));

        if (Capacitor.isNativePlatform()) {
          await Preferences.set({ key: 'accessToken', value: newAccessToken });
        }

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        toast.error('Session expired. Please log in again.');
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
