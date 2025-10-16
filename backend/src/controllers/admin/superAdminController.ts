import { Request, Response } from 'express';
import { prisma } from '../../prisma/client';
import { JWTService } from '../../modules/auth/services/jwt.service';
import { AuthenticationError } from '../../modules/auth/utils/auth.errors';
import { UserRole } from '@prisma/client';
import { AdminInvitationService } from '../../services/admin-invitation.service';
import { EmailService } from '../../services/email.service';

export class SuperAdminController {
  /**
   * Get all admins (super admin only)
   */
  static async getAllAdmins(req: Request, res: Response): Promise<void> {
    try {
      const admins = await prisma.admin.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
          isSuperAdmin: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          creator: {
            select: {
              fullName: true,
              email: true,
            },
          },
          createdAdmins: {
            select: {
              id: true,
              fullName: true,
              email: true,
              isActive: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json({
        success: true,
        message: 'Admins retrieved successfully',
        data: { admins },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve admins',
      });
    }
  }

  /**
   * Invite a new admin with email
   */
  static async inviteAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email } = req.body;

      // Validate input
      if (!fullName || !email) {
        res.status(400).json({
          success: false,
          message: 'Full name and email are required',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
        return;
      }

      // Get requesting admin ID from auth middleware
      const invitedByAdminId = req.user?.id;

      if (!invitedByAdminId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Invite admin
      const result = await AdminInvitationService.inviteAdmin({
        fullName,
        email,
        invitedByAdminId,
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error inviting admin:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Add new admin (super admin only) - DEPRECATED: Use inviteAdmin instead
   */
  static async addAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, password, isSuperAdmin = false } = req.body;
      const creatorId = req.user?.id;

      if (!creatorId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Validate required fields
      if (!fullName || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Full name, email, and password are required',
        });
        return;
      }

      // Check if email already exists (admin or user)
      const [existingAdmin, existingUser] = await Promise.all([
        prisma.admin.findUnique({
          where: { email: email.toLowerCase() },
        }),
        prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        }),
      ]);

      if (existingAdmin) {
        res.status(400).json({
          success: false,
          message: 'An admin with this email already exists',
        });
        return;
      }

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'This email is already registered as a user account',
        });
        return;
      }

      // Hash password
      const hashedPassword = await JWTService.hashPassword(password);

      // Create admin
      const newAdmin = await prisma.admin.create({
        data: {
          fullName,
          email: email.toLowerCase(),
          password: hashedPassword,
          isSuperAdmin,
          createdBy: creatorId,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
          isSuperAdmin: true,
          createdAt: true,
          creator: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: { admin: newAdmin },
      });
    } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create admin',
      });
    }
  }

  /**
   * Update admin (super admin only)
   */
  static async updateAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { adminId } = req.params;
      const { fullName, email, isActive, isSuperAdmin, password } = req.body;
      const updaterId = req.user?.id;

      if (!updaterId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      if (!adminId) {
        res.status(400).json({
          success: false,
          message: 'Admin ID is required',
        });
        return;
      }

      // Find the admin to update
      const adminToUpdate = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!adminToUpdate) {
        res.status(404).json({
          success: false,
          message: 'Admin not found',
        });
        return;
      }

      // Prevent self-deactivation
      if (adminToUpdate.id === updaterId && isActive === false) {
        res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account',
        });
        return;
      }

      // Prepare update data
      const updateData: any = {};
      
      if (fullName !== undefined) updateData.fullName = fullName;
      if (email !== undefined) updateData.email = email.toLowerCase();
      if (isActive !== undefined) updateData.isActive = isActive;
      if (isSuperAdmin !== undefined) updateData.isSuperAdmin = isSuperAdmin;
      
      if (password) {
        updateData.password = await JWTService.hashPassword(password);
      }

      // Check if email is already taken by another admin/user
      if (email && email.toLowerCase() !== adminToUpdate.email) {
        const [existingAdmin, existingUser] = await Promise.all([
          prisma.admin.findFirst({
            where: {
              email: email.toLowerCase(),
              id: { not: adminId },
            },
          }),
          prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          }),
        ]);

        if (existingAdmin || existingUser) {
          res.status(400).json({
            success: false,
            message: 'This email is already in use',
          });
          return;
        }
      }

      // Update admin
      const updatedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
          isSuperAdmin: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      // If admin was deactivated, revoke all their tokens
      if (isActive === false) {
        await JWTService.revokeAllRefreshTokens(adminId);
      }

      res.status(200).json({
        success: true,
        message: 'Admin updated successfully',
        data: { admin: updatedAdmin },
      });
    } catch (error) {
      console.error('Error updating admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update admin',
      });
    }
  }

  /**
   * Delete admin (super admin only)
   */
  static async deleteAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { adminId } = req.params;
      const deleterId = req.user?.id;

      if (!deleterId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      if (!adminId) {
        res.status(400).json({
          success: false,
          message: 'Admin ID is required',
        });
        return;
      }

      // Find the admin to delete
      const adminToDelete = await prisma.admin.findUnique({
        where: { id: adminId },
        include: {
          createdAdmins: {
            select: { id: true },
          },
        },
      });

      if (!adminToDelete) {
        res.status(404).json({
          success: false,
          message: 'Admin not found',
        });
        return;
      }

      // Prevent self-deletion
      if (adminToDelete.id === deleterId) {
        res.status(400).json({
          success: false,
          message: 'You cannot delete your own account',
        });
        return;
      }

      // Check if admin has created other admins
      if (adminToDelete.createdAdmins.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete admin who has created other admins. Transfer or delete their created admins first.',
        });
        return;
      }

      // Revoke all refresh tokens first
      await JWTService.revokeAllRefreshTokens(adminId);

      // Delete admin
      await prisma.admin.delete({
        where: { id: adminId },
      });

      res.status(200).json({
        success: true,
        message: 'Admin deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete admin',
      });
    }
  }

  /**
   * Get admin details (super admin only)
   */
  static async getAdminDetails(req: Request, res: Response): Promise<void> {
    try {
      const { adminId } = req.params;

      if (!adminId) {
        res.status(400).json({
          success: false,
          message: 'Admin ID is required',
        });
        return;
      }

      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
          isSuperAdmin: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          creator: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          createdAdmins: {
            select: {
              id: true,
              fullName: true,
              email: true,
              isActive: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          refreshTokens: {
            where: {
              isRevoked: false,
              expiresAt: {
                gt: new Date(),
              },
            },
            select: {
              id: true,
              createdAt: true,
              expiresAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!admin) {
        res.status(404).json({
          success: false,
          message: 'Admin not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Admin details retrieved successfully',
        data: { admin },
      });
    } catch (error) {
      console.error('Error getting admin details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve admin details',
      });
    }
  }

  /**
   * Get system statistics (super admin only)
   */
  static async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalAdmins,
        activeAdmins,
        superAdmins,
        totalUsers,
        activeUsers,
        totalExamTypes,
        totalDepartments,
        totalMaterials,
      ] = await Promise.all([
        prisma.admin.count(),
        prisma.admin.count({ where: { isActive: true } }),
        prisma.admin.count({ where: { isSuperAdmin: true } }),
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.examType.count(),
        prisma.department.count(),
        prisma.material.count(),
      ]);

      const stats = {
        admins: {
          total: totalAdmins,
          active: activeAdmins,
          superAdmins,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        content: {
          examTypes: totalExamTypes,
          departments: totalDepartments,
          materials: totalMaterials,
        },
      };

      res.status(200).json({
        success: true,
        message: 'System statistics retrieved successfully',
        data: { stats },
      });
    } catch (error) {
      console.error('Error getting system stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system statistics',
      });
    }
  }

  /**
   * Get all users (super admin only)
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const whereClause = search
        ? {
            OR: [
              { name: { contains: search as string, mode: 'insensitive' as const } },
              { email: { contains: search as string, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            userProgress: {
              select: {
                materialId: true,
                completed: true,
                timeSpent: true,
                lastAccessed: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: Number(limit),
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      // Calculate user statistics
      const usersWithStats = users.map(user => ({
        ...user,
        stats: {
          totalMaterials: user.userProgress.length,
          completedMaterials: user.userProgress.filter(p => p.completed).length,
          totalTimeSpent: user.userProgress.reduce((sum, p) => sum + p.timeSpent, 0),
          lastActivity: user.userProgress.length > 0 
            ? Math.max(...user.userProgress.map(p => new Date(p.lastAccessed).getTime()))
            : null,
        },
        userProgress: undefined, // Remove detailed progress from response
      }));

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: usersWithStats,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalUsers,
            pages: Math.ceil(totalUsers / Number(limit)),
          },
        },
      });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
      });
    }
  }

  /**
   * Update user status (super admin only)
   */
  static async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      if (typeof isActive !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'isActive must be a boolean value',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
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
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status',
      });
    }
  }
} 