"use client";

import Breadcrumb from "@/components/Breadcrumb";
import { generateBreadcrumbItems } from "@/utils/breadcrumb-utils";

export default function TestBreadcrumbPage() {
  // Test with sample data
  const testContext = {
    examType: {
      id: "1",
      name: "Test Exam Type",
      description: "",
      createdAt: "",
      updatedAt: "",
      departments: [],
    },
    department: {
      id: "1",
      name: "Test Department",
      examTypeId: "1",
      createdAt: "",
      updatedAt: "",
      academicPeriods: [],
    },
    academicPeriod: {
      id: "1",
      name: "Test Period",
      departmentId: "1",
      createdAt: "",
      updatedAt: "",
      materials: [],
    },
    material: {
      id: "1",
      title: "Test Material",
      type: "DOCUMENT" as any,
      academicPeriodId: "1",
      createdAt: "",
      updatedAt: "",
      academicPeriod: undefined,
      documents: [],
      questions: [],
    },
  };

  const breadcrumbItems = generateBreadcrumbItems(testContext);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Breadcrumb Test Page</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Generated Breadcrumb Items:
          </h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(breadcrumbItems, null, 2)}
          </pre>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Breadcrumb Component:</h2>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Simple Home Only:</h2>
          <Breadcrumb
            items={[{ id: "home", name: "Home", path: "/", isClickable: true }]}
          />
        </div>
      </div>
    </div>
  );
}
