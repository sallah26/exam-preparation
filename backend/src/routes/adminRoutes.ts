import { Router } from 'express';
import { AdminController } from '../controllers/admin/adminController';

const router = Router();

/**
 * @route   POST /api/admin/register
 * @desc    Register a new admin
 * @access  Public
 */
router.post('/register', AdminController.register);

/**
 * @route   GET /api/admin
 * @desc    Get all admins with pagination and search
 * @access  Private (will be protected later)
 */
router.get('/', AdminController.getAdmins);

/**
 * @route   GET /api/admin/:id
 * @desc    Get a single admin by ID
 * @access  Private (will be protected later)
 */
router.get('/:id', AdminController.getAdminById);

export default router; 