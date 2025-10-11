"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { studentExamApi } from "@/lib/exam-api";
import { Material, MaterialType } from "@/types/exam";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Breadcrumb from "@/components/Breadcrumb";
import { generateBreadcrumbItems } from "@/utils/breadcrumb-utils";

export default function PeriodPage() {
  const router = useRouter();
  const params = useParams();
  const periodId = params.id as string;

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodName, setPeriodName] = useState<string>("");
  const [departmentName, setDepartmentName] = useState<string>("");
  const [examTypeName, setExamTypeName] = useState<string>("");
  const [periodIdState, setPeriodIdState] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [examTypeId, setExamTypeId] = useState<string>("");

  useEffect(() => {
    if (periodId) {
      loadMaterials();
    }
  }, [periodId]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await studentExamApi.getMaterials(periodId);
      if (response.success && response.data) {
        setMaterials(response.data);
        if (response.data.length > 0) {
          const period = response.data[0].academicPeriod;
          setPeriodName(period?.name || "Academic Period");
          setDepartmentName(period?.department?.name || "");
          setExamTypeName(period?.department?.examType?.name || "");
          setPeriodIdState(period?.id || periodId);
          setDepartmentId(period?.department?.id || "");
          setExamTypeId(period?.department?.examType?.id || "");
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialClick = (materialId: string) => {
    router.push(`/materials/${materialId}`);
  };

  const handleDocumentDownload = (filename: string) => {
    const apiUrl = studentExamApi.getFileUrl(filename);
    const staticUrl = studentExamApi.getStaticFileUrl(filename);

    // Try API URL first, then static URL as fallback
    fetch(apiUrl)
      .then((response) => {
        if (response.ok) {
          window.open(apiUrl, "_blank");
        } else {
          console.log("API URL failed, trying static URL");
          window.open(staticUrl, "_blank");
        }
      })
      .catch(() => {
        console.log("API URL failed, trying static URL");
        window.open(staticUrl, "_blank");
      });
  };

  const getMatTypeIcon = (type: MaterialType) => {
    if (type === MaterialType.DOCUMENT) {
      return (
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
      );
    } else {
      return (
        <svg
          className="h-6 w-6 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    }
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
      departmentId && departmentName
        ? {
            id: departmentId,
            name: departmentName,
            examTypeId: examTypeId,
            createdAt: "",
            updatedAt: "",
            academicPeriods: [],
          }
        : undefined,
    academicPeriod:
      periodIdState && periodName
        ? {
            id: periodIdState,
            name: periodName,
            departmentId: departmentId,
            createdAt: "",
            updatedAt: "",
            materials: materials,
          }
        : undefined,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-md">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                📅 {periodName}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/auth/login")}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </button>
              <button
                onClick={() => router.push("/auth/register")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Study Materials
          </h2>
          <p className="text-lg text-gray-600">
            Access documents, practice questions, and other study resources.
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
              Failed to load materials
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadMaterials}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Try Again
            </button>
          </div>
        ) : materials.length === 0 ? (
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No materials available
            </h3>
            <p className="text-gray-600">
              This academic period doesn't have any study materials yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-indigo-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div
                      className={`rounded-lg p-3 mr-4 ${
                        material.type === MaterialType.DOCUMENT
                          ? "bg-blue-100"
                          : "bg-green-100"
                      }`}>
                      {getMatTypeIcon(material.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {material.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {material.type === MaterialType.DOCUMENT
                          ? "Document"
                          : "Questions"}
                      </p>
                    </div>
                  </div>

                  {material.type === MaterialType.DOCUMENT &&
                  material.documents &&
                  material.documents.length > 0 ? (
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-gray-600 mb-2">
                        {material.documents.length} file(s)
                      </p>
                      {material.documents.map((doc, index) => (
                        <div
                          key={doc.id}
                          className="border rounded p-2 mb-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {doc.originalName}
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleMaterialClick(material.id)}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-medium">
                              View
                            </button>
                            <button
                              onClick={() =>
                                handleDocumentDownload(doc.filePath)
                              }
                              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium">
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-4">
                        {material.questions?.length || 0} practice questions
                      </p>
                      <button
                        onClick={() => handleMaterialClick(material.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Start Practice
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
