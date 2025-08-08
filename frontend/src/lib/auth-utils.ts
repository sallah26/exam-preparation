import { AuthUser } from '@/types/auth';

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.isActive ?? false;
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return 'Guest';
  return user.fullName || user.email || 'Unknown User';
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: AuthUser | null): string {
  if (!user?.fullName) return '?';
  
  const names = user.fullName.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format user creation date
 */
export function formatUserCreatedAt(user: AuthUser | null): string {
  if (!user?.createdAt) return 'Unknown';
  
  try {
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

/**
 * Check if user account is recent (created within last 30 days)
 */
export function isRecentUser(user: AuthUser | null): boolean {
  if (!user?.createdAt) return false;
  
  try {
    const createdAt = new Date(user.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return createdAt > thirtyDaysAgo;
  } catch {
    return false;
  }
} 