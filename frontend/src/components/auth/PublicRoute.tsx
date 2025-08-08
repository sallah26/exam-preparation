"use client";

import React, { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PublicRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function PublicRoute({
  children,
  fallback = <div>Loading...</div>,
  redirectTo = "/dashboard",
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log(
        `[PublicRoute] User authenticated, redirecting to ${redirectTo}`
      );
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Show loading while redirecting
  if (isAuthenticated) {
    return <>{fallback}</>;
  }

  // User is not authenticated, render children
  return <>{children}</>;
}

// Higher-order component for public pages
export function withPublic<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
) {
  return function PublicComponent(props: P) {
    return (
      <PublicRoute redirectTo={redirectTo}>
        <Component {...props} />
      </PublicRoute>
    );
  };
}
