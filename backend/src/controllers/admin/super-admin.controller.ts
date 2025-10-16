import { Request, Response } from 'express';
import { AdminInvitationService } from '../../services/admin-invitation.service';

export class SuperAdminController {
  /**
   * Invite a new admin
   * POST /api/super-admin/invite
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
   * Get all admins
   * GET /api/super-admin/admins
   */
  static async getAllAdmins(req: Request, res: Response): Promise<void> {
    try {
      const admins = await AdminInvitationService.getAllAdmins();

      res.status(200).json({
        success: true,
        data: admins,
      });
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get admin by ID
   * GET /api/super-admin/admins/:id
   */
  static async getAdminById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const admin = await AdminInvitationService.getAdminById(id);

      if (!admin) {
        res.status(404).json({
          success: false,
          message: 'Admin not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: admin,
      });
    } catch (error) {
      console.error('Error fetching admin:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Toggle admin status (activate/deactivate)
   * PUT /api/super-admin/admins/:id/toggle-status
   */
  static async toggleAdminStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const requestingAdminId = req.user?.id;

      if (!requestingAdminId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await AdminInvitationService.toggleAdminStatus(
        id,
        requestingAdminId
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error toggling admin status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Delete admin
   * DELETE /api/super-admin/admins/:id
   */
  static async deleteAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const requestingAdminId = req.user?.id;

      if (!requestingAdminId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await AdminInvitationService.deleteAdmin(
        id,
        requestingAdminId
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get admin statistics
   * GET /api/super-admin/stats
   */
  static async getAdminStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminInvitationService.getAdminStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

