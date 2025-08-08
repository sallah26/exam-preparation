import { Request, Response } from 'express';
import { LoginController } from '../../../../src/modules/auth/controllers/login.controller';
import { LoginService } from '../../../../src/modules/auth/services/login.service';

// Mock the LoginService
jest.mock('../../../../src/modules/auth/services/login.service');

describe('LoginController', () => {
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

    jest.clearAllMocks();
  });

  describe('login', () => {
    const validLoginData = {
      email: 'admin@example.com',
      password: 'Admin123!',
    };

    it('should login successfully with valid credentials', async () => {
      const mockAdmin = {
        id: 'test-id',
        fullName: 'John Admin',
        email: 'admin@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'mock-jwt-token';

      (LoginService.authenticateAdmin as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Login successful',
        data: {
          admin: mockAdmin,
          token: mockToken,
          expiresIn: '24h',
        },
      });

      mockRequest = {
        body: validLoginData,
      };

      await LoginController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          admin: mockAdmin,
          token: mockToken,
          expiresIn: '24h',
        },
      });
    });

    it('should return 400 for invalid input', async () => {
      mockRequest = {
        body: {
          email: 'invalid-email',
          password: '',
        },
      };

      await LoginController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Validation error',
        errors: expect.any(Array),
      });
    });

    it('should return 401 for invalid credentials', async () => {
      (LoginService.authenticateAdmin as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Invalid email or password',
      });

      mockRequest = {
        body: validLoginData,
      };

      await LoginController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password',
      });
    });

    it('should return 401 for deactivated account', async () => {
      (LoginService.authenticateAdmin as jest.Mock).mockResolvedValue({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });

      mockRequest = {
        body: validLoginData,
      };

      await LoginController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });
    });

    it('should handle service errors gracefully', async () => {
      (LoginService.authenticateAdmin as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      mockRequest = {
        body: validLoginData,
      };

      await LoginController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockRequest = {};

      await LoginController.logout(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful',
      });
    });

    it('should handle logout errors gracefully', async () => {
      mockRequest = {};

      // Mock an error scenario
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await LoginController.logout(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('getProfile', () => {
    it('should return admin profile successfully', async () => {
      const mockAdmin = {
        id: 'test-id',
        fullName: 'John Admin',
        email: 'admin@example.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRequest = {
        admin: mockAdmin,
      } as any;

      await LoginController.getProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          admin: mockAdmin,
        },
      });
    });

    it('should return 401 when no admin is attached', async () => {
      mockRequest = {};

      await LoginController.getProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });
  });
}); 