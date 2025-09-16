import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { UserProgressController } from '../controllers/userProgressController';
import { requireUser, requireAuth, optionalAuth } from '../modules/auth/middleware/auth.middleware';

const router = Router();

// User profile routes (require user authentication)
router.get('/profile', requireUser, UserController.getProfile);
router.put('/profile', requireUser, UserController.updateProfile);

// User progress routes (require user authentication)
router.post('/progress', requireUser, UserProgressController.recordProgress);
router.get('/progress/stats', requireUser, UserProgressController.getUserStats);
router.get('/progress/materials/:materialId', requireUser, UserProgressController.getMaterialProgress);
router.get('/progress/exam-types', requireUser, UserProgressController.getProgressByExamType);
router.post('/progress/materials/:materialId/complete', requireUser, UserProgressController.markCompleted);
router.get('/dashboard', requireUser, UserProgressController.getDashboardData);

// Public routes (optional auth for personalized experience)
router.get('/leaderboard', optionalAuth, UserProgressController.getLeaderboard);

export default router; 