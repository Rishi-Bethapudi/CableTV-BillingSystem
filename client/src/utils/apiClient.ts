import axios from 'axios';

import { toast } from 'sonner';

import { store } from '@/redux/store';

import {
  setAccessToken,
  logout,
} from '@/redux/slices/authSlice';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,

  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------- REQUEST INTERCEPTOR ----------------
apiClient.interceptors.request.use(
  (config) => {
    const token =
      store.getState().auth.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

// ---------------- RESPONSE INTERCEPTOR ----------------
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          localStorage.getItem(
            'refreshToken'
          );

        if (!refreshToken) {
          throw new Error(
            'No refresh token'
          );
        }

        // REFRESH TOKEN API
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {
            refreshToken,
          }
        );

        const {
          accessToken: newAccessToken,
        } = res.data;

        // UPDATE REDUX STATE
        store.dispatch(
          setAccessToken(newAccessToken)
        );

        // RETRY REQUEST
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        toast.error(
          'Session expired. Please login again.'
        );

        store.dispatch(logout());

        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;