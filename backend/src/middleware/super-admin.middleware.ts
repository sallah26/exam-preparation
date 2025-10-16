import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Middleware to require super admin role
 */
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if user is authenticated
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  // Check if user is super admin
  if (req.user.role !== UserRole.SUPER_ADMIN) {
    res.status(403).json({
      success: false,
      message: 'Super admin access required',
    });
    return;
  }

  // Check if admin and verify isSuperAdmin flag
  if (req.user.type === 'admin' && !req.user.isSuperAdmin) {
    res.status(403).json({
      success: false,
      message: 'Super admin access required',
    });
    return;
  }

  next();
};

/**
 * Middleware to require admin role (ADMIN or SUPER_ADMIN)
 */
export const requireAdminRole = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if user is authenticated
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  // Check if user has admin or super admin role
  if (
    req.user.role !== UserRole.ADMIN &&
    req.user.role !== UserRole.SUPER_ADMIN
  ) {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }

  // Must be admin type (not user type)
  if (req.user.type !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
    return;
  }

  next();
};

/**
 * Middleware to require user role (students only)
 */
export const requireUserRole = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if user is authenticated
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  // Check if user has USER role
  if (req.user.role !== UserRole.USER) {
    res.status(403).json({
      success: false,
      message: 'Student access required',
    });
    return;
  }

  // Must be user type (not admin type)
  if (req.user.type !== 'user') {
    res.status(403).json({
      success: false,
      message: 'Student access required',
    });
    return;
  }

  next();
};

