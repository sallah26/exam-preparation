"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { adminExamApi, studentExamApi } from "@/lib/exam-api";
import { ExamType, CreateExamTypeData } from "@/types/exam";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // State for exam portal management
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loadingExamTypes, setLoadingExamTypes] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newExamType, setNewExamType] = useState<CreateExamTypeData>({
    name: "",
    description: "",
  });
  const [activeTab, setActiveTab] = useState<
    "overview" | "exam-types" | "student-view"
  >("overview");

  // Memoize the auth state to prevent unnecessary re-renders
  const authState = useMemo(
    () => ({ user, isAuthenticated, isLoading }),
    [user, isAuthenticated, isLoading]
  );

  useEffect(() => {
    if (isAuthenticated && activeTab === "exam-types") {
      loadExamTypes();
    }
  }, [isAuthenticated, activeTab]);

  const loadExamTypes = async () => {
    try {
      setLoadingExamTypes(true);
      const response = await adminExamApi.getExamTypes();
      if (response.success && response.data) {
        setExamTypes(response.data);
      }
    } catch (error) {
      console.error("Failed to load exam types:", error);
    } finally {
      setLoadingExamTypes(false);
    }
  };

  const handleCreateExamType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamType.name.trim()) return;

    try {
      const response = await adminExamApi.createExamType(newExamType);
      if (response.success) {
        setNewExamType({ name: "", description: "" });
        setShowCreateForm(false);
        loadExamTypes();
      }
    } catch (error) {
      console.error("Failed to create exam type:", error);
    }
  };

  const handleDeleteExamType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam type?")) return;

    try {
      const response = await adminExamApi.deleteExamType(id);
      if (response.success) {
        loadExamTypes();
      }
    } catch (error) {
      console.error("Failed to delete exam type:", error);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.replace("/auth/login");
    } catch (error) {
      router.replace("/auth/login");
    }
  }, [logout, router]);

  const handleViewStudentPortal = () => {
    window.open("/", "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
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
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleViewStudentPortal}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                View Student Portal
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.fullName || "Admin"}
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              Overview
            </button>
            <button
              onClick={() => setActiveTab("exam-types")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "exam-types"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              Exam Portal Management
            </button>
            <button
              onClick={() => setActiveTab("student-view")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "student-view"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
              Student View
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Welcome, {user?.fullName}!
                </h2>
                <p className="text-gray-600 mb-6">
                  Manage your exam portal, create study materials, and monitor
                  student progress.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-lg p-3 mr-4">
                        <svg
                          className="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Exam Types
                        </h3>
                        <p className="text-sm text-gray-600">
                          Manage different exam categories
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-lg p-3 mr-4">
                        <svg
                          className="h-6 w-6 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Study Materials
                        </h3>
                        <p className="text-sm text-gray-600">
                          Upload documents and create questions
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="bg-purple-100 rounded-lg p-3 mr-4">
                        <svg
                          className="h-6 w-6 text-purple-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Students
                        </h3>
                        <p className="text-sm text-gray-600">
                          Monitor student progress
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Exam Types Management Tab */}
          {activeTab === "exam-types" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Exam Types Management
                  </h2>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Create New Exam Type
                  </button>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                  <form
                    onSubmit={handleCreateExamType}
                    className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          value={newExamType.name}
                          onChange={(e) =>
                            setNewExamType({
                              ...newExamType,
                              name: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="e.g., CoC Exam"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={newExamType.description}
                          onChange={(e) =>
                            setNewExamType({
                              ...newExamType,
                              description: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Brief description of the exam type"
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCreateForm(false)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Exam Types List */}
                {loadingExamTypes ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : examTypes.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No exam types yet
                    </h3>
                    <p className="text-gray-600">
                      Create your first exam type to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {examTypes.map((examType) => (
                      <div
                        key={examType.id}
                        className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {examType.name}
                          </h3>
                          <button
                            onClick={() => handleDeleteExamType(examType.id)}
                            className="text-red-600 hover:text-red-700">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        {examType.description && (
                          <p className="text-gray-600 text-sm mb-3">
                            {examType.description}
                          </p>
                        )}
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>
                            {examType.departments?.length || 0} departments
                          </span>
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/exam-types/${examType.id}`
                              )
                            }
                            className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Manage →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student View Tab */}
          {activeTab === "student-view" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Student Portal Preview
              </h2>
              <p className="text-gray-600 mb-6">
                This is how students see the exam portal. You can test the
                student experience here.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <iframe
                  src="/"
                  className="w-full h-96 border border-gray-300 rounded-md"
                  title="Student Portal Preview"
                />
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={handleViewStudentPortal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium">
                  Open Student Portal in New Tab
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
