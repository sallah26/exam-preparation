"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Debug logging
  console.log(
    `[ProtectedRoute] isAuthenticated: ${isAuthenticated}, isLoading: ${isLoading}, user: ${
      user?.email || "None"
    }`
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log(`[ProtectedRoute] Redirecting to ${redirectTo}`);
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    console.log(`[ProtectedRoute] Showing loading state`);
    return <>{fallback}</>;
  }

  // Show loading while redirecting
  if (!isAuthenticated) {
    console.log(`[ProtectedRoute] User not authenticated, showing loading`);
    return <>{fallback}</>;
  }

  // Check if user is active (additional protection)
  if (user && !user.isActive) {
    console.log(`[ProtectedRoute] User account inactive`);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Account Inactive
          </h1>
          <p className="text-gray-600">
            Your account has been deactivated. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and active, render children
  console.log(`[ProtectedRoute] Rendering protected content`);
  return <>{children}</>;
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
