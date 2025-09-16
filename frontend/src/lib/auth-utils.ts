import { AuthUser } from '@/types/auth';

/**
 * Check if user has admin privileges (ADMIN or SUPER_ADMIN)
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.isActive === true;
}

/**
 * Check if user is specifically a super admin
 */
export function isSuperAdmin(user: AuthUser | null): boolean {
  return user?.role === 'SUPER_ADMIN' || user?.isSuperAdmin === true;
}

/**
 * Check if user is a regular user (not admin)
 */
export function isUser(user: AuthUser | null): boolean {
  return user?.role === 'USER';
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: AuthUser | null): string {
  if (!user) return 'Guest';
  return user.fullName || user.name || user.email || 'User';
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: AuthUser | null): string {
  if (!user) return 'G';
  
  const name = user.fullName || user.name || user.email;
  if (!name) return 'U';
  
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Get user role display text
 */
export function getUserRoleDisplay(user: AuthUser | null): string {
  if (!user) return 'Guest';
  
  switch (user.role) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'ADMIN':
      return 'Admin';
    case 'USER':
      return 'User';
    default:
      return 'Unknown';
  }
}

/**
 * Format user creation date
 */
export function formatUserCreatedAt(user: AuthUser | null): string {
  if (!user?.createdAt) return 'Unknown';
  
  try {
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Unknown';
  }
}

/**
 * Check if user was created recently (within last 7 days)
 */
export function isRecentUser(user: AuthUser | null): boolean {
  if (!user?.createdAt) return false;
  
  try {
    const createdDate = new Date(user.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate > weekAgo;
  } catch {
    return false;
  }
}

/**
 * Check if user can access admin features
 */
export function canAccessAdminFeatures(user: AuthUser | null): boolean {
  return isAdmin(user);
}

/**
 * Check if user can manage other admins
 */
export function canManageAdmins(user: AuthUser | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Check if user can manage regular users
 */
export function canManageUsers(user: AuthUser | null): boolean {
  return isSuperAdmin(user);
}

/**
 * Get appropriate dashboard route for user role
 */
export function getDashboardRoute(user: AuthUser | null): string {
  if (isSuperAdmin(user)) {
    return '/dashboard?tab=admin-management';
  } else if (isAdmin(user)) {
    return '/dashboard?tab=exam-types';
  } else if (isUser(user)) {
    return '/dashboard?tab=my-progress';
  }
  return '/dashboard';
} 