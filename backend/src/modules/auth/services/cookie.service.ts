import { Response } from 'express';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  domain?: string | undefined;
  path: string;
}

export class CookieService {
  private static readonly COOKIE_SECRET = process.env['COOKIE_SECRET'] as string;
  private static readonly COOKIE_DOMAIN = process.env['COOKIE_DOMAIN'] || undefined;
  private static readonly COOKIE_SECURE = process.env['COOKIE_SECURE'] === 'true';

  /**
   * Set access token cookie
   */
  static setAccessTokenCookie(res: Response, token: string, maxAge: number): void {
    const options: CookieOptions = {
      httpOnly: true,
      secure: this.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge,
      domain: this.COOKIE_DOMAIN,
      path: '/',
    };

    res.cookie('accessToken', token, options);
  }

  /**
   * Set refresh token cookie
   */
  static setRefreshTokenCookie(res: Response, token: string, maxAge: number): void {
    const options: CookieOptions = {
      httpOnly: true,
      secure: this.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge,
      domain: this.COOKIE_DOMAIN,
      path: '/api/auth/refresh',
    };

    res.cookie('refreshToken', token, options);
  }

  /**
   * Clear access token cookie
   */
  static clearAccessTokenCookie(res: Response): void {
    const options: CookieOptions = {
      httpOnly: true,
      secure: this.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: 0,
      domain: this.COOKIE_DOMAIN,
      path: '/',
    };

    res.clearCookie('accessToken', options);
  }

  /**
   * Clear refresh token cookie
   */
  static clearRefreshTokenCookie(res: Response): void {
    const options: CookieOptions = {
      httpOnly: true,
      secure: this.COOKIE_SECURE,
      sameSite: 'strict',
      maxAge: 0,
      domain: this.COOKIE_DOMAIN,
      path: '/api/auth/refresh',
    };

    res.clearCookie('refreshToken', options);
  }

  /**
   * Clear all auth cookies
   */
  static clearAllAuthCookies(res: Response): void {
    this.clearAccessTokenCookie(res);
    this.clearRefreshTokenCookie(res);
  }

  /**
   * Get cookie options for development
   */
  static getDevelopmentCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: false, // Set to false for HTTP in development
      sameSite: 'lax', // More permissive for development
      maxAge: 15 * 60 * 1000, // 15 minutes
      domain: 'localhost',
      path: '/',
    };
  }

  /**
   * Get cookie options for production
   */
  static getProductionCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: true, // Require HTTPS in production
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      domain: this.COOKIE_DOMAIN,
      path: '/',
    };
  }

  /**
   * Get appropriate cookie options based on environment
   */
  static getCookieOptions(): CookieOptions {
    const isProduction = process.env['NODE_ENV'] === 'production';
    return isProduction 
      ? this.getProductionCookieOptions() 
      : this.getDevelopmentCookieOptions();
  }
} 