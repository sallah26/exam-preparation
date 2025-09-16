import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { JWTService } from '../modules/auth/services/jwt.service';
import { AuthenticationError } from '../modules/auth/utils/auth.errors';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UsersListResponse,
  GetUsersQuery 
} from '../types/user';

export class UserController {
  /**
   * Get current user profile (for authenticated users)
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user },
      });
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile',
      });
    }
  }

  /**
   * Update current user profile (for authenticated users)
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { name, email, currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Get current user
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Prepare update data
      const updateData: any = {};

      if (name !== undefined) {
        updateData.name = name;
      }

      if (email !== undefined && email !== currentUser.email) {
        // Check if email is already taken
        const existingUser = await prisma.user.findFirst({
          where: {
            email: email.toLowerCase(),
            id: { not: userId },
          },
        });

        const existingAdmin = await prisma.admin.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (existingUser || existingAdmin) {
          res.status(400).json({
            success: false,
            message: 'This email is already in use',
          });
          return;
        }

        updateData.email = email.toLowerCase();
      }

      // Handle password change
      if (newPassword) {
        if (!currentPassword) {
          res.status(400).json({
            success: false,
            message: 'Current password is required to change password',
          });
          return;
        }

        // Verify current password
        const isCurrentPasswordValid = await JWTService.verifyPassword(
          currentPassword,
          currentUser.password
        );

        if (!isCurrentPasswordValid) {
          res.status(400).json({
            success: false,
            message: 'Current password is incorrect',
          });
          return;
        }

        // Hash new password
        updateData.password = await JWTService.hashPassword(newPassword);
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user profile',
      });
    }
  }

  /**
   * Get all users with pagination and search
   */
  static async getUsers(req: Request<{}, {}, {}, GetUsersQuery>, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10', search = '' } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause for search
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as any } },
              { email: { contains: search, mode: 'insensitive' as any } },
            ],
          }
        : {};

      // Get users and total count
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      const response: UsersListResponse = {
        users,
        total,
        page: pageNum,
        limit: limitNum,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
      });
    }
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        res.status(404).json({ 
          error: 'Not found',
          message: 'User not found' 
        });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch user' 
      });
    }
  }

  /**
   * Create a new user
   */
  static async createUser(req: Request<{}, {}, CreateUserDto>, res: Response): Promise<void> {
    try {
      const { name, email } = req.body;

      // Validate required fields
      if (!name || !email) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Name and email are required'
        });
        return;
      }

      // Check if user with email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists'
        });
        return;
      }

      // This method is deprecated - users should be created through authentication system
      res.status(410).json({
        success: false,
        message: 'This endpoint is deprecated. Use POST /api/auth/user/register to create new users.',
        redirectTo: '/api/auth/user/register'
      });
      return;
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to create user' 
      });
    }
  }

  /**
   * Update a user by ID (DEPRECATED - Use user profile endpoints)
   */
  static async updateUser(req: Request<{ id: string }>, res: Response): Promise<void> {
    res.status(410).json({
      success: false,
      message: 'This endpoint is deprecated. Users should update their own profiles via PUT /api/users/profile',
      redirectTo: '/api/users/profile'
    });
  }

  /**
   * Delete a user by ID (DEPRECATED - Use super admin endpoints)
   */
  static async deleteUser(req: Request<{ id: string }>, res: Response): Promise<void> {
    res.status(410).json({
      success: false,
      message: 'This endpoint is deprecated. Use super admin endpoints for user management.',
      redirectTo: '/api/super-admin/users'
    });
  }
} 