import { Request, Response } from 'express';
import { UserProgressService } from '../services/userProgressService';
import { AuthenticationError } from '../modules/auth/utils/auth.errors';

export class UserProgressController {
  /**
   * Record user progress for a material
   */
  static async recordProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { materialId, timeSpent, completed } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!materialId) {
        res.status(400).json({
          success: false,
          message: 'Material ID is required',
        });
        return;
      }

      await UserProgressService.recordProgress({
        userId,
        materialId,
        timeSpent: timeSpent || 0,
        completed: completed || false,
      });

      res.status(200).json({
        success: true,
        message: 'Progress recorded successfully',
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Error recording progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record progress',
      });
    }
  }

  /**
   * Get user's overall progress statistics
   */
  static async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const stats = await UserProgressService.getUserStats(userId);

      res.status(200).json({
        success: true,
        message: 'User statistics retrieved successfully',
        data: { stats },
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Error getting user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user statistics',
      });
    }
  }

  /**
   * Get user's progress for a specific material
   */
  static async getMaterialProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { materialId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!materialId) {
        res.status(400).json({
          success: false,
          message: 'Material ID is required',
        });
        return;
      }

      const progress = await UserProgressService.getMaterialProgress(userId, materialId);

      res.status(200).json({
        success: true,
        message: 'Material progress retrieved successfully',
        data: { progress },
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Error getting material progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve material progress',
      });
    }
  }

  /**
   * Get user's progress grouped by exam type
   */
  static async getProgressByExamType(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const progressByExamType = await UserProgressService.getProgressByExamType(userId);

      res.status(200).json({
        success: true,
        message: 'Progress by exam type retrieved successfully',
        data: { progressByExamType },
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Error getting progress by exam type:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve progress by exam type',
      });
    }
  }

  /**
   * Mark material as completed
   */
  static async markCompleted(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { materialId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!materialId) {
        res.status(400).json({
          success: false,
          message: 'Material ID is required',
        });
        return;
      }

      await UserProgressService.markCompleted(userId, materialId);

      res.status(200).json({
        success: true,
        message: 'Material marked as completed',
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Error marking material as completed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark material as completed',
      });
    }
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await UserProgressService.getLeaderboard(Number(limit));

      res.status(200).json({
        success: true,
        message: 'Leaderboard retrieved successfully',
        data: { leaderboard },
      });
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve leaderboard',
      });
    }
  }

  /**
   * Get dashboard data for user
   */
  static async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Get all user data in parallel
      const [stats, progressByExamType, leaderboard] = await Promise.all([
        UserProgressService.getUserStats(userId),
        UserProgressService.getProgressByExamType(userId),
        UserProgressService.getLeaderboard(5),
      ]);

      // Find user's position in leaderboard
      const userPosition = leaderboard.findIndex(user => user.id === userId) + 1;

      const dashboardData = {
        stats,
        progressByExamType,
        leaderboard: {
          topUsers: leaderboard,
          userPosition: userPosition > 0 ? userPosition : null,
        },
      };

      res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: dashboardData,
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error('Error getting dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard data',
      });
    }
  }
} 