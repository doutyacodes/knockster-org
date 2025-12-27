// services/apiService.ts

import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL - Replace with your actual API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
  deviceInfo?: {
    deviceId?: string;
    deviceModel?: string;
    osVersion?: string;
  };
}

export interface LoginResponse {
  token: string;
  guard: {
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
  };
}

// Recent Scan Event Type
export interface RecentScanEvent {
  id: string;
  timestamp: string;
  success: boolean;
  failureReason: string | null;
  securityLevel: number;
  guestName: string;
  guestPhone: string;
  invitationStatus: string;
}

// Dashboard Types
export interface DashboardStats {
  stats: {
    today: {
      total: number;
      successful: number;
      failed: number;
      successRate: number;
    };
    allTime: {
      total: number;
      successful: number;
      failed: number;
      successRate: number;
    };
    activeInvitations: number;
  };
  recentActivity: RecentScanEvent[];
}

// QR Types
export interface GuardQRResponse {
  qrCode: string;
  profile: {
    id: string;
    username: string;
    status: string;
    shiftStartTime: string | null;
    shiftEndTime: string | null;
    organization: {
      id: string;
      name: string;
      type: string;
    };
  };
}

// Scan Types
export interface ScanGuestRequest {
  invitationId: string;
  qrCode: string;
}

export interface ScanGuestResponse {
  status: 'success' | 'pending_otp';
  message: string;
  invitation: {
    id: string;
    guestName: string | null;
    guestPhone: string;
    employeeName: string;
    employeePhone: string;
    securityLevel: number;
    validFrom: string;
    validTo: string;
    organization: {
      name: string;
      type: string;
    };
    isPreApproved: boolean;
  };
}

// OTP Types
export interface VerifyOTPRequest {
  invitationId: string;
  qrCode: string;
  otpCode: string;
}

export interface VerifyOTPResponse {
  status: 'success';
  message: string;
  invitation: {
    id: string;
    guestName: string | null;
    guestPhone: string;
    employeeName: string;
    employeePhone: string;
    securityLevel: number;
    validFrom: string;
    validTo: string;
  };
}

// Profile Types
export interface GuardProfile {
  id: string;
  username: string;
  status: string;
  shiftStartTime: string | null;
  shiftEndTime: string | null;
  createdAt: string;
  organization: {
    id: string;
    name: string;
    type: string;
  };
}

export interface UpdateProfileRequest {
  currentPassword: string;
  newPassword: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          await SecureStore.deleteItemAsync('auth_token');
        }
        return Promise.reject(error);
      }
    );
  }

  // Helper method to handle API responses
  private handleResponse<T>(response: any): ApiResponse<T> {
    return response.data;
  }

  // Helper method to handle API errors
  private handleError(error: any): ApiResponse {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      return {
        success: false,
        error: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
      };
    }
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Login security personnel
   * POST /api/mobile-api/security/login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await this.api.post('/api/mobile-api/security/login', credentials);
      return this.handleResponse<LoginResponse>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Logout (optional - mainly clears local token)
   */
  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
  }

  // ==================== DASHBOARD ====================

  /**
   * Get security guard's dashboard stats
   * GET /api/mobile-api/security/dashboard
   */
  async getDashboard(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await this.api.get('/api/mobile-api/security/dashboard');
      return this.handleResponse<DashboardStats>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== QR CODE ====================

  /**
   * Get guard's QR code for L3/L4 verification
   * GET /api/mobile-api/security/qr
   */
  async getGuardQR(): Promise<ApiResponse<GuardQRResponse>> {
    try {
      const response = await this.api.get('/api/mobile-api/security/qr');
      return this.handleResponse<GuardQRResponse>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== SCANNING ====================

  /**
   * Scan guest QR code (L1/L2)
   * POST /api/mobile-api/security/scan-guest
   */
  async scanGuest(invitationId: string, qrCode: string): Promise<ApiResponse<ScanGuestResponse>> {
    try {
      const response = await this.api.post('/api/mobile-api/security/scan-guest', {
        invitationId,
        qrCode,
      });
      return this.handleResponse<ScanGuestResponse>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Verify OTP for L2/L4
   * POST /api/mobile-api/security/verify-otp
   */
  async verifyOtp(invitationId: string, qrCode: string, otpCode: string): Promise<ApiResponse<VerifyOTPResponse>> {
    try {
      const response = await this.api.post('/api/mobile-api/security/verify-otp', {
        invitationId,
        qrCode,
        otpCode,
      });
      return this.handleResponse<VerifyOTPResponse>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== PROFILE ====================

  /**
   * Get security guard's profile
   * GET /api/mobile-api/security/profile
   */
  async getProfile(): Promise<ApiResponse<GuardProfile>> {
    try {
      const response = await this.api.get('/api/mobile-api/security/profile');
      return this.handleResponse<GuardProfile>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update security guard's profile (password change)
   * PATCH /api/mobile-api/security/profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await this.api.patch('/api/mobile-api/security/profile', data);
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;