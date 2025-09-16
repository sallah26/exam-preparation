import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../utils/auth.errors';
import { LoginService } from '../services/login.service';
import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        type: 'user' | 'admin';
        id: string;
        email: string;
        name: string;
        role: UserRole;
        isActive: boolean;
        isSuperAdmin?: boolean;
      };
      admin?: {
        adminId: string;
        email: string;
        fullName: string;
        role: UserRole;
        isSuperAdmin: boolean;
      };
    }
  }
}

/**
 * Base authentication middleware - validates token and attaches user info
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

    // Get user info from token
    const userInfo = await LoginService.getUserByToken(token);

    // Attach user info to request
    req.user = userInfo;

    // Also attach admin info for backward compatibility
    if (userInfo.type === 'admin') {
      req.admin = {
        adminId: userInfo.id,
        email: userInfo.email,
        fullName: userInfo.name,
        role: userInfo.role,
        isSuperAdmin: userInfo.isSuperAdmin || false,
      };
    }

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
 * Role-based authentication middleware factory
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // First run base auth middleware
    await new Promise<void>((resolve, reject) => {
      authMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user has required role
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

/**
 * Admin-only authentication middleware (ADMIN or SUPER_ADMIN)
 */
export const requireAdmin = requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

/**
 * Super Admin-only authentication middleware
 */
export const requireSuperAdmin = requireRole([UserRole.SUPER_ADMIN]);

/**
 * User-only authentication middleware
 */
export const requireUser = requireRole([UserRole.USER]);

/**
 * Admin or User authentication middleware (any authenticated user)
 */
export const requireAuth = requireRole([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]);

/**
 * Optional authentication middleware
 * Doesn't fail if no token is provided, but attaches user info if valid token exists
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
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

    // If no token, continue without user info
    if (!token) {
      next();
      return;
    }

    // Try to get user info from token
    try {
      const userInfo = await LoginService.getUserByToken(token);
      req.user = userInfo;

      // Also attach admin info for backward compatibility
      if (userInfo.type === 'admin') {
        req.admin = {
          adminId: userInfo.id,
          email: userInfo.email,
          fullName: userInfo.name,
          role: userInfo.role,
          isSuperAdmin: userInfo.isSuperAdmin || false,
        };
      }
    } catch (error) {
      // Token is invalid, but don't fail - just continue without user info
      console.log('Optional auth failed:', error instanceof AuthenticationError ? error.message : 'Unknown error');
    }

    next();
  } catch (error) {
    // Don't fail on errors in optional auth
    next();
  }
};

/**
 * Middleware to check if user is admin (for conditional logic)
 */
export const checkAdminRole = (req: Request, res: Response, next: NextFunction): void => {
  const isAdmin = req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN;
  (req as any).isAdmin = isAdmin;
  next();
};

/**
 * Middleware to check if user is super admin (for conditional logic)
 */
export const checkSuperAdminRole = (req: Request, res: Response, next: NextFunction): void => {
  const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
  (req as any).isSuperAdmin = isSuperAdmin;
  next();
}; 