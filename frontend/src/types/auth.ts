// Auth user interface (matches backend response)
export interface AuthUser {
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

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration credentials (for users only)
export interface RegisterCredentials {
  name: string;  // Changed from fullName to name for users
  email: string;
  password: string;
}

// Auth state interface
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
export type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: AuthUser }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" };

// API Response interfaces
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: AuthUser;
    admin?: AuthUser;
    tokens: {
      accessToken?: string;
      accessExpiresIn: string;
      refreshToken?: string;
      refreshExpiresIn?: string;
    };
  };
}

// Admin management types
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: {
    fullName: string;
    email: string;
  };
}

export interface CreateAdminData {
  fullName: string;
  email: string;
  password: string;
  isSuperAdmin?: boolean;
}

// Auth context interface
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
} 