import { fetcher, fetcherNoAuth } from './fetcher';
import { ApiResponse } from './api';
import {
  ExamType,
  Department,
  AcademicPeriod,
  Material,
  Question,
  CreateExamTypeData,
  CreateDepartmentData,
  CreateAcademicPeriodData,
  CreateMaterialData,
  CreateQuestionData
} from '@/types/exam';

// Student API (Public endpoints)
export const studentExamApi = {
  async getExamTypes(): Promise<ApiResponse<ExamType[]>> {
    try {
      const response = await fetcherNoAuth.get('/api/student/exam-types');
      return {
        success: response.data.success,
        message: response.data.message || 'Exam types retrieved',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch exam types',
      };
    }
  },

  async getDepartments(examTypeId: string): Promise<ApiResponse<Department[]>> {
    try {
      const response = await fetcherNoAuth.get(`/api/student/exam-types/${examTypeId}/departments`);
      return {
        success: response.data.success,
        message: response.data.message || 'Departments retrieved',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch departments',
      };
    }
  },

  async getAcademicPeriods(departmentId: string): Promise<ApiResponse<AcademicPeriod[]>> {
    try {
      const response = await fetcherNoAuth.get(`/api/student/departments/${departmentId}/academic-periods`);
      return {
        success: response.data.success,
        message: response.data.message || 'Academic periods retrieved',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch academic periods',
      };
    }
  },

  async getMaterials(academicPeriodId: string): Promise<ApiResponse<Material[]>> {
    try {
      const response = await fetcherNoAuth.get(`/api/student/academic-periods/${academicPeriodId}/materials`);
      return {
        success: response.data.success,
        message: response.data.message || 'Materials retrieved',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch materials',
      };
    }
  },

  async getMaterialContent(materialId: string): Promise<ApiResponse<Material>> {
    try {
      const response = await fetcherNoAuth.get(`/api/student/materials/${materialId}/content`);
      return {
        success: response.data.success,
        message: response.data.message || 'Material content retrieved',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch material content',
      };
    }
  },

  getFileUrl(filename: string): string {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/student/files/${filename}`;
  },

  getStaticFileUrl(filename: string): string {
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${filename}`;
  },
};

// Admin API (Protected endpoints)
export const adminExamApi = {
  // Exam Types
  async createExamType(data: CreateExamTypeData): Promise<ApiResponse<ExamType>> {
    try {
      const response = await fetcher.post('/api/admin/exam/exam-types', data);
      return {
        success: response.data.success,
        message: response.data.message || 'Exam type created',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create exam type',
      };
    }
  },

  async getExamTypes(): Promise<ApiResponse<ExamType[]>> {
    try {
      const response = await fetcher.get('/api/admin/exam/exam-types');
      return {
        success: response.data.success,
        message: response.data.message || 'Exam types retrieved',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch exam types',
      };
    }
  },

  async updateExamType(id: string, data: CreateExamTypeData): Promise<ApiResponse<ExamType>> {
    try {
      const response = await fetcher.put(`/api/admin/exam/exam-types/${id}`, data);
      return {
        success: response.data.success,
        message: response.data.message || 'Exam type updated',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update exam type',
      };
    }
  },

  async deleteExamType(id: string): Promise<ApiResponse> {
    try {
      const response = await fetcher.delete(`/api/admin/exam/exam-types/${id}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Exam type deleted',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete exam type',
      };
    }
  },

  // Departments
  async createDepartment(examTypeId: string, data: CreateDepartmentData): Promise<ApiResponse<Department>> {
    try {
      const response = await fetcher.post(`/api/admin/exam/exam-types/${examTypeId}/departments`, data);
      return {
        success: response.data.success,
        message: response.data.message || 'Department created',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create department',
      };
    }
  },

  async getDepartments(examTypeId: string): Promise<ApiResponse<Department[]>> {
    try {
      const response = await fetcher.get(`/api/admin/exam/exam-types/${examTypeId}/departments`);
      return {
        success: response.data.success,
        message: response.data.message || 'Departments retrieved',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch departments',
      };
    }
  },

  async updateDepartment(id: string, data: CreateDepartmentData): Promise<ApiResponse<Department>> {
    try {
      const response = await fetcher.put(`/api/admin/exam/departments/${id}`, data);
      return {
        success: response.data.success,
        message: response.data.message || 'Department updated',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update department',
      };
    }
  },

  async deleteDepartment(id: string): Promise<ApiResponse> {
    try {
      const response = await fetcher.delete(`/api/admin/exam/departments/${id}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Department deleted',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete department',
      };
    }
  },

  // Academic Periods
  async createAcademicPeriod(departmentId: string, data: CreateAcademicPeriodData): Promise<ApiResponse<AcademicPeriod>> {
    try {
      const response = await fetcher.post(`/api/admin/exam/departments/${departmentId}/academic-periods`, data);
      return {
        success: response.data.success,
        message: response.data.message || 'Academic period created',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create academic period',
      };
    }
  },

  async getAcademicPeriods(departmentId: string): Promise<ApiResponse<AcademicPeriod[]>> {
    try {
      const response = await fetcher.get(`/api/admin/exam/departments/${departmentId}/academic-periods`);
      return {
        success: response.data.success,
        message: response.data.message || 'Academic periods retrieved',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch academic periods',
      };
    }
  },

  async updateAcademicPeriod(id: string, data: CreateAcademicPeriodData): Promise<ApiResponse<AcademicPeriod>> {
    try {
      const response = await fetcher.put(`/api/admin/exam/academic-periods/${id}`, data);
      return {
        success: response.data.success,
        message: response.data.message || 'Academic period updated',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update academic period',
      };
    }
  },

  async deleteAcademicPeriod(id: string): Promise<ApiResponse> {
    try {
      const response = await fetcher.delete(`/api/admin/exam/academic-periods/${id}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Academic period deleted',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete academic period',
      };
    }
  },

  // Materials
  async createMaterial(academicPeriodId: string, data: CreateMaterialData): Promise<ApiResponse<Material>> {
    try {
      const response = await fetcher.post(`/api/admin/exam/academic-periods/${academicPeriodId}/materials`, data);
      return {
        success: response.data.success,
        message: response.data.message || 'Material created',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create material',
      };
    }
  },

  async getMaterials(academicPeriodId: string): Promise<ApiResponse<Material[]>> {
    try {
      const response = await fetcher.get(`/api/admin/exam/academic-periods/${academicPeriodId}/materials`);
      return {
        success: response.data.success,
        message: response.data.message || 'Materials retrieved',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch materials',
      };
    }
  },

  async deleteMaterial(id: string): Promise<ApiResponse> {
    try {
      const response = await fetcher.delete(`/api/admin/exam/materials/${id}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Material deleted',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete material',
      };
    }
  },

  // File Upload
  async uploadDocument(materialId: string, formData: FormData): Promise<ApiResponse> {
    try {
      const response = await fetcher.post(`/api/admin/exam/materials/${materialId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: response.data.success,
        message: response.data.message || 'Document uploaded',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload document',
      };
    }
  },

  // Questions
  async createQuestion(materialId: string, data: CreateQuestionData): Promise<ApiResponse<Question>> {
    try {
      const response = await fetcher.post(`/api/admin/exam/materials/${materialId}/questions`, data);
      return {
        success: response.data.success,
        message: response.data.message || 'Question created',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create question',
      };
    }
  },

  async getQuestions(materialId: string): Promise<ApiResponse<Question[]>> {
    try {
      const response = await fetcher.get(`/api/admin/exam/materials/${materialId}/questions`);
      return {
        success: response.data.success,
        message: response.data.message || 'Questions retrieved',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch questions',
      };
    }
  },

  async updateQuestion(id: string, data: CreateQuestionData): Promise<ApiResponse<Question>> {
    try {
      const response = await fetcher.put(`/api/admin/exam/questions/${id}`, data);
      return {
        success: response.data.success,
        message: response.data.message || 'Question updated',
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update question',
      };
    }
  },

  async deleteQuestion(id: string): Promise<ApiResponse> {
    try {
      const response = await fetcher.delete(`/api/admin/exam/questions/${id}`);
      return {
        success: response.data.success,
        message: response.data.message || 'Question deleted',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete question',
      };
    }
  },
}; 