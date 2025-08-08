import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../utils/auth.errors';
import { JWTService } from '../services/jwt.service';

declare global {
  namespace Express {
    interface Request {
      admin?: {
        adminId: string;
        email: string;
        fullName: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using access token
 * Supports both cookie-based and header-based authentication
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookie first (more secure)
    let token = req.cookies?.['accessToken'];

    // Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    // Verify access token
    const decoded = JWTService.verifyAccessToken(token);

    // Attach admin info to request
    req.admin = {
      adminId: decoded.adminId,
      email: decoded.email,
      fullName: decoded.fullName,
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid access token',
    });
  }
};

/**
 * Optional authentication middleware
 * Doesn't fail if no token is provided, but attaches admin info if valid token exists
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from cookie first
    let token = req.cookies?.['accessToken'];

    // Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      // Verify access token
      const decoded = JWTService.verifyAccessToken(token);

      // Attach admin info to request
      req.admin = {
        adminId: decoded.adminId,
        email: decoded.email,
        fullName: decoded.fullName,
      };
    }
  } catch (error) {
    // Silently ignore token errors for optional auth
    // req.admin will remain undefined
  }

  next();
};

/**
 * Middleware to require active admin status
 */
export const requireActiveAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Check if admin is still active in database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.adminId },
      select: { isActive: true },
    });

    if (!admin || !admin.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Middleware to check if user is authenticated (for conditional logic)
 */
export const isAuthenticated = (req: Request): boolean => {
  return !!req.admin;
};

/**
 * Middleware to get admin ID from request
 */
export const getAdminId = (req: Request): string | null => {
  return req.admin?.adminId || null;
}; 