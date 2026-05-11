import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from '@reduxjs/toolkit';

import apiClient from '@/utils/apiClient';

// ---------------- LOGIN ----------------
export const loginAsync = createAsyncThunk(
  'auth/login',

  async (
    payload: {
      identifier: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post(
        '/auth/login',
        payload
      );

      const {
        accessToken,
        refreshToken,
        user,
      } = response.data;

      // SAVE TO LOCAL STORAGE
      localStorage.setItem(
        'refreshToken',
        refreshToken
      );

      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          'Login failed'
      );
    }
  }
);

// ---------------- REFRESH TOKEN ----------------
export const refreshAccessToken =
  createAsyncThunk(
    'auth/refreshToken',

    async (_, { rejectWithValue }) => {
      try {
        const refreshToken =
          localStorage.getItem(
            'refreshToken'
          );

        if (!refreshToken) {
          throw new Error(
            'No refresh token found'
          );
        }

        const response = await apiClient.post(
          '/auth/refresh',
          {
            refreshToken,
          }
        );

        const { accessToken, user } =
          response.data;

        return {
          accessToken,
          user,
        };
      } catch (err: any) {
        return rejectWithValue(
          err.response?.data?.message ||
            'Token refresh failed'
        );
      }
    }
  );

// ---------------- TYPES ----------------
interface AuthState {
  user: any;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// ---------------- INITIAL STATE ----------------
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// ---------------- SLICE ----------------
const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem(
        'refreshToken'
      );
    },

    setAccessToken(
      state,
      action: PayloadAction<string>
    ) {
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

      .addCase(
        loginAsync.fulfilled,
        (state, action) => {
          state.loading = false;

          state.accessToken =
            action.payload.accessToken;

          state.user = action.payload.user;

          state.isAuthenticated = true;
        }
      )

      .addCase(
        loginAsync.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload as string;
        }
      )

      // REFRESH
      .addCase(
        refreshAccessToken.fulfilled,
        (state, action) => {
          state.accessToken =
            action.payload.accessToken;

          state.user = action.payload.user;

          state.isAuthenticated = true;
        }
      )

      .addCase(
        refreshAccessToken.rejected,
        (state) => {
          state.accessToken = null;
          state.user = null;
          state.isAuthenticated = false;
        }
      );
  },
});

export const {
  logout,
  setAccessToken,
} = authSlice.actions;

export default authSlice.reducer;