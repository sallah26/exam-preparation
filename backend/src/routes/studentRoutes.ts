import { Router } from 'express';
import {
  getExamTypes,
  getDepartmentsByExamType,
  getAcademicPeriodsByDepartment,
  getMaterialsByAcademicPeriod,
  getMaterialContent,
  serveDocument
} from '../controllers/studentController';

const router = Router();

// Public routes - no authentication required
router.get('/exam-types', getExamTypes);
router.get('/exam-types/:examTypeId/departments', getDepartmentsByExamType);
router.get('/departments/:departmentId/academic-periods', getAcademicPeriodsByDepartment);
router.get('/academic-periods/:academicPeriodId/materials', getMaterialsByAcademicPeriod);
router.get('/materials/:materialId/content', getMaterialContent);
router.get('/files/:filename', serveDocument);

export default router; 