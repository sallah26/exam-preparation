import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticationError } from '../utils/auth.errors';
import { prisma } from '../../../prisma/client';
import { UserRole } from '@prisma/client';

// Enhanced token payload for multi-role system
export interface BaseTokenPayload {
  email: string;
  type: 'access' | 'refresh';
  role: UserRole;
  isActive: boolean;
}

export interface AdminTokenPayload extends BaseTokenPayload {
  adminId: string;
  fullName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isSuperAdmin: boolean;
}

export interface UserTokenPayload extends BaseTokenPayload {
  userId: string;
  name: string;
  role: 'USER';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export interface RefreshTokenData {
  id: string;
  token: string;
  adminId: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class JWTService {
  private static readonly ACCESS_SECRET = process.env['JWT_ACCESS_SECRET'] as string;
  private static readonly REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] as string;
  private static readonly ACCESS_EXPIRES_IN = process.env['JWT_ACCESS_EXPIRES_IN'] || '15m';
  private static readonly REFRESH_EXPIRES_IN = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d';
  private static readonly ISSUER = process.env['JWT_ISSUER'] || 'addis-admin';
  private static readonly AUDIENCE = process.env['JWT_AUDIENCE'] || 'addis-admin-users';

  /**
   * Generate access token for admin
   */
  static generateAdminAccessToken(payload: Omit<AdminTokenPayload, 'type'>): string {
    if (!this.ACCESS_SECRET) {
      throw new AuthenticationError('JWT access secret not configured');
    }

    return jwt.sign(
      { ...payload, type: 'access' },
      this.ACCESS_SECRET,
      {
        expiresIn: this.ACCESS_EXPIRES_IN,
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      }
    );
  }

  /**
   * Generate access token for user
   */
  static generateUserAccessToken(payload: Omit<UserTokenPayload, 'type'>): string {
    if (!this.ACCESS_SECRET) {
      throw new AuthenticationError('JWT access secret not configured');
    }

    return jwt.sign(
      { ...payload, type: 'access' },
      this.ACCESS_SECRET,
      {
        expiresIn: this.ACCESS_EXPIRES_IN,
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      }
    );
  }

  /**
   * Generate refresh token (admin only for now)
   */
  static generateRefreshToken(payload: Pick<AdminTokenPayload, 'adminId' | 'email' | 'fullName' | 'role'>): string {
    if (!this.REFRESH_SECRET) {
      throw new AuthenticationError('JWT refresh secret not configured');
    }

    return jwt.sign(
      { ...payload, type: 'refresh' },
      this.REFRESH_SECRET,
      {
        expiresIn: this.REFRESH_EXPIRES_IN,
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      }
    );
  }

  /**
   * Generate token pair for admin
   */
  static generateAdminTokenPair(payload: {
    adminId: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
    isActive: boolean;
    isSuperAdmin: boolean;
  }): TokenPair {
    const accessToken = this.generateAdminAccessToken(payload);
    const refreshToken = this.generateRefreshToken({
      adminId: payload.adminId,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    });

    return {
      accessToken,
      refreshToken,
      accessExpiresIn: this.ACCESS_EXPIRES_IN,
      refreshExpiresIn: this.REFRESH_EXPIRES_IN,
    };
  }

  /**
   * Generate token pair for user (access token only for now)
   */
  static generateUserTokenPair(payload: {
    userId: string;
    email: string;
    name: string;
    role: 'USER';
    isActive: boolean;
  }): { accessToken: string; accessExpiresIn: string } {
    const accessToken = this.generateUserAccessToken(payload);

    return {
      accessToken,
      accessExpiresIn: this.ACCESS_EXPIRES_IN,
    };
  }

  /**
   * Verify access token and return payload
   */
  static verifyAccessToken(token: string): AdminTokenPayload | UserTokenPayload {
    if (!this.ACCESS_SECRET) {
      throw new AuthenticationError('JWT access secret not configured');
    }

    try {
      const decoded = jwt.verify(token, this.ACCESS_SECRET, {
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      }) as any;

      if (decoded.type !== 'access') {
        throw new AuthenticationError('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid access token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Access token expired');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): AdminTokenPayload {
    if (!this.REFRESH_SECRET) {
      throw new AuthenticationError('JWT refresh secret not configured');
    }

    try {
      const decoded = jwt.verify(token, this.REFRESH_SECRET, {
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      }) as any;

      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired');
      }
      throw error;
    }
  }

  /**
   * Store refresh token in database
   */
  static async storeRefreshToken(adminId: string, token: string, expiresAt: Date): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        token,
        adminId,
        expiresAt,
      },
    });
  }

  /**
   * Validate refresh token from database
   */
  static async validateRefreshTokenFromDB(token: string): Promise<RefreshTokenData> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (refreshToken.isRevoked) {
      throw new AuthenticationError('Refresh token has been revoked');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new AuthenticationError('Refresh token expired');
    }

    return refreshToken;
  }

  /**
   * Revoke refresh token
   */
  static async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoke all refresh tokens for admin
   */
  static async revokeAllRefreshTokens(adminId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { adminId },
      data: { isRevoked: true },
    });
  }

  /**
   * Calculate refresh token expiration date
   */
  static calculateRefreshTokenExpiration(): Date {
    const expiresIn = this.REFRESH_EXPIRES_IN;
    const now = new Date();

    // Parse the expiration string (e.g., "7d", "1h", "30m")
    const timeValue = parseInt(expiresIn.slice(0, -1));
    const timeUnit = expiresIn.slice(-1);

    switch (timeUnit) {
      case 'd':
        return new Date(now.getTime() + timeValue * 24 * 60 * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + timeValue * 60 * 60 * 1000);
      case 'm':
        return new Date(now.getTime() + timeValue * 60 * 1000);
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to 7 days
    }
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Check if user has required role
   */
  static hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    return requiredRoles.includes(userRole);
  }

  /**
   * Check if user is admin (ADMIN or SUPER_ADMIN)
   */
  static isAdmin(role: UserRole): boolean {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  /**
   * Check if user is super admin
   */
  static isSuperAdmin(role: UserRole): boolean {
    return role === 'SUPER_ADMIN';
  }
} 