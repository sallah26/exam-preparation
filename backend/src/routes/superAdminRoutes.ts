import { Router } from 'express';
import { SuperAdminController } from '../controllers/admin/superAdminController';
import { requireSuperAdmin } from '../modules/auth/middleware/auth.middleware';

const router = Router();

// All routes require Super Admin authentication
router.use(requireSuperAdmin);

// Admin management routes
router.get('/admins', SuperAdminController.getAllAdmins);
router.post('/admins', SuperAdminController.addAdmin);
router.post('/invite', SuperAdminController.inviteAdmin); // New invitation endpoint
router.get('/admins/:adminId', SuperAdminController.getAdminDetails);
router.put('/admins/:adminId', SuperAdminController.updateAdmin);
router.delete('/admins/:adminId', SuperAdminController.deleteAdmin);

// User management routes
router.get('/users', SuperAdminController.getAllUsers);
router.put('/users/:userId/status', SuperAdminController.updateUserStatus);

// System statistics
router.get('/stats', SuperAdminController.getSystemStats);

export default router; 