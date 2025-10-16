import { prisma } from '../config/database';
import { JWTService } from '../modules/auth/services/jwt.service';
import { EmailService } from './email.service';
import { generateSecurePassword } from '../utils/password-generator';

export interface InviteAdminInput {
  fullName: string;
  email: string;
  invitedByAdminId: string;
}

export interface InviteAdminResponse {
  success: boolean;
  message: string;
  admin?: {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
  };
  temporaryPassword?: string; // Only returned once
}

export interface AdminListItem {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  creator?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export class AdminInvitationService {
  /**
   * Invite a new admin
   */
  static async inviteAdmin(input: InviteAdminInput): Promise<InviteAdminResponse> {
    const { fullName, email, invitedByAdminId } = input;

    // Check if email is already registered as admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) {
      return {
        success: false,
        message: 'An admin with this email already exists',
      };
    }

    // Check if email is registered as user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'This email is already registered as a student account',
      };
    }

    // Get the inviting admin details
    const invitingAdmin = await prisma.admin.findUnique({
      where: { id: invitedByAdminId },
      select: {
        fullName: true,
        isSuperAdmin: true,
      },
    });

    if (!invitingAdmin) {
      return {
        success: false,
        message: 'Inviting admin not found',
      };
    }

    // Only super admins can invite other admins
    if (!invitingAdmin.isSuperAdmin) {
      return {
        success: false,
        message: 'Only super admins can invite new admins',
      };
    }

    // Generate secure password
    const temporaryPassword = generateSecurePassword(16);
    const hashedPassword = await JWTService.hashPassword(temporaryPassword);

    // Create new admin
    const newAdmin = await prisma.admin.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        createdBy: invitedByAdminId,
        isActive: true,
        isSuperAdmin: false, // New admins are not super admins by default
      },
    });

    // Send invitation email
    const loginUrl = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/auth/login`
      : 'http://localhost:3000/auth/login';

    const emailSent = await EmailService.sendAdminInvitation({
      fullName,
      email: email.toLowerCase(),
      password: temporaryPassword,
      invitedBy: invitingAdmin.fullName,
      loginUrl,
    });

    if (!emailSent) {
      console.warn('Failed to send invitation email, but admin was created');
    }

    return {
      success: true,
      message: 'Admin invitation sent successfully',
      admin: {
        id: newAdmin.id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        isActive: newAdmin.isActive,
        createdAt: newAdmin.createdAt,
      },
      temporaryPassword, // Return once for manual sharing if email fails
    };
  }

  /**
   * Get all admins (super admin only)
   */
  static async getAllAdmins(): Promise<AdminListItem[]> {
    const admins = await prisma.admin.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return admins;
  }

  /**
   * Get admin by ID
   */
  static async getAdminById(adminId: string): Promise<AdminListItem | null> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return admin;
  }

  /**
   * Toggle admin active status
   */
  static async toggleAdminStatus(
    adminId: string,
    requestingAdminId: string
  ): Promise<{ success: boolean; message: string; admin?: AdminListItem }> {
    // Get requesting admin
    const requestingAdmin = await prisma.admin.findUnique({
      where: { id: requestingAdminId },
    });

    if (!requestingAdmin?.isSuperAdmin) {
      return {
        success: false,
        message: 'Only super admins can change admin status',
      };
    }

    // Cannot deactivate yourself
    if (adminId === requestingAdminId) {
      return {
        success: false,
        message: 'You cannot change your own status',
      };
    }

    // Get target admin
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!targetAdmin) {
      return {
        success: false,
        message: 'Admin not found',
      };
    }

    // Cannot deactivate other super admins
    if (targetAdmin.isSuperAdmin) {
      return {
        success: false,
        message: 'Cannot change status of other super admins',
      };
    }

    // Toggle status
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        isActive: !targetAdmin.isActive,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: `Admin ${updatedAdmin.isActive ? 'activated' : 'deactivated'} successfully`,
      admin: updatedAdmin,
    };
  }

  /**
   * Delete admin (soft delete by deactivating)
   */
  static async deleteAdmin(
    adminId: string,
    requestingAdminId: string
  ): Promise<{ success: boolean; message: string }> {
    // Get requesting admin
    const requestingAdmin = await prisma.admin.findUnique({
      where: { id: requestingAdminId },
    });

    if (!requestingAdmin?.isSuperAdmin) {
      return {
        success: false,
        message: 'Only super admins can delete admins',
      };
    }

    // Cannot delete yourself
    if (adminId === requestingAdminId) {
      return {
        success: false,
        message: 'You cannot delete yourself',
      };
    }

    // Get target admin
    const targetAdmin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!targetAdmin) {
      return {
        success: false,
        message: 'Admin not found',
      };
    }

    // Cannot delete other super admins
    if (targetAdmin.isSuperAdmin) {
      return {
        success: false,
        message: 'Cannot delete other super admins',
      };
    }

    // Soft delete by deactivating
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        isActive: false,
      },
    });

    return {
      success: true,
      message: 'Admin deleted successfully',
    };
  }

  /**
   * Get admin statistics
   */
  static async getAdminStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    superAdmins: number;
  }> {
    const [total, active, inactive, superAdmins] = await Promise.all([
      prisma.admin.count(),
      prisma.admin.count({ where: { isActive: true } }),
      prisma.admin.count({ where: { isActive: false } }),
      prisma.admin.count({ where: { isSuperAdmin: true } }),
    ]);

    return {
      total,
      active,
      inactive,
      superAdmins,
    };
  }
}

