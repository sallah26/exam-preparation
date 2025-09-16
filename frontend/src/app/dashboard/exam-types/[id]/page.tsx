"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { adminExamApi } from "@/lib/exam-api";
import {
  ExamType,
  Department,
  AcademicPeriod,
  Material,
  CreateDepartmentData,
  CreateAcademicPeriodData,
  CreateMaterialData,
  MaterialType,
} from "@/types/exam";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MaterialManager } from "@/components/MaterialManager";

type ViewLevel = "departments" | "periods" | "materials";

export default function ExamTypeManagePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const examTypeId = params.id as string;

  // State
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>("departments");
  const [breadcrumb, setBreadcrumb] = useState<
    Array<{ level: ViewLevel; name: string; id?: string }>
  >([]);

  // Data states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(
    null
  );
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<AcademicPeriod | null>(
    null
  );
  const [materials, setMaterials] = useState<Material[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDepartment, setNewDepartment] = useState<CreateDepartmentData>({
    name: "",
  });
  const [newPeriod, setNewPeriod] = useState<CreateAcademicPeriodData>({
    name: "",
  });
  const [newMaterial, setNewMaterial] = useState<CreateMaterialData>({
    title: "",
    type: MaterialType.DOCUMENT,
  });

  // Material management states
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [showMaterialManager, setShowMaterialManager] = useState(false);

  useEffect(() => {
    if (isAuthenticated && examTypeId) {
      loadExamType();
    }
  }, [isAuthenticated, examTypeId]);

  const loadExamType = async () => {
    try {
      setLoading(true);
      const response = await adminExamApi.getExamTypes();
      if (response.success && response.data) {
        const currentExamType = response.data.find(
          (et) => et.id === examTypeId
        );
        if (currentExamType) {
          setExamType(currentExamType);
          setBreadcrumb([{ level: "departments", name: currentExamType.name }]);
          loadDepartments();
        }
      }
    } catch (error) {
      console.error("Failed to load exam type:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      setDataLoading(true);
      const response = await adminExamApi.getDepartments(examTypeId);
      if (response.success && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const loadAcademicPeriods = async (department: Department) => {
    try {
      setDataLoading(true);
      const response = await adminExamApi.getAcademicPeriods(department.id);
      if (response.success && response.data) {
        setAcademicPeriods(response.data);
        setCurrentDepartment(department);
        setCurrentLevel("periods");
        setBreadcrumb([
          { level: "departments", name: examType?.name || "Exam Type" },
          { level: "periods", name: department.name, id: department.id },
        ]);
      }
    } catch (error) {
      console.error("Failed to load academic periods:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const loadMaterials = async (period: AcademicPeriod) => {
    try {
      setDataLoading(true);
      const response = await adminExamApi.getMaterials(period.id);
      if (response.success && response.data) {
        setMaterials(response.data);
        setCurrentPeriod(period);
        setCurrentLevel("materials");
        setBreadcrumb([
          { level: "departments", name: examType?.name || "Exam Type" },
          {
            level: "periods",
            name: currentDepartment?.name || "Department",
            id: currentDepartment?.id,
          },
          { level: "materials", name: period.name, id: period.id },
        ]);
      }
    } catch (error) {
      console.error("Failed to load materials:", error);
    } finally {
      setDataLoading(false);
    }
  };

  // Navigation functions
  const navigateToLevel = (level: ViewLevel, id?: string) => {
    if (level === "departments") {
      setCurrentLevel("departments");
      setBreadcrumb([
        { level: "departments", name: examType?.name || "Exam Type" },
      ]);
      setCurrentDepartment(null);
      setCurrentPeriod(null);
    } else if (level === "periods" && id) {
      const department = departments.find((d) => d.id === id);
      if (department) {
        loadAcademicPeriods(department);
      }
    }
  };

  // Create functions
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartment.name.trim()) return;

    try {
      const response = await adminExamApi.createDepartment(
        examTypeId,
        newDepartment
      );
      if (response.success) {
        setNewDepartment({ name: "" });
        setShowCreateForm(false);
        loadDepartments();
      }
    } catch (error) {
      console.error("Failed to create department:", error);
    }
  };

  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriod.name.trim() || !currentDepartment) return;

    try {
      const response = await adminExamApi.createAcademicPeriod(
        currentDepartment.id,
        newPeriod
      );
      if (response.success) {
        setNewPeriod({ name: "" });
        setShowCreateForm(false);
        loadAcademicPeriods(currentDepartment);
      }
    } catch (error) {
      console.error("Failed to create academic period:", error);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title.trim() || !currentPeriod) return;

    try {
      const response = await adminExamApi.createMaterial(
        currentPeriod.id,
        newMaterial
      );
      if (response.success) {
        setNewMaterial({ title: "", type: MaterialType.DOCUMENT });
        setShowCreateForm(false);
        loadMaterials(currentPeriod);
      }
    } catch (error) {
      console.error("Failed to create material:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace("/auth/login");
    return null;
  }

  if (!examType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Exam Type Not Found
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const renderCreateForm = () => {
    if (!showCreateForm) return null;

    if (currentLevel === "departments") {
      return (
        <form
          onSubmit={handleCreateDepartment}
          className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Create New Department</h3>
          <input
            type="text"
            value={newDepartment.name}
            onChange={(e) => setNewDepartment({ name: e.target.value })}
            placeholder="Department name (e.g., Computer Science, Engineering)"
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Create Department
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Cancel
            </button>
          </div>
        </form>
      );
    } else if (currentLevel === "periods") {
      return (
        <form
          onSubmit={handleCreatePeriod}
          className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">
            Create New Academic Period
          </h3>
          <input
            type="text"
            value={newPeriod.name}
            onChange={(e) => setNewPeriod({ name: e.target.value })}
            placeholder="Period name (e.g., 2024, Spring 2024, Semester 1)"
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Create Period
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Cancel
            </button>
          </div>
        </form>
      );
    } else if (currentLevel === "materials") {
      return (
        <form
          onSubmit={handleCreateMaterial}
          className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Create New Material</h3>
          <input
            type="text"
            value={newMaterial.title}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, title: e.target.value })
            }
            placeholder="Material title"
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md"
            required
          />
          <select
            value={newMaterial.type}
            onChange={(e) =>
              setNewMaterial({
                ...newMaterial,
                type: e.target.value as MaterialType,
              })
            }
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md">
            <option value={MaterialType.DOCUMENT}>
              Document (PDF, DOC, Images)
            </option>
            <option value={MaterialType.QUESTION}>
              Practice Questions (MCQ)
            </option>
          </select>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Create Material
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Cancel
            </button>
          </div>
        </form>
      );
    }
  };

  const renderContent = () => {
    if (dataLoading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      );
    }

    if (currentLevel === "departments") {
      return (
        <div className="space-y-4">
          {departments.length === 0 ? (
            <div className="text-center py-12">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No departments yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first department to organize study materials.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium">
                Create First Department
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((department) => (
                <div
                  key={department.id}
                  onClick={() => loadAcademicPeriods(department)}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer">
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
                      {department.academicPeriods?.length || 0} academic periods
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
        </div>
      );
    } else if (currentLevel === "periods") {
      return (
        <div className="space-y-4">
          {academicPeriods.length === 0 ? (
            <div className="text-center py-12">
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
                    d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4m0-10V7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No academic periods yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create academic periods like years or semesters for{" "}
                {currentDepartment?.name}.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium">
                Create First Period
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {academicPeriods.map((period) => (
                <div
                  key={period.id}
                  onClick={() => loadMaterials(period)}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-green-300 transition-all cursor-pointer">
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
                      {period.materials?.length || 0} study materials
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
        </div>
      );
    } else if (currentLevel === "materials") {
      return (
        <div className="space-y-4">
          {materials.length === 0 ? (
            <div className="text-center py-12">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No study materials yet
              </h3>
              <p className="text-gray-600 mb-4">
                Add documents or practice questions for {currentPeriod?.name}.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium">
                Add First Material
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div
                      className={`rounded-lg p-3 mr-4 ${
                        material.type === MaterialType.DOCUMENT
                          ? "bg-blue-100"
                          : "bg-purple-100"
                      }`}>
                      {material.type === MaterialType.DOCUMENT ? (
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
                      ) : (
                        <svg
                          className="h-6 w-6 text-purple-600"
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
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {material.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {material.type === MaterialType.DOCUMENT
                          ? "Document"
                          : "Practice Questions"}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMaterial(material);
                        setShowMaterialManager(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium">
                      {material.type === MaterialType.DOCUMENT
                        ? "Manage Files"
                        : "Manage Questions"}
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/dashboard")}
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
              <h1 className="text-3xl font-bold text-gray-900">
                Manage: {examType.name}
              </h1>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav
            className="flex"
            aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              {breadcrumb.map((item, index) => (
                <li key={index}>
                  <div className="flex items-center">
                    {index > 0 && (
                      <svg
                        className="h-5 w-5 text-gray-400 mr-4"
                        fill="currentColor"
                        viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {index < breadcrumb.length - 1 ? (
                      <button
                        onClick={() => navigateToLevel(item.level, item.id)}
                        className="text-gray-500 hover:text-gray-700 font-medium">
                        {item.name}
                      </button>
                    ) : (
                      <span className="text-gray-900 font-medium">
                        {item.name}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentLevel === "departments" && "Departments"}
                {currentLevel === "periods" &&
                  `Academic Periods - ${currentDepartment?.name}`}
                {currentLevel === "materials" &&
                  `Study Materials - ${currentPeriod?.name}`}
              </h2>
              {((currentLevel === "departments" && departments.length > 0) ||
                (currentLevel === "periods" && academicPeriods.length > 0) ||
                (currentLevel === "materials" && materials.length > 0)) && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  {currentLevel === "departments" && "Add Department"}
                  {currentLevel === "periods" && "Add Period"}
                  {currentLevel === "materials" && "Add Material"}
                </button>
              )}
            </div>

            {renderCreateForm()}
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Material Manager Dialog */}
      <Dialog
        open={showMaterialManager}
        onOpenChange={setShowMaterialManager}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMaterial?.title} -{" "}
              {selectedMaterial?.type === MaterialType.DOCUMENT
                ? "Document Management"
                : "Question Management"}
            </DialogTitle>
          </DialogHeader>
          {selectedMaterial && (
            <MaterialManager
              material={selectedMaterial}
              onUpdate={() => {
                if (currentPeriod) {
                  loadMaterials(currentPeriod);
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
