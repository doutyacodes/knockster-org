// contexts/AuthContext.tsx

import apiService, { LoginRequest } from '@/services/apiService';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Guard {
  id: string;
  username: string;
  status: 'active' | 'disabled';
  shiftStartTime: string | null;
  shiftEndTime: string | null;
  organization: {
    id: string;
    name: string;
    type: string;
  } | null;
}

interface AuthContextType {
  guard: Guard | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guard, setGuard] = useState<Guard | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!guard && !!token;

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = await SecureStore.getItemAsync('auth_token');
      const storedGuard = await SecureStore.getItemAsync('guard_data');

      if (storedToken && storedGuard) {
        setToken(storedToken);
        setGuard(JSON.parse(storedGuard));
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Get device info
      const deviceInfo = {
        deviceId: Application.androidId || Device.modelName || 'unknown',
        deviceModel: Device.modelName || 'unknown',
        osVersion: Device.osVersion || 'unknown',
      };

      const credentials: LoginRequest = {
        username,
        password,
        deviceInfo,
      };

      const response = await apiService.login(credentials);

      if (response.success && response.data) {
        const { token: authToken, guard: guardData } = response.data;

        // Store token and guard data
        await SecureStore.setItemAsync('auth_token', authToken);
        await SecureStore.setItemAsync('guard_data', JSON.stringify(guardData));

        setToken(authToken);
        setGuard(guardData);

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Call API logout (clears token)
      await apiService.logout();

      // Clear local storage
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('guard_data');

      // Clear state
      setToken(null);
      setGuard(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    guard,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;