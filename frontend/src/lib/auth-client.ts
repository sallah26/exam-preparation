'use client';

import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp?: number;
  adminId: string;
  email: string;
  fullName: string;
  type: 'access' | 'refresh';
  [key: string]: unknown;
}

interface AuthUser {
  id: string;
  fullName?: string; // For admins
  name?: string;      // For users
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  isSuperAdmin?: boolean; // For admin accounts
  type?: 'user' | 'admin'; // Backend user type
  createdAt: string;
  updatedAt?: string;
}

// Client-side functions
export function getAuthJwtClient(): { token?: string; isValid: boolean; error?: string } {
  try {
    // Get access token from cookie (client-side)
    const token = Cookies.get('accessToken');

    if (!token) {
      console.log('No access token found (client)')
      return { isValid: false, error: 'No token found' }
    }

    // Decode token to check expiration (frontend validation only)
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Math.floor(Date.now() / 1000)
    
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('Token has expired (client)')
      removeAuthClient()
      return { token: undefined, isValid: false, error: 'Token expired' }
    }

    // Token appears valid (backend will do final verification)
    console.log('Valid token found (client)')
    return { token, isValid: true }
  } catch (error) {
    console.error('Error checking token (client):', error)
    removeAuthClient()
    return { isValid: false, error: 'Invalid token' }
  }
}

export function saveAuthClient(token: string, user?: AuthUser) {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Set access token cookie (client-side)
    Cookies.set('accessToken', token, {
      expires: decoded.exp ? new Date(decoded.exp * 1000) : undefined,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Save user data if provided
    if (user) {
      Cookies.set('user', JSON.stringify(user), {
        expires: decoded.exp ? new Date(decoded.exp * 1000) : undefined,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    }

  } catch (error) {
    console.error('Error saving auth (client):', error)
  }
}

export function getAuthUserClient(): AuthUser | null {
  const jwt = getAuthJwtClient();
  if (!jwt.token) {
    removeAuthClient();
    return null;
  }
  
  try {
    const userString = Cookies.get('user');
    return userString ? (JSON.parse(userString) as AuthUser) : null;
  } catch (error) {
    console.error('Error getting auth user (client):', error)
    return null;
  }
}

export function removeAuthClient() {
  try {
    // Clear both access token and user cookies (client-side)
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
  } catch (error) {
    console.error('Error removing auth (client):', error)
  }
}

// Helper function to get refresh token (client-side)
export function getRefreshTokenClient(): string | null {
  try {
    return Cookies.get('refreshToken') || null;
  } catch (error) {
    console.error('Error getting refresh token (client):', error)
    return null;
  }
} 