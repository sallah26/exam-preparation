"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React from "react";

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  console.log("isAuthenticated", isAuthenticated);
  return (
    <header
      className={`${
        isAuthenticated
          ? "hidden"
          : "bg-white/50 backdrop-blur-md shadow-sm border-b border-border/50 sticky top-0 z-[12121212]"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  C
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                COC Exam Portal
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/auth/login")}
              className=" hover:text-foreground border-2 hover:bg-primary hover:text-primary-foreground hover:cursor-pointer text-primary border-primary px-4 py-2 rounded-lg text-base font-medium transition-colors">
              Login
            </button>
            <button
              onClick={() => router.push("/auth/register")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg text-base font-medium hover:cursor-pointer transition-all shadow-md hover:shadow-lg">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
