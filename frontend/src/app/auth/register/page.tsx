"use client";

import React, { useState } from "react";
import { PublicRoute } from "@/components/auth/PublicRoute";
import { RegisterCredentials } from "@/types/auth";
import { authApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<
    Partial<RegisterCredentials & { confirmPassword: string }>
  >({});
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));

    // Clear form error when user starts typing
    if (formErrors[name as keyof RegisterCredentials]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear registration error when user starts typing
    if (registrationError) {
      setRegistrationError(null);
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (formErrors.confirmPassword) {
      setFormErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }

    if (registrationError) {
      setRegistrationError(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<RegisterCredentials & { confirmPassword: string }> =
      {};

    // Name validation
    if (!credentials.name) {
      errors.name = "Name is required";
    } else if (credentials.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (credentials.name.length > 100) {
      errors.name = "Name must be less than 100 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(credentials.name)) {
      errors.name = "Name can only contain letters and spaces";
    }

    // Email validation
    if (!credentials.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = "Email is invalid";
    } else if (credentials.email.length < 5) {
      errors.email = "Email must be at least 5 characters";
    } else if (credentials.email.length > 255) {
      errors.email = "Email must be less than 255 characters";
    }

    // Password validation - simplified
    if (!credentials.password) {
      errors.password = "Password is required";
    } else if (credentials.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (credentials.password.length > 128) {
      errors.password = "Password must be less than 128 characters";
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (credentials.password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setRegistrationError(null);

    try {
      // Call the API directly to get the specific error message
      const response = await authApi.register(credentials);

      if (response.success) {
        // Show success dialog
        setShowSuccessDialog(true);
      } else {
        // Show the specific error message from the API
        setRegistrationError(response.message);
      }
    } catch (error) {
      setRegistrationError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    router.push("/auth/login");
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8 border p-8 shadow-2xl rounded-2xl">
          <div className="w-full">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>

            {/* Registration Error Display */}
            {registrationError && (
              <div className="mt-4 text-center">
                <p className="text-sm text-red-600 font-medium">
                  {registrationError}
                </p>
              </div>
            )}
          </div>

          <form
            className="mt-8 space-y-4"
            onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                    formErrors.name ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Enter your full name"
                  value={credentials.name}
                  onChange={handleInputChange}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                    formErrors.email ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={handleInputChange}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                    formErrors.password ? "border-red-300" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Create a strong password"
                  value={credentials.password}
                  onChange={handleInputChange}
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.password}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`mt-1 appearance-none relative block w-full px-3 py-3 border ${
                    formErrors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
            <p className="mt text-center text-sm text-gray-600">
              Or{" "}
              <Link
                href="/auth/login"
                className="font-medium text-indigo-600 hover:text-indigo-500">
                sign in to your existing account
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">
              Registration Successful!
            </DialogTitle>
            <DialogDescription>
              Your account has been created successfully. You can now sign in
              with your new credentials.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleSuccessDialogClose}
              className="w-full">
              Continue to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicRoute>
  );
}
