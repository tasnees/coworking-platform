// lib/utils/routes.ts

type UserRole = 'ADMIN' | 'STAFF' | 'MEMBER';

/**
 * Returns the dashboard path based on user role
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'STAFF':
      return '/dashboard/staff';
    case 'MEMBER':
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
