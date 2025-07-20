// src/contexts/AuthContext.tsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences'; // For secure mobile storage
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'agent';
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to check initial auth state
  const navigate = useNavigate();

  // This effect runs on app startup to check for existing tokens
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        let storedToken = null;
        if (Capacitor.isNativePlatform()) {
          const { value } = await Preferences.get({ key: 'accessToken' });
          storedToken = value;
        } else {
          // For web, we rely on the silent refresh to get a new token
          // The initial token is in memory and won't persist a page refresh
        }

        if (storedToken) {
          setAccessToken(storedToken);
          // TODO: Fetch user profile using the token to validate it and set user data
        }
        // TODO: Implement silent refresh logic here for web
      } catch (error) {
        console.error('Failed to check auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const {
        user: userData,
        accessToken: newAccessToken,
        refreshToken,
      } = data;

      // --- Universal Token Handling ---
      setAccessToken(newAccessToken);
      setUser(userData);

      if (Capacitor.isNativePlatform()) {
        // On mobile, store both tokens securely
        await Preferences.set({ key: 'accessToken', value: newAccessToken });
        await Preferences.set({ key: 'refreshToken', value: refreshToken });
      }
      // On web, the refresh token is handled automatically by the httpOnly cookie.

      toast.success('Login successful!');
      navigate('/'); // Redirect to dashboard after login
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unknown error occurred.'
      );
      throw error; // Re-throw to let the form know about the error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key: 'accessToken' });
      await Preferences.remove({ key: 'refreshToken' });
    }
    // TODO: Call a '/api/auth/logout' endpoint to clear the server-side cookie
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
