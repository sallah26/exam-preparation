import { Router } from 'express';
import { LoginController } from '../controllers/login.controller';
import { authMiddleware, requireActiveAdmin } from '../middleware/auth.middleware';
import { validateLoginInput } from '../validators/login.validator';

const router = Router();

// Public routes
router.post('/login', validateLoginInput, LoginController.login);
router.post('/refresh', LoginController.refreshToken);

// Protected routes
router.post('/logout', authMiddleware, LoginController.logout);
router.get('/profile', authMiddleware, requireActiveAdmin, LoginController.getProfile);
router.get('/sessions', authMiddleware, requireActiveAdmin, LoginController.getActiveSessions);
router.delete('/sessions/:sessionId', authMiddleware, requireActiveAdmin, LoginController.revokeSession);
router.delete('/sessions', authMiddleware, requireActiveAdmin, LoginController.revokeAllSessions);

export default router; 