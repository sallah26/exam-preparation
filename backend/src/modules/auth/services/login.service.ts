import bcrypt from 'bcryptjs';
import { AuthenticationError } from '../utils/auth.errors';
import { JWTService, TokenPair, AdminTokenPayload } from './jwt.service';
import { prisma } from '../../../prisma/client';
import { UserRole } from '@prisma/client';

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface UserRegistrationInput {
  name: string;
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  admin: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    isSuperAdmin: boolean;
    isActive: boolean;
    createdAt: Date;
  };
  tokens: TokenPair;
}

export interface UserLoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
  };
  tokens: { accessToken: string; accessExpiresIn: string };
}

export interface UserRegistrationResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
  };
  tokens: { accessToken: string; accessExpiresIn: string };
}

export class LoginService {
  /**
   * Authenticate admin and generate tokens
   */
  static async authenticateAdmin(input: AdminLoginInput): Promise<AdminLoginResponse> {
    const { email, password } = input;

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!admin.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await JWTService.verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Determine role
    const role = admin.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.ADMIN;

    // Generate token pair
    const tokenPair = JWTService.generateAdminTokenPair({
      adminId: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role,
      isActive: admin.isActive,
      isSuperAdmin: admin.isSuperAdmin,
    });

    // Store refresh token in database
    const expiresAt = JWTService.calculateRefreshTokenExpiration();
    await JWTService.storeRefreshToken(admin.id, tokenPair.refreshToken, expiresAt);

    // Return admin data (without password) and tokens
    return {
      admin: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role,
        isSuperAdmin: admin.isSuperAdmin,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
      tokens: tokenPair,
    };
  }

  /**
   * Authenticate user and generate tokens
   */
  static async authenticateUser(input: UserLoginInput): Promise<UserLoginResponse> {
    const { email, password } = input;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await JWTService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate token pair
    const tokens = JWTService.generateUserTokenPair({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'USER', // Users always have USER role
      isActive: user.isActive,
    });

    // Return user data (without password) and tokens
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  /**
   * Register new user
   */
  static async registerUser(input: UserRegistrationInput): Promise<UserRegistrationResponse> {
    const { name, email, password } = input;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new AuthenticationError('User with this email already exists');
    }

    // Check if email is registered as admin
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) {
      throw new AuthenticationError('This email is registered as an admin account');
    }

    // Hash password
    const hashedPassword = await JWTService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: UserRole.USER,
      },
    });

    // Generate token pair
    const tokens = JWTService.generateUserTokenPair({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'USER', // Users always have USER role
      isActive: user.isActive,
    });

    // Return user data (without password) and tokens
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token (admin only)
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> {
    // Verify refresh token structure
      const decoded = JWTService.verifyRefreshToken(refreshToken);

    // Validate refresh token from database
    await JWTService.validateRefreshTokenFromDB(refreshToken);

    // Find admin to ensure they still exist and are active
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.adminId },
      });

      if (!admin || !admin.isActive) {
      throw new AuthenticationError('Admin account not found or inactive');
      }

    // Determine role
    const role = admin.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.ADMIN;

      // Generate new access token
    const accessToken = JWTService.generateAdminAccessToken({
        adminId: admin.id,
        email: admin.email,
        fullName: admin.fullName,
      role,
      isActive: admin.isActive,
      isSuperAdmin: admin.isSuperAdmin,
      });

      return {
        accessToken,
      expiresIn: '15m', // Should match JWT_ACCESS_EXPIRES_IN
    };
  }

  /**
   * Logout admin (revoke refresh token)
   */
  static async logoutAdmin(refreshToken: string): Promise<void> {
    await JWTService.revokeRefreshToken(refreshToken);
  }

  /**
   * Logout all admin sessions (revoke all refresh tokens)
   */
  static async logoutAdminAll(adminId: string): Promise<void> {
    await JWTService.revokeAllRefreshTokens(adminId);
  }

  /**
   * Get user by token (for authentication middleware)
   */
  static async getUserByToken(token: string): Promise<any> {
    const decoded = JWTService.verifyAccessToken(token);

    if ('adminId' in decoded) {
      // Admin token
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.adminId },
      });

      if (!admin || !admin.isActive) {
        throw new AuthenticationError('Admin account not found or inactive');
      }

      return {
        type: 'admin',
        id: admin.id,
        email: admin.email,
        name: admin.fullName,
        role: admin.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.ADMIN,
        isSuperAdmin: admin.isSuperAdmin,
        isActive: admin.isActive,
      };
    } else {
      // User token
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        throw new AuthenticationError('User account not found or inactive');
      }

      return {
        type: 'user',
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      };
    }
  }
} 