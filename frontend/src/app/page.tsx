"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect once and when loading is complete
    if (!isLoading && !hasRedirected) {
      setHasRedirected(true);

      if (isAuthenticated) {
        console.log("[HomePage] User authenticated, redirecting to dashboard");
        router.replace("/dashboard");
      } else {
        console.log("[HomePage] User not authenticated, redirecting to login");
        router.replace("/auth/login");
      }
    }
  }, [isAuthenticated, isLoading, router, hasRedirected]);

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
