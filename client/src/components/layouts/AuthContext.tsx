import React, { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import apiClient from '@/utils/clientCalls';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: any;
  accessToken: string | null;
  login: (
    tokens: { accessToken: string; refreshToken: string },
    userData: any
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => useContext(AuthContext)!;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Save access token in memory
  apiClient.setAccessToken(accessToken);

  const login = async (
    {
      accessToken,
      refreshToken,
    }: { accessToken: string; refreshToken: string },
    userData: any
  ) => {
    setAccessToken(accessToken);
    setUser(userData);
    apiClient.setAccessToken(accessToken);

    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key: 'accessToken', value: accessToken });
      await Preferences.set({ key: 'refreshToken', value: refreshToken });
    }
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    apiClient.setAccessToken(null);

    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key: 'accessToken' });
      await Preferences.remove({ key: 'refreshToken' });
    }
    navigate('/login');
  };

  const loadTokens = async () => {
    if (Capacitor.isNativePlatform()) {
      const { value: storedToken } = await Preferences.get({
        key: 'accessToken',
      });
      if (storedToken) {
        setAccessToken(storedToken);
        apiClient.setAccessToken(storedToken);
      }
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
