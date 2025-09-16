"use client";

import React, { useState, useEffect } from "react";
import {
  Material,
  MaterialType,
  Question,
  Document,
  CreateQuestionData,
} from "@/types/exam";
import { adminExamApi } from "@/lib/exam-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/FileUpload";
import { QuestionForm } from "@/components/ui/QuestionForm";

interface MaterialManagerProps {
  material: Material;
  onUpdate: () => void;
}

export function MaterialManager({ material, onUpdate }: MaterialManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMaterialContent();
  }, [material.id]);

  const loadMaterialContent = async () => {
    try {
      setLoading(true);
      if (material.type === MaterialType.QUESTION) {
        const response = await adminExamApi.getQuestions(material.id);
        if (response.success && response.data) {
          setQuestions(response.data);
        }
      }
      // For documents, we'll use the material.documents property
      if (material.documents) {
        setDocuments(material.documents);
      }
    } catch (error) {
      console.error("Failed to load material content:", error);
      setError("Failed to load material content");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploadLoading(true);
      setError(null);

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await adminExamApi.uploadDocument(material.id, formData);
      if (!response.success) {
        throw new Error("Failed to upload files");
      }

      setSelectedFiles([]);
      setShowFileUpload(false);
      onUpdate();
      loadMaterialContent();
    } catch (error: any) {
      setError(error.message || "Failed to upload files");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCreateQuestion = async (questionData: CreateQuestionData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminExamApi.createQuestion(
        material.id,
        questionData
      );
      if (response.success) {
        setShowQuestionForm(false);
        loadMaterialContent();
      } else {
        throw new Error("Failed to create question");
      }
    } catch (error: any) {
      setError(error.message || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      setLoading(true);
      const response = await adminExamApi.deleteQuestion(questionId);
      if (response.success) {
        loadMaterialContent();
      }
    } catch (error) {
      setError("Failed to delete question");
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentManager = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Document Files</h3>
        <Dialog
          open={showFileUpload}
          onOpenChange={setShowFileUpload}>
          <DialogTrigger asChild>
            <Button>Upload Files</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Document Files</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <FileUpload
                onFilesSelect={setSelectedFiles}
                selectedFiles={selectedFiles}
                maxFiles={10}
                acceptedFileTypes={[
                  ".pdf",
                  ".doc",
                  ".docx",
                  ".jpg",
                  ".jpeg",
                  ".png",
                  ".gif",
                  ".txt",
                ]}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFileUpload(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={selectedFiles.length === 0 || uploadLoading}>
                  {uploadLoading
                    ? "Uploading..."
                    : `Upload ${selectedFiles.length} file(s)`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <Card className="p-8 text-center">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No documents uploaded
          </h3>
          <p className="text-gray-600 mb-4">
            Upload PDF, DOC, images, or other study materials.
          </p>
          <Button onClick={() => setShowFileUpload(true)}>
            Upload First Document
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {doc.fileType.startsWith("image/") ? (
                      <div className="h-10 w-10 bg-green-100 rounded flex items-center justify-center">
                        <svg
                          className="h-5 w-5 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    ) : doc.fileType === "application/pdf" ? (
                      <div className="h-10 w-10 bg-red-100 rounded flex items-center justify-center">
                        <svg
                          className="h-5 w-5 text-red-600"
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
                    ) : (
                      <div className="h-10 w-10 bg-blue-100 rounded flex items-center justify-center">
                        <svg
                          className="h-5 w-5 text-blue-600"
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
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {doc.originalName}
                    </p>
                    <p className="text-sm text-gray-500">{doc.fileType}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline">
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline">
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuestionManager = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Practice Questions</h3>
        <Dialog
          open={showQuestionForm}
          onOpenChange={setShowQuestionForm}>
          <DialogTrigger asChild>
            <Button>Add Question</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Question</DialogTitle>
            </DialogHeader>
            <QuestionForm
              onSubmit={handleCreateQuestion}
              onCancel={() => setShowQuestionForm(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {questions.length === 0 ? (
        <Card className="p-8 text-center">
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
            No questions created
          </h3>
          <p className="text-gray-600 mb-4">
            Create multiple choice questions with explanations.
          </p>
          <Button onClick={() => setShowQuestionForm(true)}>
            Create First Question
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {questions.length} question(s)
            </p>
            <Badge variant="outline">{questions.length} MCQ</Badge>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card
                key={question.id}
                className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Question {index + 1}
                    </h4>
                    <p className="text-gray-700 mb-3">
                      {question.questionText}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline">
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-700">
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={option.id}
                      className={`p-2 rounded text-sm ${
                        option.isCorrect
                          ? "bg-green-100 border border-green-300"
                          : "bg-gray-50"
                      }`}>
                      <span className="font-medium">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>{" "}
                      {option.optionText}
                      {option.isCorrect && (
                        <Badge
                          variant="secondary"
                          className="ml-2">
                          Correct
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                {question.explanation && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>Explanation:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-3">
        <h2 className="text-xl font-semibold">{material.title}</h2>
        <Badge
          variant={
            material.type === MaterialType.DOCUMENT ? "default" : "secondary"
          }>
          {material.type === MaterialType.DOCUMENT ? "Document" : "Questions"}
        </Badge>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading &&
        (material.type === MaterialType.DOCUMENT
          ? renderDocumentManager()
          : renderQuestionManager())}
    </div>
  );
}
