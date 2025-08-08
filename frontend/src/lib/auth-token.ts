'use server';

import { cookies } from 'next/headers';
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
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Server-side functions
export async function getAuthJwt(): Promise<{ token?: string; isValid: boolean; error?: string }> {
  try {
    const cookieStore = await cookies()
    // Get access token from cookie (matches backend cookie name)
    const token = cookieStore.get('accessToken')?.value

    if (!token) {
      console.log('No access token found')
      return { isValid: false, error: 'No token found' }
    }

    // Decode token to check expiration (frontend validation only)
    const decoded = jwtDecode<DecodedToken>(token)
    const currentTime = Math.floor(Date.now() / 1000)
    
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('Token has expired')
      await removeAuth()
      return { token: undefined, isValid: false, error: 'Token expired' }
    }

    // Token appears valid (backend will do final verification)
    console.log('Valid token found')
    return { token, isValid: true }
  } catch (error) {
    console.error('Error checking token:', error)
    await removeAuth()
    return { isValid: false, error: 'Invalid token' }
  }
}

export async function saveAuth(token: string, user?: AuthUser) {
  try {
    const cookieStore = await cookies();
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Set access token cookie (matches backend cookie settings)
    cookieStore.set({
      name: 'accessToken',
      httpOnly: process.env.NODE_ENV === 'production',
      value: token,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: decoded.exp ? new Date(decoded.exp * 1000) : undefined,
    });

    // Save user data if provided
    if (user) {
      cookieStore.set({
        name: 'user',
        httpOnly: process.env.NODE_ENV === 'production',
        value: JSON.stringify(user),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: decoded.exp ? new Date(decoded.exp * 1000) : undefined,
      });
    }

  } catch (error) {
    console.error('Error saving auth:', error)
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const jwt = await getAuthJwt();
  if (!jwt.token) {
    await removeAuth();
    return null;
  }
  
  try {
    const cookieStore = await cookies();
    const userString = cookieStore.get('user')?.value;
    return userString ? (JSON.parse(userString) as AuthUser) : null;
  } catch (error) {
    console.error('Error getting auth user:', error)
    return null;
  }
}

export async function removeAuth() {
  try {
    const cookieStore = await cookies();
    // Clear both access token and user cookies (matches backend cookie names)
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('user');
  } catch (error) {
    console.error('Error removing auth:', error)
  }
}

// Helper function to get refresh token
export async function getRefreshToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('refreshToken')?.value || null;
  } catch (error) {
    console.error('Error getting refresh token:', error)
    return null;
  }
}