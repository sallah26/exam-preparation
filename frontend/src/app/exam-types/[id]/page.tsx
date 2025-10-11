"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { studentExamApi } from "@/lib/exam-api";
import { Department } from "@/types/exam";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Navbar from "@/components/navbar";
import Breadcrumb from "@/components/Breadcrumb";
import { generateBreadcrumbItems } from "@/utils/breadcrumb-utils";

export default function ExamTypePage() {
  const router = useRouter();
  const params = useParams();
  const examTypeId = params.id as string;

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examTypeName, setExamTypeName] = useState<string>("");
  const [examTypeIdState, setExamTypeIdState] = useState<string>("");

  useEffect(() => {
    if (examTypeId) {
      loadDepartments();
    }
  }, [examTypeId]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await studentExamApi.getDepartments(examTypeId);
      if (response.success && response.data) {
        setDepartments(response.data);
        // Get exam type name from first department if available
        if (response.data.length > 0) {
          setExamTypeName(response.data[0].examType?.name || "Exam Type");
          setExamTypeIdState(response.data[0].examType?.id || examTypeId);
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentClick = (departmentId: string) => {
    router.push(`/departments/${departmentId}`);
  };

  const handleBackClick = () => {
    router.back();
  };

  // Generate breadcrumb items
  const breadcrumbItems = generateBreadcrumbItems({
    examType:
      examTypeIdState && examTypeName
        ? {
            id: examTypeIdState,
            name: examTypeName,
            description: "",
            createdAt: "",
            updatedAt: "",
            departments: departments,
          }
        : undefined,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-indigo-400/50">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Available Departments
          </h2>
          <p className="text-lg text-gray-600">
            Choose a department to explore study materials and resources.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load departments
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadDepartments}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Try Again
            </button>
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No departments available
            </h3>
            <p className="text-gray-600">
              This exam type doesn't have any departments yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <div
                key={department.id}
                onClick={() => handleDepartmentClick(department.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 cursor-pointer border border-gray-200 hover:border-indigo-300">
                <div className="flex items-center mb-4">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {department.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {department.academicPeriods?.length || 0} periods
                  </span>
                  <div className="text-indigo-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
