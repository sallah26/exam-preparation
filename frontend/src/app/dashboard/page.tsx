"use client";

import React, { useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // Memoize the auth state to prevent unnecessary re-renders
  const authState = useMemo(
    () => ({ user, isAuthenticated, isLoading }),
    [user, isAuthenticated, isLoading]
  );

  // Only log once per state change
  React.useEffect(() => {}, [authState]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      // Use replace instead of push to prevent back button issues
      router.replace("/auth/login");
    } catch (error) {
      // Even if logout fails, redirect to login
      router.replace("/auth/login");
    }
  }, [logout, router]);

  const handleTestPush = useCallback(() => {
    router.push("/auth/login");
  }, [router]);

  const handleTestReplace = useCallback(() => {
    router.replace("/auth/login");
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Not Authenticated
          </h1>
          <p className="text-gray-600">Please login to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.fullName || "User"}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
            <p className="text-gray-600">
              You are successfully logged in as: <strong>{user?.email}</strong>
            </p>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800">Auth Debug Info:</h3>
              <pre className="mt-2 text-sm text-green-700">
                {JSON.stringify({ user, isAuthenticated, isLoading }, null, 2)}
              </pre>
            </div>

            {/* Test Navigation */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Navigation Test:</h3>
              <div className="mt-2 space-x-2">
                <button
                  onClick={handleTestPush}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                  Test Push to Login
                </button>
                <button
                  onClick={handleTestReplace}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                  Test Replace to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
