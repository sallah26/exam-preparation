import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../prisma/client';
import { 
  AdminRegisterDto,
  AdminResponse,
  AdminRegisterResponse 
} from '../../types/admin';
import { adminRegisterSchema } from '../../validations/admin';

export class AdminController {
  /**
   * Register a new admin
   */
  static async register(req: Request<{}, {}, AdminRegisterDto>, res: Response): Promise<void> {
    try {
      // Validate input using Zod
      const validationResult = adminRegisterSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Invalid input data',  
          details: validationResult.error.issues
        });
        return;
      }

      const { fullName, email, password } = validationResult.data;

      // Check if admin with the same email already exists
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingAdmin) {
        res.status(409).json({
          error: 'Conflict',
          message: 'Admin with this email already exists'
        });
        return;
      }

      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create the admin
      const admin = await prisma.admin.create({
        data: {
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
        },
      });

      // Remove password from response
      const adminResponse: AdminResponse = {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      };

      const response: AdminRegisterResponse = {
        admin: adminResponse,
        message: 'Admin registered successfully'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error registering admin:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to register admin' 
      });
    }
  }

  /**
   * Get all admins with pagination and search
   */
  static async getAdmins(req: Request<{}, {}, {}, { page?: string; limit?: string; search?: string; isActive?: string }>, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10', search = '', isActive } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' as any } },
          { email: { contains: search, mode: 'insensitive' as any } },
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // Get admins and total count
      const [admins, total] = await Promise.all([
        prisma.admin.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            fullName: true,
            email: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.admin.count({ where }),
      ]);

      res.status(200).json({
        admins,
        total,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch admins' 
      });
    }
  }

  /**
   * Get a single admin by ID
   */
  static async getAdminById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const admin = await prisma.admin.findUnique({
        where: { id },
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!admin) {
        res.status(404).json({ 
          error: 'Not found',
          message: 'Admin not found' 
        });
        return;
      }

      res.status(200).json(admin);
    } catch (error) {
      console.error('Error fetching admin:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch admin' 
      });
    }
  }
} 