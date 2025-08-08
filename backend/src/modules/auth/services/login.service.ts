import bcrypt from 'bcryptjs';
import { AuthenticationError } from '../utils/auth.errors';
import { JWTService, TokenPair } from './jwt.service';
import { prisma } from '../../../prisma/client';

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  admin: {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
  };
  tokens: TokenPair;
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
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate token pair
    const tokenPair = JWTService.generateTokenPair({
      adminId: admin.id,
      email: admin.email,
      fullName: admin.fullName,
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
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
      tokens: tokenPair,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> {
    try {
      // Verify refresh token
      const decoded = JWTService.verifyRefreshToken(refreshToken);

      // Validate refresh token in database
      const storedToken = await JWTService.validateRefreshToken(decoded.adminId, refreshToken);
      if (!storedToken) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Get admin data
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.adminId },
        select: {
          id: true,
          email: true,
          fullName: true,
          isActive: true,
        },
      });

      if (!admin || !admin.isActive) {
        throw new AuthenticationError('Admin not found or inactive');
      }

      // Generate new access token
      const accessToken = JWTService.generateAccessToken({
        adminId: admin.id,
        email: admin.email,
        fullName: admin.fullName,
      });

      return {
        accessToken,
        expiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] || '15m',
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Failed to refresh token');
    }
  }

  /**
   * Logout admin and revoke tokens
   */
  static async logoutAdmin(adminId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Find and revoke specific refresh token
      const storedTokens = await JWTService.getActiveRefreshTokens(adminId);
      for (const storedToken of storedTokens) {
        const isValid = await bcrypt.compare(refreshToken, storedToken.token);
        if (isValid) {
          await JWTService.revokeRefreshToken(storedToken.id);
          break;
        }
      }
    } else {
      // Revoke all refresh tokens for the admin
      await JWTService.revokeAllRefreshTokens(adminId);
    }
  }

  /**
   * Get admin profile by ID
   */
  static async getAdminProfile(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
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
      throw new AuthenticationError('Admin not found');
    }

    return admin;
  }

  /**
   * Get active sessions for admin
   */
  static async getActiveSessions(adminId: string) {
    const activeTokens = await JWTService.getActiveRefreshTokens(adminId);
    
    return activeTokens.map(token => ({
      id: token.id,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
    }));
  }

  /**
   * Revoke specific session
   */
  static async revokeSession(adminId: string, sessionId: string): Promise<void> {
    const token = await prisma.refreshToken.findFirst({
      where: {
        id: sessionId,
        adminId,
        isRevoked: false,
      },
    });

    if (!token) {
      throw new AuthenticationError('Session not found');
    }

    await JWTService.revokeRefreshToken(sessionId);
  }
} 