"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { studentExamApi } from "@/lib/exam-api";
import { Material, MaterialType, Question } from "@/types/exam";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import Breadcrumb from "@/components/Breadcrumb";
import { generateBreadcrumbItems } from "@/utils/breadcrumb-utils";

export default function MaterialPage() {
  const router = useRouter();
  const params = useParams();
  const materialId = params.id as string;

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (materialId) {
      loadMaterial();
    }
  }, [materialId]);

  const loadMaterial = async () => {
    try {
      setLoading(true);
      const response = await studentExamApi.getMaterialContent(materialId);
      if (response.success && response.data) {
        setMaterial(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load material");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNextQuestion = () => {
    if (
      material &&
      currentQuestionIndex < (material.questions?.length || 0) - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    if (!material?.questions) return 0;

    const correctAnswers = material.questions.filter((question) => {
      const selectedOptionId = selectedAnswers[question.id];
      const correctOption = question.options.find((opt) => opt.isCorrect);
      return selectedOptionId === correctOption?.id;
    });

    return Math.round(
      (correctAnswers.length / material.questions.length) * 100
    );
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
  const handleDownload = async (document: any) => {
    const fileUrl = studentExamApi.getFileUrl(document.filePath);
    const staticFileUrl = studentExamApi.getStaticFileUrl(document.filePath);

    try {
      const response = await fetch(fileUrl);
      if (response.ok) {
        // Create a blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = document.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Fallback to static URL
        window.open(staticFileUrl, "_blank");
      }
    } catch (error) {
      // Fallback to static URL
      window.open(staticFileUrl, "_blank");
    }
  };

  const renderDocumentViewer = () => {
    if (!material?.documents || material.documents.length === 0) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {material.documents.map((document) => {
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
                  <span>Uploaded {formatDate(document.createdAt)}</span>
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
    );
  };

  const renderQuestionViewer = () => {
    if (!material?.questions || material.questions.length === 0) {
      return null;
    }

    const currentQuestion = material.questions[currentQuestionIndex];
    const totalQuestions = material.questions.length;

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Question Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-indigo-200">
                <span className="text-sm font-semibold text-indigo-600">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!showAnswers && (
                <button
                  onClick={() => setShowAnswers(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Show Answers
                </button>
              )}
              {showAnswers && (
                <div className="bg-white px-5 py-2 rounded-lg shadow-sm border border-gray-200">
                  <span className="text-sm font-semibold text-gray-900">
                    Score:{" "}
                    <span className="text-indigo-600">{calculateScore()}%</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-8">
          <h4 className="text-xl font-semibold text-gray-900 mb-8 leading-relaxed">
            {currentQuestion.questionText}
          </h4>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected =
                selectedAnswers[currentQuestion.id] === option.id;
              const isCorrect = option.isCorrect;

              let optionClasses =
                "w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ";

              if (showAnswers) {
                if (isCorrect) {
                  optionClasses +=
                    "border-green-500 bg-green-50 text-green-900 shadow-sm";
                } else if (isSelected && !isCorrect) {
                  optionClasses +=
                    "border-red-500 bg-red-50 text-red-900 shadow-sm";
                } else {
                  optionClasses += "border-gray-200 bg-gray-50 text-gray-600";
                }
              } else {
                if (isSelected) {
                  optionClasses +=
                    "border-indigo-500 bg-indigo-50 text-indigo-900 shadow-md";
                } else {
                  optionClasses +=
                    "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer";
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() =>
                    !showAnswers &&
                    handleAnswerSelect(currentQuestion.id, option.id)
                  }
                  className={optionClasses}
                  disabled={showAnswers}>
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center ${
                        isSelected ? "border-current" : "border-gray-400"
                      }`}>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                      )}
                    </div>
                    <span className="flex-1 text-base">
                      {option.optionText}
                    </span>
                    {showAnswers && isCorrect && (
                      <div className="ml-3 bg-green-600 rounded-full p-1">
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-t border-gray-200 flex justify-between items-center flex-wrap gap-4">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2">
            <svg
              className="w-4 h-4"
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
            Previous
          </button>
          <div className="flex flex-wrap gap-2 justify-center">
            {material.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300 ${
                  index === currentQuestionIndex
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-110"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:border-indigo-300"
                }`}>
                {index + 1}
              </button>
            ))}
          </div>
          <button
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2">
            Next
            <svg
              className="w-4 h-4"
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
          </button>
        </div>
      </div>
    );
  };

  // Generate breadcrumb items
  const breadcrumbItems = generateBreadcrumbItems({
    material: material || undefined,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              Failed to load material
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Questions Section */}
          {material.questions && material.questions.length > 0 && (
            <div>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-600 p-2 rounded-lg">
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
                  Test your knowledge with these multiple choice questions
                </p>
              </div>
              {renderQuestionViewer()}
            </div>
          )}

          {/* Documents Section */}
          {material.documents && material.documents.length > 0 && (
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
                    Study Materials
                  </h2>
                </div>
                <p className="text-gray-600 ml-14">
                  Download course materials and resources
                </p>
              </div>
              {renderDocumentViewer()}
            </div>
          )}

          {/* Empty State */}
          {(!material.questions || material.questions.length === 0) &&
            (!material.documents || material.documents.length === 0) && (
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
                  This material doesn't have any content yet.
                </p>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
