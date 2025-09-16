import { Request, Response } from 'express';
import { LoginService } from '../services/login.service';
import { CookieService } from '../services/cookie.service';
import { AuthenticationError } from '../utils/auth.errors';

export class LoginController {
  /**
   * Admin login and set secure cookies
   */
  static async adminLogin(req: Request, res: Response): Promise<void> {
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
        message: 'Admin login successful',
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
   * User login and set secure cookies
   */
  static async userLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Authenticate user and get tokens
      const result = await LoginService.authenticateUser({ email, password });

      // Set secure HttpOnly cookie (access token only for users)
      const accessTokenMaxAge = 15 * 60 * 1000; // 15 minutes
      CookieService.setAccessTokenCookie(res, result.tokens.accessToken, accessTokenMaxAge);

      // Return user data and tokens
      const responseData: any = {
        success: true,
        message: 'User login successful',
        data: {
          user: result.user,
          tokens: {
            accessExpiresIn: result.tokens.accessExpiresIn,
          },
        },
      };

      // Include tokens in response body for development or when explicitly requested
      const includeTokens = process.env.NODE_ENV === 'development' || req.query.includeTokens === 'true';
      if (includeTokens) {
        responseData.data.tokens.accessToken = result.tokens.accessToken;
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
   * User registration
   */
  static async userRegister(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      // Register user and get tokens
      const result = await LoginService.registerUser({ name, email, password });

      // Set secure HttpOnly cookie
      const accessTokenMaxAge = 15 * 60 * 1000; // 15 minutes
      CookieService.setAccessTokenCookie(res, result.tokens.accessToken, accessTokenMaxAge);

      // Return user data and tokens
      const responseData: any = {
        success: true,
        message: 'User registration successful',
        data: {
          user: result.user,
          tokens: {
            accessExpiresIn: result.tokens.accessExpiresIn,
          },
        },
      };

      // Include tokens in response body for development or when explicitly requested
      const includeTokens = process.env.NODE_ENV === 'development' || req.query.includeTokens === 'true';
      if (includeTokens) {
        responseData.data.tokens.accessToken = result.tokens.accessToken;
      }

      res.status(201).json(responseData);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        res.status(400).json({
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
   * Universal login - detects whether it's admin or user based on email
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // First check if this email belongs to an admin
      const { prisma } = await import('../../../prisma/client');
      const admin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true },
      });

      if (admin) {
        // Use admin login
        await LoginController.adminLogin(req, res);
      } else {
        // Use user login
        await LoginController.userLogin(req, res);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Refresh access token (admin only)
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Get refresh token from cookie or body
      let refreshToken = req.cookies?.['refreshToken'];
      
      if (!refreshToken && req.body.refreshToken) {
        refreshToken = req.body.refreshToken;
      }

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token required',
        });
        return;
      }

      // Refresh access token
      const result = await LoginService.refreshAccessToken(refreshToken);

      // Set new access token cookie
      const accessTokenMaxAge = 15 * 60 * 1000; // 15 minutes
      CookieService.setAccessTokenCookie(res, result.accessToken, accessTokenMaxAge);

      // Return new access token
      const responseData: any = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessExpiresIn: result.expiresIn,
          },
        },
      };

      // Include token in response body for development
      const includeTokens = process.env.NODE_ENV === 'development' || req.query.includeTokens === 'true';
      if (includeTokens) {
        responseData.data.tokens.accessToken = result.accessToken;
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
   * Logout (revoke refresh token)
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Get refresh token from cookie
      const refreshToken = req.cookies?.['refreshToken'];

      if (refreshToken) {
        // Revoke refresh token from database
        await LoginService.logoutAdmin(refreshToken);
      }

      // Clear cookies
      CookieService.clearAccessTokenCookie(res);
      CookieService.clearRefreshTokenCookie(res);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      // Clear cookies even if there's an error
      CookieService.clearAccessTokenCookie(res);
      CookieService.clearRefreshTokenCookie(res);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            type: user.type,
            ...(user.isSuperAdmin !== undefined && { isSuperAdmin: user.isSuperAdmin }),
          },
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
   * Verify token validity
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
          data: { valid: false },
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          valid: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            type: user.type,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
} 