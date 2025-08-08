import { fetcher, fetcherNoAuth } from './fetcher';
import { AUTH_ROUTES } from '@/config/auth.config';
import { removeAuthClient } from './auth-client';
import { RegisterCredentials } from '@/types/auth';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth API functions
export const authApi = {
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    try {
      const response = await fetcherNoAuth.post(AUTH_ROUTES.LOGIN, credentials);
      
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
        };
      }
      
      return {
        success: false,
        message: response.data?.message || 'Login failed',
      };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message 
        : undefined;
      return {
        success: false,
        message: errorMessage || 'Login failed',
      };
    }
  },

  async register(credentials: RegisterCredentials): Promise<ApiResponse> {
    try {
      const response = await fetcherNoAuth.post(AUTH_ROUTES.REGISTER, credentials);
      
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data,
        };
      }
      
      return {
        success: false,
        message: response.data?.message || 'Registration failed',
      };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message 
        : undefined;
      return {
        success: false,
        message: errorMessage || 'Registration failed',
      };
    }
  },

  async logout(): Promise<ApiResponse> {
    try {
      await fetcher.post(AUTH_ROUTES.LOGOUT);
      removeAuthClient();
      return { success: true, message: 'Logged out successfully' };
    } catch (error: unknown) {
      removeAuthClient();
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message 
        : undefined;
      return {
        success: false,
        message: errorMessage || 'Logout failed',
      };
    }
  },

  async getProfile(): Promise<ApiResponse> {
    try {
      const response = await fetcher.get(AUTH_ROUTES.PROFILE);
      return {
        success: true,
        message: response.data?.message || 'Profile retrieved',
        data: response.data?.data,
      };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message 
        : undefined;
      return {
        success: false,
        message: errorMessage || 'Failed to get profile',
      };
    }
  },
};

// Generic API functions
export const api = {
  async get<T = unknown>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetcher.get<T>(url);
      const responseData = response.data as { message?: string };
      return {
        success: true,
        message: responseData?.message || 'Request successful',
        data: response.data,
      };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message 
        : undefined;
      return {
        success: false,
        message: errorMessage || 'Request failed',
      };
    }
  },

  async post<T = unknown>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetcher.post<T>(url, data);
      const responseData = response.data as { message?: string };
      return {
        success: true,
        message: responseData?.message || 'Request successful',
        data: response.data,
      };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { message?: string })?.message 
        : undefined;
      return {
        success: false,
        message: errorMessage || 'Request failed',
      };
    }
  },
}; 