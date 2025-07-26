import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Preferences } from '@capacitor/preferences';
import apiClient from '@/utils/apiClient';

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (payload: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      // const response = await axios.post('https://cabletv-billingsystem.onrender.com/api/auth/login', payload);
      const response = await apiClient.post('/auth/login', payload);
      const { accessToken, refreshToken, user } = response.data;

      await Preferences.set({ key: 'accessToken', value: accessToken });
      await Preferences.set({ key: 'refreshToken', value: refreshToken });

      return { accessToken, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshTokenResult = await Preferences.get({ key: 'refreshToken' });
      const refreshToken = refreshTokenResult.value;

      const response = await apiClient.post('/auth/refresh', { refreshToken });

      const { accessToken, user } = response.data;
      await Preferences.set({ key: 'accessToken', value: accessToken });

      return { accessToken, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Token refresh failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null as any,
    accessToken: null as string | null,
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      Preferences.remove({ key: 'accessToken' });
      Preferences.remove({ key: 'refreshToken' });
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.accessToken = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
