import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { toast } from 'sonner';

// This is a placeholder for your central state management (e.g., from your AuthContext)
// In a real app, you would import these from your context.
let memoryAccessToken: string | null = null;
const setMemoryAccessToken = (token: string | null) => {
  memoryAccessToken = token;
};
const logoutUser = () => {
    console.log("Session expired. Logging out.");
    // This would call the logout function from your AuthContext
    window.location.href = '/login'; 
};


const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Your backend URL from .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 1. Request Interceptor ---
// This runs BEFORE every request is sent.
apiClient.interceptors.request.use(
  (config) => {
    // Get the access token from your state and add it to the headers
    if (memoryAccessToken) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 2. Response Interceptor ---
// This runs AFTER a response is received.
apiClient.interceptors.response.use(
  (response) => response, // If the response is successful, just return it
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is a 401 (Unauthorized) and we haven't already retried
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark that we've retried this request

      try {
        // --- Perform the Silent Refresh ---
        let refreshToken = null;
        if (Capacitor.isNativePlatform()) {
          const { value } = await Preferences.get({ key: 'refreshToken' });
          refreshToken = value;
        }
        // For web, the httpOnly cookie is sent automatically by the browser.

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
            // On mobile, we must send the refresh token in the body
            refreshToken: Capacitor.isNativePlatform() ? refreshToken : undefined
        });

        const { accessToken: newAccessToken } = response.data;
        
        // --- Update tokens universally ---
        setMemoryAccessToken(newAccessToken);
        if (Capacitor.isNativePlatform()) {
            await Preferences.set({ key: 'accessToken', value: newAccessToken });
        }
        
        // --- Retry the original request with the new token ---
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        return apiClient(originalRequest);

      } catch (refreshError) {
        // If the refresh fails, the refresh token is likely expired or invalid.
        toast.error("Your session has expired. Please log in again.");
        logoutUser(); // Log the user out completely.
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
