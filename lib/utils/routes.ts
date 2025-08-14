// lib/utils/routes.ts

type UserRole = 'admin' | 'staff' | 'member';

/**
 * Returns the dashboard path based on user role
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'staff':
      return '/dashboard/staff';
    case 'member':
      return '/dashboard/member';
    default:
      return '/dashboard';
  }
}

/**
 * Checks if the current path matches any dashboard path
 */
export function isDashboardPath(pathname: string): boolean {
  return pathname.startsWith('/dashboard');
}
