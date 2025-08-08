// Auth API functions
export { authApi, api } from '../api';

// Auth token utilities
export {
  getAuthJwt,
  saveAuth,
  getAuthUser,
  removeAuth,
  getRefreshToken,
} from '../auth-token';

// Auth utilities
export {
  isAdmin,
  getUserDisplayName,
  getUserInitials,
  formatUserCreatedAt,
  isRecentUser,
} from '../auth-utils';

// Auth types
export type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthState,
  AuthContextType,
  ApiResponse,
  LoginResponse,
  RegisterResponse,
} from '@/types/auth'; 