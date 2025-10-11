"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { studentExamApi } from "@/lib/exam-api";
import { AcademicPeriod } from "@/types/exam";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Breadcrumb from "@/components/Breadcrumb";
import { generateBreadcrumbItems } from "@/utils/breadcrumb-utils";

export default function DepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const departmentId = params.id as string;

  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [examTypeName, setExamTypeName] = useState<string>("");
  const [departmentIdState, setDepartmentIdState] = useState<string>("");
  const [examTypeId, setExamTypeId] = useState<string>("");

  useEffect(() => {
    if (departmentId) {
      loadAcademicPeriods();
    }
  }, [departmentId]);

  const loadAcademicPeriods = async () => {
    try {
      setLoading(true);
      const response = await studentExamApi.getAcademicPeriods(departmentId);
      if (response.success && response.data) {
        setAcademicPeriods(response.data);
        if (response.data.length > 0) {
          setDepartmentName(response.data[0].department?.name || "Department");
          setExamTypeName(response.data[0].department?.examType?.name || "");
          setDepartmentIdState(response.data[0].department?.id || departmentId);
          setExamTypeId(response.data[0].department?.examType?.id || "");
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load academic periods");
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodClick = (periodId: string) => {
    router.push(`/periods/${periodId}`);
  };

  // Generate breadcrumb items
  const breadcrumbItems = generateBreadcrumbItems({
    examType:
      examTypeId && examTypeName
        ? {
            id: examTypeId,
            name: examTypeName,
            description: "",
            createdAt: "",
            updatedAt: "",
            departments: [],
          }
        : undefined,
    department:
      departmentIdState && departmentName
        ? {
            id: departmentIdState,
            name: departmentName,
            examTypeId: examTypeId,
            createdAt: "",
            updatedAt: "",
            academicPeriods: academicPeriods,
          }
        : undefined,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Academic Periods
          </h2>
          <p className="text-lg text-gray-600">
            Select an academic period to access study materials and resources.
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
              Failed to load academic periods
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadAcademicPeriods}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Try Again
            </button>
          </div>
        ) : academicPeriods.length === 0 ? (
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
                  d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4m0-10V7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No academic periods available
            </h3>
            <p className="text-gray-600">
              This department doesn't have any academic periods yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academicPeriods.map((period) => (
              <div
                key={period.id}
                onClick={() => handlePeriodClick(period.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 cursor-pointer border border-gray-200 hover:border-indigo-300">
                <div className="flex items-center mb-4">
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
                        d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4m0-10V7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {period.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {period.materials?.length || 0} materials
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
