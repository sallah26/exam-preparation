import { Request, Response } from 'express';
import { LoginService } from '../services/login.service';
import { CookieService } from '../services/cookie.service';
import { AuthenticationError } from '../utils/auth.errors';

export class LoginController {
  /**
   * Login admin and set secure cookies
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Authenticate admin and get tokens
      const result = await LoginService.authenticateAdmin({ email, password });

      // Set secure HttpOnly cookies
      const accessTokenMaxAge = 15 * 60 * 1000; // 15 minutes
      const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      CookieService.setAccessTokenCookie(res, result.tokens.accessToken, accessTokenMaxAge);
      CookieService.setRefreshTokenCookie(res, result.tokens.refreshToken, refreshTokenMaxAge);

      // Return admin data and tokens (for frontend access)
      const responseData: any = {
        success: true,
        message: 'Login successful',
        data: {
          admin: result.admin,
          tokens: {
            accessExpiresIn: result.tokens.accessExpiresIn,
            refreshExpiresIn: result.tokens.refreshExpiresIn,
          },
        },
      };

      // Include tokens in response body for development or when explicitly requested
      const includeTokens = process.env.NODE_ENV === 'development' || req.query.includeTokens === 'true';
      if (includeTokens) {
        responseData.data.tokens.accessToken = result.tokens.accessToken;
        responseData.data.tokens.refreshToken = result.tokens.refreshToken;
      }

      res.status(200).json(responseData);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.['refreshToken'];

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token not provided',
        });
        return;
      }

      // Refresh access token
      const result = await LoginService.refreshAccessToken(refreshToken);

      // Set new access token cookie
      const accessTokenMaxAge = 15 * 60 * 1000; // 15 minutes
      CookieService.setAccessTokenCookie(res, result.accessToken, accessTokenMaxAge);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Logout admin and clear cookies
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).admin?.adminId;
      const refreshToken = req.cookies?.['refreshToken'];

      if (adminId) {
        // Revoke refresh token if available
        await LoginService.logoutAdmin(adminId, refreshToken);
      }

      // Clear all auth cookies
      CookieService.clearAllAuthCookies(res);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      // Even if logout fails, clear cookies
      CookieService.clearAllAuthCookies(res);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    }
  }

  /**
   * Get admin profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).admin?.adminId;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const admin = await LoginService.getAdminProfile(adminId);

      res.status(200).json({
        success: true,
        data: {
          admin,
        },
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get active sessions for admin
   */
  static async getActiveSessions(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).admin?.adminId;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const sessions = await LoginService.getActiveSessions(adminId);

      res.status(200).json({
        success: true,
        data: {
          sessions,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Revoke specific session
   */
  static async revokeSession(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).admin?.adminId;
      const { sessionId } = req.params;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
        return;
      }

      await LoginService.revokeSession(adminId, sessionId);

      res.status(200).json({
        success: true,
        message: 'Session revoked successfully',
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Revoke all sessions for admin
   */
  static async revokeAllSessions(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).admin?.adminId;

      if (!adminId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      await LoginService.logoutAdmin(adminId);

      res.status(200).json({
        success: true,
        message: 'All sessions revoked successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
} 