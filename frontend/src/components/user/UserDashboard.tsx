"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { studentExamApi } from "@/lib/exam-api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getUserDisplayName } from "@/lib/auth-utils";

interface ExamType {
  id: string;
  name: string;
  description: string;
  departments: Department[];
}

interface Department {
  id: string;
  name: string;
  academicPeriods: AcademicPeriod[];
}

interface AcademicPeriod {
  id: string;
  name: string;
  materials?: Material[];
}

interface Material {
  id: string;
  title: string;
  type: string;
  questionsCount?: number;
  documentsCount?: number;
}

interface UserProgress {
  totalMaterials: number;
  completedMaterials: number;
  totalTimeSpent: number;
  recentActivity: string[];
}

export function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "browse" | "progress"
  >("overview");
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load exam types for browsing
      const examTypesResponse = await studentExamApi.getExamTypes();
      if (examTypesResponse.success && examTypesResponse.data) {
        setExamTypes(examTypesResponse.data);
      }

      // Load user progress (if user is authenticated)
      if (user) {
        // TODO: Implement user progress API
        setUserProgress({
          totalMaterials: 0,
          completedMaterials: 0,
          totalTimeSpent: 0,
          recentActivity: [],
        });
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseExamType = (examTypeId: string) => {
    window.location.href = `/exam-types/${examTypeId}`;
  };

  const handleViewMaterial = (materialId: string) => {
    window.location.href = `/materials/${materialId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {getUserDisplayName(user)}! 📚
        </h1>
        <p className="text-blue-100">
          Continue your learning journey with our comprehensive study materials.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            Overview
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "browse"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            Browse Materials
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "progress"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            My Progress
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {userProgress?.completedMaterials || 0}
                    </p>
                    <p className="text-gray-600">Completed Materials</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor((userProgress?.totalTimeSpent || 0) / 60)}h
                    </p>
                    <p className="text-gray-600">Study Time</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path d="M4 5a2 2 0 012-2v1a1 1 0 002 0V3a2 2 0 012 2v6h-8V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {examTypes.length}
                    </p>
                    <p className="text-gray-600">Available Exams</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              {userProgress?.recentActivity?.length ? (
                <div className="space-y-2">
                  {userProgress.recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="text-gray-600">
                      {activity}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No recent activity yet. Start exploring materials!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Browse Materials Tab */}
        {activeTab === "browse" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Explore Study Materials by Exam Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examTypes.map((examType) => (
                  <div
                    key={examType.id}
                    className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleBrowseExamType(examType.id)}>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {examType.name}
                    </h4>
                    <p className="text-gray-600 mb-4">{examType.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        {examType.departments?.length || 0} departments
                      </span>
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Learning Progress
              </h3>

              {user ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Overall Progress</span>
                      <span>
                        {userProgress?.completedMaterials || 0} /{" "}
                        {userProgress?.totalMaterials || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: userProgress?.totalMaterials
                            ? `${
                                (userProgress.completedMaterials /
                                  userProgress.totalMaterials) *
                                100
                              }%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-gray-600">
                      Keep going! Your dedication to learning is commendable.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Sign in to track your learning progress and access
                    personalized features.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/auth/login")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
