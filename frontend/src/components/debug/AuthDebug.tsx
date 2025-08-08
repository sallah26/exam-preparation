"use client";

import { useAuth } from "@/hooks/useAuth";
import { getAuthJwtClient } from "@/lib/auth-client";
import { useRef, useEffect } from "react";

export function AuthDebug() {
  const { isAuthenticated, isLoading, user, error } = useAuth();
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
  });

  const checkCookies = () => {
    const jwt = getAuthJwtClient();
    console.log("Cookie check:", jwt);
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Renders: {renderCount.current}</div>
        <div>Loading: {isLoading ? "Yes" : "No"}</div>
        <div>Authenticated: {isAuthenticated ? "Yes" : "No"}</div>
        <div>User: {user ? user.email : "None"}</div>
        <div>Error: {error || "None"}</div>
        <button
          onClick={checkCookies}
          className="bg-blue-600 px-2 py-1 rounded text-xs mt-2">
          Check Cookies
        </button>
      </div>
    </div>
  );
}
