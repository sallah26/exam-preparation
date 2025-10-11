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
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );

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

  const getQuestionStatus = (index: number) => {
    if (index === currentQuestionIndex) return "current";
    if (
      material?.questions?.[index]?.id &&
      selectedAnswers[material.questions[index].id]
    )
      return "answered";
    if (flaggedQuestions.has(index)) return "flagged";
    return "unanswered";
  };

  const getQuestionButtonClass = (index: number) => {
    const status = getQuestionStatus(index);
    const baseClass =
      "w-8 h-8 text-sm font-medium rounded border transition-colors";

    switch (status) {
      case "current":
        return `${baseClass} bg-blue-600 text-white border-blue-600`;
      case "answered":
        return `${baseClass} bg-green-600 text-white border-green-600`;
      case "flagged":
        return `${baseClass} bg-red-600 text-white border-red-600`;
      default:
        return `${baseClass} bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300`;
    }
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
      } else {
        newSet.add(currentQuestionIndex);
      }
      return newSet;
    });
  };

  const renderQuestionViewer = () => {
    if (!material?.questions || material.questions.length === 0) {
      return null;
    }

    const currentQuestion = material.questions[currentQuestionIndex];
    const totalQuestions = material.questions.length;
    const answeredCount = material.questions.filter(
      (q) => selectedAnswers[q.id]
    ).length;

    return (
      <div className="min-h-screen bg-white">
        {/* Header
        <div className="border-b border-gray-200 px-6 py-4 bg-white">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">
                {material.academicPeriod?.department?.examType?.name} /{" "}
                {material.academicPeriod?.department?.name}
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                {material.title}
              </h1>
            </div>
          </div>
        </div> */}
        {/* Main Content */}
        <div className="flex mt-10 max-w-7xl mx-auto gap-7">
          {/* Left Sidebar */}
          <div className="w-80 bg-gray-50 border p-6 h-fit shadow-lg rounded-2xl">
            {/* Practice Mode Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Practice Mode
                </h2>
                {!showAnswers ? (
                  <button
                    onClick={() => setShowAnswers(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-lg transition-colors">
                    Show Answers
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAnswers(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 text-sm rounded-lg transition-colors">
                    Hide Answers
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {answeredCount} of {totalQuestions} answered
              </p>
            </div>

            {/* Questions Grid */}
            <div className="mb-6">
              <h3 className="text-base font-medium mb-4 text-gray-900">
                Questions
              </h3>
              <div className="grid grid-cols-10 gap-1 mb-6">
                {material.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={getQuestionButtonClass(index)}>
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Current Question</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-700">Answered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-700">Unanswered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Flagged (Click flag button)
                </span>
              </div>
            </div>

            {/* Score Display */}
            {showAnswers && (
              <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Your Score:
                  </span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {calculateScore()}%
                  </span>
                </div>
              </div>
            )}

            {/* Finish Exam Button */}
            <button
              onClick={() => {
                setShowAnswers(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <svg
                className="w-5 h-5"
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
              Finish & Review
            </button>
          </div>

          {/* Main Question Area */}
          <div className="flex-1 p-8 bg-white border shadow-lg rounded-2xl">
            <div className="max-w-4xl">
              {/* Question Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-600 text-sm">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </p>
                  <button
                    onClick={toggleFlag}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      flaggedQuestions.has(currentQuestionIndex)
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                    }`}>
                    <svg
                      className="w-4 h-4 inline mr-2"
                      fill={
                        flaggedQuestions.has(currentQuestionIndex)
                          ? "currentColor"
                          : "none"
                      }
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                      />
                    </svg>
                    {flaggedQuestions.has(currentQuestionIndex)
                      ? "Unflag"
                      : "Flag"}
                  </button>
                </div>
                <h2 className="text-xl font-medium text-gray-900 mb-8 leading-relaxed">
                  {currentQuestion.questionText}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected =
                    selectedAnswers[currentQuestion.id] === option.id;
                  const isCorrect = option.isCorrect;
                  const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D

                  let buttonClass =
                    "w-full text-left p-4 rounded-lg border transition-colors ";

                  if (showAnswers) {
                    if (isCorrect) {
                      buttonClass +=
                        "bg-green-50 border-green-500 text-gray-900";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "bg-red-50 border-red-500 text-gray-900";
                    } else {
                      buttonClass += "bg-white border-gray-200 text-gray-600";
                    }
                  } else {
                    if (isSelected) {
                      buttonClass += "bg-blue-50 border-blue-500 text-gray-900";
                    } else {
                      buttonClass +=
                        "bg-white border-gray-200 text-gray-700 hover:bg-gray-50";
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() =>
                        !showAnswers &&
                        handleAnswerSelect(currentQuestion.id, option.id)
                      }
                      disabled={showAnswers}
                      className={buttonClass}>
                      <div className="flex gap-4">
                        <span
                          className={`font-medium ${
                            showAnswers && isCorrect
                              ? "text-green-600"
                              : showAnswers && isSelected && !isCorrect
                              ? "text-red-600"
                              : isSelected
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}>
                          {optionLetter}
                        </span>
                        <span className="flex-1">{option.optionText}</span>
                        {showAnswers && isCorrect && (
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Help Buttons */}
              {currentQuestion.explanation && showAnswers && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Explanation:
                  </h4>
                  <p className="text-gray-700">{currentQuestion.explanation}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2">
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

                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
          </div>
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
      <div className="min-h-screen min-h-[calc(100vh-82px)] bg-gradient-to-br from-blue-50 to-indigo-100">
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

  // If material has questions, show the full exam interface
  if (material.questions && material.questions.length > 0) {
    return renderQuestionViewer();
  }

  // Otherwise show the normal page layout with documents
  return (
    <div className="min-h-screen min-h-[calc(100vh-82px)] bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
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
          {(!material.documents || material.documents.length === 0) && (
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
