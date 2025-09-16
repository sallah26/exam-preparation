export interface ExamType {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  departments?: Department[];
}

export interface Department {
  id: string;
  name: string;
  examTypeId: string;
  createdAt: string;
  updatedAt: string;
  examType?: ExamType;
  academicPeriods?: AcademicPeriod[];
}

export interface AcademicPeriod {
  id: string;
  name: string;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
  department?: Department;
  materials?: Material[];
}

export enum MaterialType {
  DOCUMENT = 'DOCUMENT',
  QUESTION = 'QUESTION'
}

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  academicPeriodId: string;
  createdAt: string;
  updatedAt: string;
  academicPeriod?: AcademicPeriod;
  documents?: Document[];
  questions?: Question[];
}

export interface Document {
  id: string;
  materialId: string;
  filePath: string;
  fileType: string;
  originalName: string;
  createdAt: string;
  material?: Material;
}

export interface Question {
  id: string;
  materialId: string;
  questionText: string;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
  material?: Material;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  createdAt: string;
  question?: Question;
}

// Forms and inputs
export interface CreateExamTypeData {
  name: string;
  description?: string;
}

export interface CreateDepartmentData {
  name: string;
}

export interface CreateAcademicPeriodData {
  name: string;
}

export interface CreateMaterialData {
  title: string;
  type: MaterialType;
}

export interface CreateQuestionData {
  questionText: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
}

export interface CreateQuestionOptionData {
  optionText: string;
  isCorrect: boolean;
} 