import { Router } from 'express';
import { authMiddleware } from '../modules/auth/middleware/auth.middleware';
import {
  createExamType,
  getExamTypes,
  updateExamType,
  deleteExamType,
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  createAcademicPeriod,
  getAcademicPeriods,
  updateAcademicPeriod,
  deleteAcademicPeriod
} from '../controllers/admin/examController';
import {
  createMaterial,
  getMaterials,
  deleteMaterial,
  uploadDocument,
  upload,
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion
} from '../controllers/admin/materialController';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// Exam Types
router.post('/exam-types', createExamType);
router.get('/exam-types', getExamTypes);
router.put('/exam-types/:id', updateExamType);
router.delete('/exam-types/:id', deleteExamType);

// Departments
router.post('/exam-types/:examTypeId/departments', createDepartment);
router.get('/exam-types/:examTypeId/departments', getDepartments);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Academic Periods
router.post('/departments/:departmentId/academic-periods', createAcademicPeriod);
router.get('/departments/:departmentId/academic-periods', getAcademicPeriods);
router.put('/academic-periods/:id', updateAcademicPeriod);
router.delete('/academic-periods/:id', deleteAcademicPeriod);

// Materials
router.post('/academic-periods/:academicPeriodId/materials', createMaterial);
router.get('/academic-periods/:academicPeriodId/materials', getMaterials);
router.delete('/materials/:id', deleteMaterial);

// Document Upload
router.post('/materials/:materialId/upload', upload.array('files', 10), uploadDocument);

// Questions
router.post('/materials/:materialId/questions', createQuestion);
router.get('/materials/:materialId/questions', getQuestions);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

export default router; 