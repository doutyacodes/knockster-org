// Location: contexts/SecurityContext.tsx
// Authentication context using Expo Secure Store

import { apiService, LoginCredentials, LoginResponse } from '@/services/apiService';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SecurityContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  guard: LoginResponse['guard'] | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshGuardData: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [guard, setGuard] = useState<LoginResponse['guard'] | null>(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const token = await SecureStore.getItemAsync('auth_token');
      const guardData = await SecureStore.getItemAsync('guard_data');

      if (token && guardData) {
        setIsAuthenticated(true);
        setGuard(JSON.parse(guardData));
      } else {
        setIsAuthenticated(false);
        setGuard(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setGuard(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      // Add device information
      const deviceInfo = {
        deviceId: Constants.sessionId || 'unknown',
        deviceModel: `${Device.manufacturer || 'Unknown'} ${Device.modelName || 'Device'}`,
        osVersion: `${Device.osName || 'Unknown'} ${Device.osVersion || ''}`,
      };

      const response = await apiService.login({
        ...credentials,
        deviceInfo,
      });

      // Store token and guard data securely
      await SecureStore.setItemAsync('auth_token', response.token);
      await SecureStore.setItemAsync('guard_data', JSON.stringify(response.guard));

      setGuard(response.guard);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Clear secure storage
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('guard_data');

      setGuard(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshGuardData = async () => {
    try {
      const profile = await apiService.getProfile();
      const updatedGuard = {
        id: profile.id,
        username: profile.username,
        status: profile.status,
        shiftStartTime: profile.shiftStartTime,
        shiftEndTime: profile.shiftEndTime,
        organization: profile.organization,
      };

      await SecureStore.setItemAsync('guard_data', JSON.stringify(updatedGuard));
      setGuard(updatedGuard);
    } catch (error) {
      console.error('Refresh guard data error:', error);
      throw error;
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        guard,
        login,
        logout,
        refreshGuardData,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};