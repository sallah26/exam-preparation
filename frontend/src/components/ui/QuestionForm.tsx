"use client";

import React, { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import { Card } from "./card";
import { Badge } from "./badge";
import { Alert, AlertDescription } from "./alert";
import { CreateQuestionData } from "@/types/exam";

interface QuestionFormProps {
  onSubmit: (questionData: CreateQuestionData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function QuestionForm({
  onSubmit,
  onCancel,
  loading = false,
}: QuestionFormProps) {
  const [formData, setFormData] = useState<CreateQuestionData>({
    questionText: "",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    explanation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const optionLabels = ["A", "B", "C", "D"];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate question text
    if (!formData.questionText.trim()) {
      newErrors.questionText = "Question text is required";
    }

    // Validate options
    const nonEmptyOptions = formData.options.filter((opt) => opt.text.trim());
    if (nonEmptyOptions.length < 2) {
      newErrors.options = "At least 2 options are required";
    }

    // Validate correct answer
    const correctAnswers = formData.options.filter(
      (opt) => opt.isCorrect && opt.text.trim()
    );
    if (correctAnswers.length !== 1) {
      newErrors.correctAnswer = "Exactly one correct answer must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], text };
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = formData.options.map((option, i) => ({
      ...option,
      isCorrect: i === index,
    }));
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Filter out empty options before submitting
      const filteredOptions = formData.options.filter((opt) => opt.text.trim());
      onSubmit({
        ...formData,
        options: filteredOptions,
      });
    }
  };

  const getCorrectAnswerIndex = (): number => {
    return formData.options.findIndex((opt) => opt.isCorrect);
  };

  return (
    <Card className="p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Create New Question
          </h3>
          <Badge variant="outline">Multiple Choice</Badge>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <Label
            htmlFor="questionText"
            className="text-sm font-medium">
            Question Text *
          </Label>
          <Textarea
            id="questionText"
            value={formData.questionText}
            onChange={(e) =>
              setFormData({ ...formData, questionText: e.target.value })
            }
            placeholder="Enter your question here..."
            rows={3}
            className={errors.questionText ? "border-red-500" : ""}
          />
          {errors.questionText && (
            <p className="text-sm text-red-600">{errors.questionText}</p>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Answer Options *</Label>
            {getCorrectAnswerIndex() >= 0 && (
              <Badge variant="secondary">
                Correct: {optionLabels[getCorrectAnswerIndex()]}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {formData.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`correct-${index}`}
                    name="correctAnswer"
                    checked={option.isCorrect}
                    onChange={() => handleCorrectAnswerChange(index)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <Label
                    htmlFor={`correct-${index}`}
                    className="ml-2 text-sm font-medium text-gray-700 min-w-[20px]">
                    {optionLabels[index]}
                  </Label>
                </div>
                <Input
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${optionLabels[index]} text...`}
                  className={`flex-1 ${
                    option.isCorrect ? "border-green-500 bg-green-50" : ""
                  }`}
                />
              </div>
            ))}
          </div>

          {errors.options && (
            <p className="text-sm text-red-600">{errors.options}</p>
          )}
          {errors.correctAnswer && (
            <p className="text-sm text-red-600">{errors.correctAnswer}</p>
          )}
        </div>

        {/* Explanation (Optional) */}
        <div className="space-y-2">
          <Label
            htmlFor="explanation"
            className="text-sm font-medium">
            Explanation <span className="text-gray-500">(Optional)</span>
          </Label>
          <Textarea
            id="explanation"
            value={formData.explanation}
            onChange={(e) =>
              setFormData({ ...formData, explanation: e.target.value })
            }
            placeholder="Provide an explanation for why this answer is correct..."
            rows={2}
          />
          <p className="text-xs text-gray-500">
            This will be shown to students after they submit their answer
          </p>
        </div>

        {/* Preview */}
        {formData.questionText && (
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
            <Card className="p-4 bg-gray-50">
              <h5 className="font-medium mb-3">{formData.questionText}</h5>
              <div className="space-y-2">
                {formData.options.map(
                  (option, index) =>
                    option.text.trim() && (
                      <div
                        key={index}
                        className={`flex items-center space-x-2 p-2 rounded ${
                          option.isCorrect
                            ? "bg-green-100 border border-green-300"
                            : "bg-white"
                        }`}>
                        <span className="font-medium">
                          {optionLabels[index]}.
                        </span>
                        <span>{option.text}</span>
                        {option.isCorrect && (
                          <Badge
                            variant="secondary"
                            className="ml-auto">
                            Correct
                          </Badge>
                        )}
                      </div>
                    )
                )}
              </div>
              {formData.explanation && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Explanation:</strong> {formData.explanation}
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              Please fix the errors above before submitting.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700">
            {loading ? "Creating..." : "Create Question"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
