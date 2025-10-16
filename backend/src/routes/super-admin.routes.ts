import { Router } from 'express';
import { SuperAdminController } from '../controllers/admin/super-admin.controller';
import { authMiddleware } from '../modules/auth/middleware/auth.middleware';
import { requireSuperAdmin } from '../middleware/super-admin.middleware';

const router = Router();

// All super admin routes require authentication and super admin role
router.use(authMiddleware);
router.use(requireSuperAdmin);

/**
 * @route   POST /api/super-admin/invite
 * @desc    Invite a new admin
 * @access  Super Admin only
 */
router.post('/invite', SuperAdminController.inviteAdmin);

/**
 * @route   GET /api/super-admin/admins
 * @desc    Get all admins
 * @access  Super Admin only
 */
router.get('/admins', SuperAdminController.getAllAdmins);

/**
 * @route   GET /api/super-admin/admins/:id
 * @desc    Get admin by ID
 * @access  Super Admin only
 */
router.get('/admins/:id', SuperAdminController.getAdminById);

/**
 * @route   PUT /api/super-admin/admins/:id/toggle-status
 * @desc    Toggle admin active status
 * @access  Super Admin only
 */
router.put('/admins/:id/toggle-status', SuperAdminController.toggleAdminStatus);

/**
 * @route   DELETE /api/super-admin/admins/:id
 * @desc    Delete admin (soft delete)
 * @access  Super Admin only
 */
router.delete('/admins/:id', SuperAdminController.deleteAdmin);

/**
 * @route   GET /api/super-admin/stats
 * @desc    Get admin statistics
 * @access  Super Admin only
 */
router.get('/stats', SuperAdminController.getAdminStats);

export default router;

