import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Preferences } from '@capacitor/preferences';
import apiClient from '@/utils/apiClient';

// ---------- LOGIN ----------
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (payload: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', payload);
      const { accessToken, refreshToken, user } = response.data;

      // Save tokens and user persistently
      await Preferences.set({ key: 'accessToken', value: accessToken });
      await Preferences.set({ key: 'refreshToken', value: refreshToken });
      await Preferences.set({ key: 'user', value: JSON.stringify(user) });

      return { accessToken, user, refreshToken };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// ---------- REFRESH TOKEN ----------
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshTokenResult = await Preferences.get({ key: 'refreshToken' });
      const refreshToken = refreshTokenResult.value;

      if (!refreshToken) throw new Error('No refresh token found');

      const response = await apiClient.post('/auth/refresh', { refreshToken });
      const { accessToken, user } = response.data;

      // Update access token and user persistently
      await Preferences.set({ key: 'accessToken', value: accessToken });
      await Preferences.set({ key: 'user', value: JSON.stringify(user) });

      return { accessToken, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Token refresh failed');
    }
  }
);

// ---------- LOAD USER FROM STORAGE ----------
export const loadUserFromStorage = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const [tokenRes, userRes] = await Promise.all([
        Preferences.get({ key: 'accessToken' }),
        Preferences.get({ key: 'user' }),
      ]);

      if (!tokenRes.value || !userRes.value) {
        return rejectWithValue('No stored session found');
      }

      return {
        accessToken: tokenRes.value,
        user: JSON.parse(userRes.value),
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load user from storage');
    }
  }
);

// ---------- SLICE ----------
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
      Preferences.remove({ key: 'user' });
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // REFRESH TOKEN
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.accessToken = null;
        state.user = null;
        state.isAuthenticated = false;
      })

      // LOAD USER FROM STORAGE
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.accessToken = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer;