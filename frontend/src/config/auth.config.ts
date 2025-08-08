// Auth configuration constants
export const authExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

// Token expiration times (matching backend)
export const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Cookie names (matching backend)
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

// Auth routes (matching backend)
export const AUTH_ROUTES = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/admin/register',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/auth/profile',
  SESSIONS: '/api/auth/sessions',
} as const;

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/profile',
  '/settings',
] as const;

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/forgot-password',
] as const;