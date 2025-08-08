import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UsersListResponse,
  GetUsersQuery 
} from '../types/user';

export class UserController {
  /**
   * Get all users with pagination and search
   */
  static async getUsers(req: Request<{}, {}, {}, GetUsersQuery>, res: Response): Promise<void> {
    try {
      const { page = '1', limit = '10', search = '' } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause for search
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as any } },
              { email: { contains: search, mode: 'insensitive' as any } },
            ],
          }
        : {};

      // Get users and total count
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      const response: UsersListResponse = {
        users,
        total,
        page: pageNum,
        limit: limitNum,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch users' 
      });
    }
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        res.status(404).json({ 
          error: 'Not found',
          message: 'User not found' 
        });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to fetch user' 
      });
    }
  }

  /**
   * Create a new user
   */
  static async createUser(req: Request<{}, {}, CreateUserDto>, res: Response): Promise<void> {
    try {
      const { name, email } = req.body;

      // Validate required fields
      if (!name || !email) {
        res.status(400).json({
          error: 'Bad request',
          message: 'Name and email are required'
        });
        return;
      }

      // Check if user with email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists'
        });
        return;
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to create user' 
      });
    }
  }

  /**
   * Update a user by ID
   */
  static async updateUser(req: Request<{ id: string }, {}, UpdateUserDto>, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        res.status(404).json({
          error: 'Not found',
          message: 'User not found'
        });
        return;
      }

      // If email is being updated, check for conflicts
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: updateData.email },
        });

        if (emailExists) {
          res.status(409).json({
            error: 'Conflict',
            message: 'User with this email already exists'
          });
          return;
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to update user' 
      });
    }
  }

  /**
   * Delete a user by ID
   */
  static async deleteUser(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        res.status(404).json({
          error: 'Not found',
          message: 'User not found'
        });
        return;
      }

      await prisma.user.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to delete user' 
      });
    }
  }
} 