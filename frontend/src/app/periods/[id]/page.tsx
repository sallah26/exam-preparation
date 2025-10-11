"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { studentExamApi } from "@/lib/exam-api";
import { Material, MaterialType, Document } from "@/types/exam";
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

  // Helper function to get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return (
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    } else if (fileType === "application/pdf") {
      return (
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    } else if (
      fileType.includes("word") ||
      fileType.includes("document") ||
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return (
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    } else if (
      fileType.includes("excel") ||
      fileType.includes("spreadsheet") ||
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return (
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    } else if (
      fileType.includes("powerpoint") ||
      fileType.includes("presentation") ||
      fileType === "application/vnd.ms-powerpoint" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return (
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      );
    } else if (fileType.includes("video/")) {
      return (
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    } else if (fileType.includes("audio/")) {
      return (
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      );
    } else if (fileType.includes("zip") || fileType.includes("compressed")) {
      return (
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    }
  };

  // Helper function to get file type label
  const getFileTypeLabel = (fileType: string) => {
    if (fileType.startsWith("image/")) return "Image";
    if (fileType === "application/pdf") return "PDF";
    if (
      fileType.includes("word") ||
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      return "Word Document";
    if (
      fileType.includes("excel") ||
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
      return "Excel Spreadsheet";
    if (
      fileType.includes("powerpoint") ||
      fileType === "application/vnd.ms-powerpoint" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    )
      return "PowerPoint";
    if (fileType.includes("video/")) return "Video";
    if (fileType.includes("audio/")) return "Audio";
    if (fileType.includes("zip") || fileType.includes("compressed"))
      return "Archive";
    return "Document";
  };

  // Helper function to get file type color
  const getFileTypeColor = (fileType: string) => {
    if (fileType.startsWith("image/"))
      return "bg-purple-100 text-purple-800 border-purple-200";
    if (fileType === "application/pdf")
      return "bg-red-100 text-red-800 border-red-200";
    if (fileType.includes("word"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (fileType.includes("excel"))
      return "bg-green-100 text-green-800 border-green-200";
    if (fileType.includes("powerpoint"))
      return "bg-orange-100 text-orange-800 border-orange-200";
    if (fileType.includes("video/"))
      return "bg-pink-100 text-pink-800 border-pink-200";
    if (fileType.includes("audio/"))
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (fileType.includes("zip") || fileType.includes("compressed"))
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to handle download
  const handleDownload = async (document: Document) => {
    const fileUrl = studentExamApi.getFileUrl(document.filePath);
    const staticFileUrl = studentExamApi.getStaticFileUrl(document.filePath);

    try {
      const response = await fetch(fileUrl);
      if (response.ok) {
        // Create a blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = document.originalName;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      } else {
        // Fallback to static URL
        window.open(staticFileUrl, "_blank");
      }
    } catch (error) {
      // Fallback to static URL
      window.open(staticFileUrl, "_blank");
    }
  };

  // Get question materials
  const questionMaterials = materials.filter(
    (m) => m.type === MaterialType.QUESTION
  );

  // Get all documents from all materials
  const allDocuments = materials
    .filter((m) => m.type === MaterialType.DOCUMENT && m.documents)
    .flatMap((m) => m.documents || []);

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
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
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
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-20 w-20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No materials available
            </h3>
            <p className="text-gray-600">
              This academic period doesn't have any study materials yet.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Question Materials Section */}
            {questionMaterials.length > 0 && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <svg
                        className="w-6 h-6 text-white"
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
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Practice Questions
                    </h2>
                  </div>
                  <p className="text-gray-600 ml-14">
                    Test your knowledge with MCQ practice sets
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {questionMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1 cursor-pointer"
                      onClick={() => handleMaterialClick(material.id)}>
                      {/* Header */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center border-b border-gray-100">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-green-100 text-green-800 border border-green-200 transition-transform duration-300 group-hover:scale-110">
                          <svg
                            className="w-12 h-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                            {material.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200">
                            MCQ Questions
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span>
                            {material.questions?.length || 0} Questions
                          </span>
                        </div>

                        <button
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMaterialClick(material.id);
                          }}>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Start Practice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Section */}
            {allDocuments.length > 0 && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Study Materials & Documents
                    </h2>
                  </div>
                  <p className="text-gray-600 ml-14">
                    Download course materials and resources
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allDocuments.map((document) => {
                    const iconColor = getFileTypeColor(document.fileType);

                    return (
                      <div
                        key={document.id}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1">
                        {/* File Icon Header */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-center border-b border-gray-100">
                          <div
                            className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
                            {getFileIcon(document.fileType)}
                          </div>
                        </div>

                        {/* File Details */}
                        <div className="p-6 space-y-4">
                          {/* File Name */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              {document.originalName}
                            </h3>
                          </div>

                          {/* File Type Badge */}
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${iconColor}`}>
                              {getFileTypeLabel(document.fileType)}
                            </span>
                          </div>

                          {/* Upload Date */}
                          <div className="flex items-center text-sm text-gray-500">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              Uploaded {formatDate(document.createdAt)}
                            </span>
                          </div>

                          {/* Download Button */}
                          <button
                            onClick={() => handleDownload(document)}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group">
                            <svg
                              className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Download File
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State - when no questions and no documents */}
            {questionMaterials.length === 0 && allDocuments.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-20 w-20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No content available
                </h3>
                <p className="text-gray-600">
                  This academic period doesn't have any content yet.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
