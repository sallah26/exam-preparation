import { Request, Response } from 'express';
import { AdminController } from '../../../src/controllers/admin/adminController';
import { prisma } from '../../../src/prisma/client';
import { testDb } from '../../utils/testDb';

// Mock Prisma client
jest.mock('../../../src/prisma/client', () => ({
  prisma: {
    admin: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('AdminController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  describe('register', () => {
    const validAdminData = {
      fullName: 'John Admin',
      email: 'admin@example.com',
      password: 'Admin123!',
    };

    it('should register a new admin successfully', async () => {
      // Mock Prisma responses
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.admin.create as jest.Mock).mockResolvedValue({
        id: 'test-id',
        fullName: 'John Admin',
        email: 'admin@example.com',
        password: 'hashed-password',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockRequest = {
        body: validAdminData,
      };

      await AdminController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        admin: {
          id: 'test-id',
          fullName: 'John Admin',
          email: 'admin@example.com',
          isActive: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        message: 'Admin registered successfully',
      });
    });

    it('should return 409 if admin with email already exists', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        email: 'admin@example.com',
      });

      mockRequest = {
        body: validAdminData,
      };

      await AdminController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Conflict',
        message: 'Admin with this email already exists',
      });
    });

    it('should return 400 for invalid fullName', async () => {
      mockRequest = {
        body: {
          ...validAdminData,
          fullName: 'A', // Too short
        },
      };

      await AdminController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Validation error',
        message: 'Invalid input data',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Full name must be at least 2 characters',
          }),
        ]),
      });
    });

    it('should return 400 for invalid email format', async () => {
      mockRequest = {
        body: {
          ...validAdminData,
          email: 'invalid-email',
        },
      };

      await AdminController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Validation error',
        message: 'Invalid input data',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: 'Invalid email format',
          }),
        ]),
      });
    });

    it('should return 400 for weak password', async () => {
      mockRequest = {
        body: {
          ...validAdminData,
          password: 'weak',
        },
      };

      await AdminController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Validation error',
        message: 'Invalid input data',
        details: expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('Password must contain'),
          }),
        ]),
      });
    });

    it('should handle database errors gracefully', async () => {
      (prisma.admin.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      mockRequest = {
        body: validAdminData,
      };

      await AdminController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Failed to register admin',
      });
    });
  });

  describe('getAdmins', () => {
    it('should return paginated admins list', async () => {
      const mockAdmins = [
        {
          id: '1',
          fullName: 'Admin 1',
          email: 'admin1@example.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          fullName: 'Admin 2',
          email: 'admin2@example.com',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.admin.findMany as jest.Mock).mockResolvedValue(mockAdmins);
      (prisma.admin.count as jest.Mock).mockResolvedValue(2);

      mockRequest = {
        query: { page: '1', limit: '10' },
      };

      await AdminController.getAdmins(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        admins: mockAdmins,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('should handle search parameter', async () => {
      (prisma.admin.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.admin.count as jest.Mock).mockResolvedValue(0);

      mockRequest = {
        query: { search: 'john' },
      };

      await AdminController.getAdmins(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(prisma.admin.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { fullName: { contains: 'john', mode: 'insensitive' } },
              { email: { contains: 'john', mode: 'insensitive' } },
            ],
          },
        })
      );
    });
  });

  describe('getAdminById', () => {
    it('should return admin by ID', async () => {
      const mockAdmin = {
        id: 'test-id',
        fullName: 'John Admin',
        email: 'admin@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin);

      mockRequest = {
        params: { id: 'test-id' },
      };

      await AdminController.getAdminById(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockAdmin);
    });

    it('should return 404 for non-existent admin', async () => {
      (prisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      mockRequest = {
        params: { id: 'non-existent' },
      };

      await AdminController.getAdminById(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Not found',
        message: 'Admin not found',
      });
    });
  });
}); 