import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Admin login validation schema
 */
export const adminLoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be less than 255 characters')
    .transform((email) => email.toLowerCase().trim()),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
});

/**
 * Admin login response schema
 */
export const adminLoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    admin: z.object({
      id: z.string(),
      fullName: z.string(),
      email: z.string(),
      isActive: z.boolean(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
    token: z.string(),
    expiresIn: z.string(),
  }),
});

// Type exports
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminLoginResponse = z.infer<typeof adminLoginResponseSchema>;

/**
 * Validate admin login input
 */
export const validateAdminLogin = (data: unknown) => {
  return adminLoginSchema.safeParse(data);
};

/**
 * Validate admin login response
 */
export const validateAdminLoginResponse = (data: unknown) => {
  return adminLoginResponseSchema.safeParse(data);
};

/**
 * Middleware for validating login input
 */
export const validateLoginInput = (req: Request, res: Response, next: NextFunction): void => {
  const result = adminLoginSchema.safeParse(req.body);
  
  if (!result.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }
  
  // Replace request body with validated data
  req.body = result.data;
  next();
}; 