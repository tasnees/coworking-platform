/**
 * User roles in the application
 * - admin: Full access to all features
 * - staff: Access to member management and bookings
 * - member: Regular member with basic access
 */
export const userRoles = ['ADMIN', 'STAFF', 'MEMBER'] as const
export type UserRole = (typeof userRoles)[number]

// Type guard to check if a value is a valid UserRole
export const isUserRole = (role: unknown): role is UserRole => 
  typeof role === 'string' && (userRoles as readonly string[]).includes(role)
