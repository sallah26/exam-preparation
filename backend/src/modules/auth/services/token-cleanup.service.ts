import { JWTService } from './jwt.service';

export class TokenCleanupService {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  private static readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Start automatic token cleanup
   */
  static startCleanup(): void {
    if (this.cleanupInterval) {
      console.log('Token cleanup service already running');
      return;
    }

    console.log('Starting token cleanup service...');

    // Run initial cleanup
    this.performCleanup();

    // Schedule periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Stop automatic token cleanup
   */
  static stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Token cleanup service stopped');
    }
  }

  /**
   * Perform cleanup of expired tokens
   */
  static async performCleanup(): Promise<void> {
    try {
      const deletedCount = await JWTService.cleanupExpiredTokens();
      
      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} expired refresh tokens`);
      }
    } catch (error) {
      console.error('Error during token cleanup:', error);
    }
  }

  /**
   * Get cleanup service status
   */
  static getStatus(): { isRunning: boolean; lastCleanup?: Date } {
    return {
      isRunning: !!this.cleanupInterval,
    };
  }
} 