import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticationError } from '../utils/auth.errors';
import { prisma } from '../../../prisma/client';

export interface TokenPayload {
  adminId: string;
  email: string;
  fullName: string;
  type: 'access' | 'refresh';
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
   * Generate access token
   */
  static generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
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
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<TokenPayload, 'type'>): string {
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
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(payload: Omit<TokenPayload, 'type'>): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      accessExpiresIn: this.ACCESS_EXPIRES_IN,
      refreshExpiresIn: this.REFRESH_EXPIRES_IN,
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    if (!this.ACCESS_SECRET) {
      throw new AuthenticationError('JWT access secret not configured');
    }

    try {
      const decoded = jwt.verify(token, this.ACCESS_SECRET, {
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      }) as TokenPayload;

      if (decoded.type !== 'access') {
        throw new AuthenticationError('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid access token');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload {
    if (!this.REFRESH_SECRET) {
      throw new AuthenticationError('JWT refresh secret not configured');
    }

    try {
      const decoded = jwt.verify(token, this.REFRESH_SECRET, {
        issuer: this.ISSUER,
        audience: this.AUDIENCE,
      }) as TokenPayload;

      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Store refresh token in database (hashed)
   */
  static async storeRefreshToken(
    adminId: string,
    refreshToken: string,
    expiresAt: Date
  ): Promise<RefreshTokenData> {
    const hashedToken = await bcrypt.hash(refreshToken, 12);

    const storedToken = await prisma.refreshToken.create({
      data: {
        token: hashedToken,
        adminId,
        expiresAt,
      },
    });

    return storedToken;
  }

  /**
   * Validate refresh token from database
   */
  static async validateRefreshToken(
    adminId: string,
    refreshToken: string
  ): Promise<RefreshTokenData | null> {
    const storedTokens = await prisma.refreshToken.findMany({
      where: {
        adminId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    for (const storedToken of storedTokens) {
      const isValid = await bcrypt.compare(refreshToken, storedToken.token);
      if (isValid) {
        return storedToken;
      }
    }

    return null;
  }

  /**
   * Revoke refresh token
   */
  static async revokeRefreshToken(tokenId: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { id: tokenId },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoke all refresh tokens for an admin
   */
  static async revokeAllRefreshTokens(adminId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { adminId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Clean up expired refresh tokens
   */
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Get active refresh tokens for an admin
   */
  static async getActiveRefreshTokens(adminId: string): Promise<RefreshTokenData[]> {
    return await prisma.refreshToken.findMany({
      where: {
        adminId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Calculate refresh token expiration date
   */
  static calculateRefreshTokenExpiration(): Date {
    const expiresIn = this.REFRESH_EXPIRES_IN;
    const now = new Date();

    if (expiresIn.includes('d')) {
      const days = parseInt(expiresIn.replace('d', ''));
      return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    }

    if (expiresIn.includes('h')) {
      const hours = parseInt(expiresIn.replace('h', ''));
      return new Date(now.getTime() + hours * 60 * 60 * 1000);
    }

    if (expiresIn.includes('m')) {
      const minutes = parseInt(expiresIn.replace('m', ''));
      return new Date(now.getTime() + minutes * 60 * 1000);
    }

    // Default to 7 days if parsing fails
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
} 