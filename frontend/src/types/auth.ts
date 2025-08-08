// Auth user interface (matches backend AdminResponse)
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration credentials
export interface RegisterCredentials {
  fullName: string;
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

// Auth context interface
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Login response type
export interface LoginResponse {
  admin: AuthUser;
  tokens: {
    accessExpiresIn: string;
    refreshExpiresIn: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

// Register response type
export interface RegisterResponse {
  admin: AuthUser;
  message: string;
} 