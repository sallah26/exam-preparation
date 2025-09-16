"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  AuthContextType,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  AuthUser,
} from "@/types/auth";
import { authApi } from "@/lib/api";
import {
  getAuthUserClient,
  removeAuthClient,
  saveAuthClient,
} from "@/lib/auth-client";

// Initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth action types
type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: AuthUser }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("[AuthContext] Starting auth initialization");
        dispatch({ type: "SET_LOADING", payload: true });

        // Check if user is already authenticated (client-side)
        const user = getAuthUserClient();
        console.log("[AuthContext] User from client:", user);

        if (user) {
          console.log("[AuthContext] User found, dispatching success");
          dispatch({ type: "AUTH_SUCCESS", payload: user });
        } else {
          console.log("[AuthContext] No user found, setting not authenticated");
          // Don't show error for initialization - just set as not authenticated
          dispatch({
            type: "AUTH_LOGOUT", // This sets isAuthenticated to false without error
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        dispatch({
          type: "AUTH_FAILURE",
          payload: "Failed to initialize authentication",
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      console.log("[AuthContext] Starting login process");
      dispatch({ type: "AUTH_START" });

      const response = await authApi.login(credentials);
      console.log("[AuthContext] Login response:", response);

      if (response.success && response.data) {
        // Handle both admin and user login responses
        const userData =
          (response.data as { admin?: AuthUser; user?: AuthUser }).admin ||
          (response.data as { admin?: AuthUser; user?: AuthUser }).user;
        console.log("[AuthContext] User data:", userData);

        if (!userData) {
          console.log("[AuthContext] No user data in response");
          dispatch({ type: "AUTH_FAILURE", payload: "No user data received" });
          return false;
        }

        // Save auth data client-side
        const responseData = response.data as {
          tokens?: { accessToken?: string };
        };
        if (responseData.tokens?.accessToken) {
          console.log("[AuthContext] Saving auth data client-side");
          saveAuthClient(responseData.tokens.accessToken, userData);
        }

        console.log("[AuthContext] Dispatching auth success");
        dispatch({ type: "AUTH_SUCCESS", payload: userData });
        return true;
      } else {
        console.log("[AuthContext] Login failed:", response.message);
        dispatch({ type: "AUTH_FAILURE", payload: response.message });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      dispatch({ type: "AUTH_FAILURE", payload: "Login failed" });
      return false;
    }
  };

  // Register function
  const register = async (
    credentials: RegisterCredentials
  ): Promise<boolean> => {
    try {
      dispatch({ type: "AUTH_START" });

      const response = await authApi.register(credentials);

      if (response.success && response.data) {
        // Registration successful, but user needs to login
        dispatch({
          type: "AUTH_FAILURE",
          payload:
            "Registration successful! Please login with your new account.",
        });
        return true;
      } else {
        dispatch({ type: "AUTH_FAILURE", payload: response.message });
        return false;
      }
    } catch (error) {
      console.error("Registration error:", error);
      dispatch({ type: "AUTH_FAILURE", payload: "Registration failed" });
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Call logout API
      await authApi.logout();

      // Clear local state
      removeAuthClient();
      dispatch({ type: "AUTH_LOGOUT" });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local state
      removeAuthClient();
      dispatch({ type: "AUTH_LOGOUT" });
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Refresh user data function
  const refreshUser = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await authApi.getProfile();

      if (response.success && response.data) {
        const userData = response.data as AuthUser;
        dispatch({ type: "AUTH_SUCCESS", payload: userData });
      } else {
        // If profile fetch fails, user might be logged out
        removeAuthClient();
        dispatch({ type: "AUTH_LOGOUT" });
      }
    } catch (error) {
      console.error("Refresh user error:", error);
      // If refresh fails, user might be logged out
      removeAuthClient();
      dispatch({ type: "AUTH_LOGOUT" });
    }
  };

  // Context value - memoize to prevent unnecessary re-renders
  const contextValue: AuthContextType = React.useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      clearError,
      refreshUser,
    }),
    [state, login, register, logout, clearError, refreshUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
