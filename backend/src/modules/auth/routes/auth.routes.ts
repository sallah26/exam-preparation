import { Router } from 'express';
import { LoginController } from '../controllers/login.controller';
import { authMiddleware, requireSuperAdmin, requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.post('/login', LoginController.login); // Universal login
router.post('/admin/login', LoginController.adminLogin); // Admin-specific login
router.post('/user/login', LoginController.userLogin); // User-specific login
router.post('/user/register', LoginController.userRegister); // User registration

// Protected routes (authentication required)
router.post('/refresh', authMiddleware, LoginController.refreshToken); // Token refresh (admin only)
router.post('/logout', authMiddleware, LoginController.logout); // Logout
router.get('/profile', authMiddleware, LoginController.getProfile); // Get current user profile
router.get('/verify', authMiddleware, LoginController.verifyToken); // Verify token validity

export default router; 