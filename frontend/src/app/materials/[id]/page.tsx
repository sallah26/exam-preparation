"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { studentExamApi } from "@/lib/exam-api";
import { Material, MaterialType, Question } from "@/types/exam";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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

  const renderDocumentViewer = () => {
    if (!material?.documents || material.documents.length === 0) return null;

    return (
      <div className="space-y-6">
        {material.documents.map((document) => {
          const fileUrl = studentExamApi.getFileUrl(document.filePath);
          const staticFileUrl = studentExamApi.getStaticFileUrl(
            document.filePath
          );

          return (
            <div
              key={document.id}
              className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {document.originalName}
                    </h3>
                    <p className="text-sm text-gray-500">{document.fileType}</p>
                  </div>
                  <button
                    onClick={() => {
                      // Try API URL first, then static URL as fallback
                      fetch(fileUrl)
                        .then((response) => {
                          if (response.ok) {
                            window.open(fileUrl, "_blank");
                          } else {
                            console.log("API URL failed, trying static URL");
                            window.open(staticFileUrl, "_blank");
                          }
                        })
                        .catch(() => {
                          console.log("API URL failed, trying static URL");
                          window.open(staticFileUrl, "_blank");
                        });
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Download
                  </button>
                </div>
              </div>
              <div className="p-6">
                {document.fileType.startsWith("image/") ? (
                  <div className="text-center">
                    <img
                      src={fileUrl}
                      alt={document.originalName}
                      className="max-w-full h-auto mx-auto rounded-lg shadow-sm"
                      style={{ maxHeight: "500px" }}
                      onError={(e) => {
                        console.error(
                          "Failed to load image from API:",
                          fileUrl
                        );
                        console.log(
                          "Trying static URL fallback:",
                          staticFileUrl
                        );
                        // Try static URL as fallback
                        e.currentTarget.src = staticFileUrl;
                        e.currentTarget.onerror = () => {
                          console.error(
                            "Failed to load image from static URL:",
                            staticFileUrl
                          );
                          e.currentTarget.style.display = "none";
                          const errorDiv = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (errorDiv) errorDiv.classList.remove("hidden");
                        };
                      }}
                    />
                    <div className="hidden text-center py-12">
                      <div className="text-red-600 mb-4">
                        <svg
                          className="mx-auto h-16 w-16"
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
                        Failed to load image
                      </h3>
                      <p className="text-gray-600 mb-4">
                        The image could not be displayed. Try downloading it
                        instead.
                      </p>
                    </div>
                  </div>
                ) : document.fileType === "application/pdf" ? (
                  <iframe
                    src={fileUrl}
                    className="w-full h-96 border border-gray-300 rounded-md"
                    title={document.originalName}
                    onError={() => {
                      console.error("Failed to load PDF:", fileUrl);
                    }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-blue-600 mb-4">
                      <svg
                        className="mx-auto h-16 w-16"
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
                      {document.originalName}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Click download to view this file ({document.fileType})
                    </p>
                    <button
                      onClick={() => {
                        // Try API URL first, then static URL as fallback
                        fetch(fileUrl)
                          .then((response) => {
                            if (response.ok) {
                              window.open(fileUrl, "_blank");
                            } else {
                              console.log("API URL failed, trying static URL");
                              window.open(staticFileUrl, "_blank");
                            }
                          })
                          .catch(() => {
                            console.log("API URL failed, trying static URL");
                            window.open(staticFileUrl, "_blank");
                          });
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium">
                      Download File
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderQuestionViewer = () => {
    if (!material?.questions || material.questions.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-16 w-16"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No questions available
          </h3>
          <p className="text-gray-600">
            This material doesn't have any questions yet.
          </p>
        </div>
      );
    }

    const currentQuestion = material.questions[currentQuestionIndex];
    const totalQuestions = material.questions.length;

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Question Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h3>
            <div className="flex space-x-2">
              {!showAnswers && (
                <button
                  onClick={() => setShowAnswers(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Show Answers
                </button>
              )}
              {showAnswers && (
                <div className="text-sm text-gray-600">
                  Score: {calculateScore()}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6">
            {currentQuestion.questionText}
          </h4>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected =
                selectedAnswers[currentQuestion.id] === option.id;
              const isCorrect = option.isCorrect;

              let optionClasses =
                "w-full text-left p-4 rounded-lg border transition-colors duration-200 ";

              if (showAnswers) {
                if (isCorrect) {
                  optionClasses +=
                    "border-green-500 bg-green-50 text-green-900";
                } else if (isSelected && !isCorrect) {
                  optionClasses += "border-red-500 bg-red-50 text-red-900";
                } else {
                  optionClasses += "border-gray-300 bg-gray-50";
                }
              } else {
                if (isSelected) {
                  optionClasses +=
                    "border-indigo-500 bg-indigo-50 text-indigo-900";
                } else {
                  optionClasses += "border-gray-300 hover:border-gray-400";
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
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                        isSelected ? "border-current" : "border-gray-400"
                      }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-current m-0.5"></div>
                      )}
                    </div>
                    <span>{option.optionText}</span>
                    {showAnswers && isCorrect && (
                      <svg
                        className="ml-auto h-5 w-5 text-green-600"
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
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium">
            Previous
          </button>
          <div className="flex space-x-2">
            {material.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium ${
                  index === currentQuestionIndex
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}>
                {index + 1}
              </button>
            ))}
          </div>
          <button
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium">
            Next
          </button>
        </div>
      </div>
    );
  };

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
                {material.type === MaterialType.DOCUMENT ? "📄" : "❓"}{" "}
                {material.title}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {material.type === MaterialType.DOCUMENT
          ? renderDocumentViewer()
          : renderQuestionViewer()}
      </main>
    </div>
  );
}
