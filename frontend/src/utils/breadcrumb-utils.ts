import { BreadcrumbItem } from "@/components/Breadcrumb";
import { ExamType, Department, AcademicPeriod, Material } from "@/types/exam";

export interface BreadcrumbContext {
  examType?: ExamType;
  department?: Department;
  academicPeriod?: AcademicPeriod;
  material?: Material;
}

/**
 * Generates breadcrumb items based on the current page context
 * Hierarchy: Home → Exam Type → Department → Academic Period → Material
 */
export function generateBreadcrumbItems(context: BreadcrumbContext): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      id: "home",
      name: "Home",
      path: "/",
      isClickable: true,
    },
  ];

  // Add Exam Type if available
  if (context.examType) {
    items.push({
      id: context.examType.id,
      name: context.examType.name,
      path: `/exam-types/${context.examType.id}`,
      isClickable: true,
    });
  }

  // Add Department if available
  if (context.department) {
    items.push({
      id: context.department.id,
      name: context.department.name,
      path: `/departments/${context.department.id}`,
      isClickable: true,
    });
  }

  // Add Academic Period if available
  if (context.academicPeriod) {
    items.push({
      id: context.academicPeriod.id,
      name: context.academicPeriod.name,
      path: `/periods/${context.academicPeriod.id}`,
      isClickable: true,
    });
  }

  // Add Material if available (last item is not clickable)
  if (context.material) {
    items.push({
      id: context.material.id,
      name: context.material.title,
      path: `/materials/${context.material.id}`,
      isClickable: false, // Last item is not clickable
    });
  }

  // Make the last item not clickable (current page)
  if (items.length > 1) {
    items[items.length - 1].isClickable = false;
  }

  return items;
}

/**
 * Extracts breadcrumb context from nested data structures
 */
export function extractBreadcrumbContext(data: {
  examType?: ExamType;
  department?: Department;
  academicPeriod?: AcademicPeriod;
  material?: Material;
}): BreadcrumbContext {
  const context: BreadcrumbContext = {};

  if (data.examType) {
    context.examType = data.examType;
  }

  if (data.department) {
    context.department = data.department;
    // If department has examType, use it
    if (data.department.examType) {
      context.examType = data.department.examType;
    }
  }

  if (data.academicPeriod) {
    context.academicPeriod = data.academicPeriod;
    // If academic period has department, use it
    if (data.academicPeriod.department) {
      context.department = data.academicPeriod.department;
      // If department has examType, use it
      if (data.academicPeriod.department.examType) {
        context.examType = data.academicPeriod.department.examType;
      }
    }
  }

  if (data.material) {
    context.material = data.material;
    // If material has academic period, use it
    if (data.material.academicPeriod) {
      context.academicPeriod = data.material.academicPeriod;
      // If academic period has department, use it
      if (data.material.academicPeriod.department) {
        context.department = data.material.academicPeriod.department;
        // If department has examType, use it
        if (data.material.academicPeriod.department.examType) {
          context.examType = data.material.academicPeriod.department.examType;
        }
      }
    }
  }

  return context;
}
