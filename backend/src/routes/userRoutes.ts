import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and search
 * @access  Public
 */
router.get('/', UserController.getUsers);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 */
router.post('/', UserController.createUser);

/**
 * @route   GET /api/users/:id
 * @desc    Get a single user by ID
 * @access  Public
 */
router.get('/:id', UserController.getUserById);

/**
 * @route   PATCH /api/users/:id
 * @desc    Update a user by ID
 * @access  Public
 */
router.patch('/:id', UserController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user by ID
 * @access  Public
 */
router.delete('/:id', UserController.deleteUser);

export default router; 