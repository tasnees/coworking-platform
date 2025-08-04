import { DefaultSession, DefaultUser } from "next-auth"

/**
 * User roles in the application
 * - admin: Full access to all features
 * - staff: Access to member management and bookings
 * - member: Regular member with basic access
 */
export const userRoles = ['admin', 'staff', 'member'] as const
export type UserRole = (typeof userRoles)[number]

// Type guard to check if a value is a valid UserRole
export const isUserRole = (role: unknown): role is UserRole => 
  typeof role === 'string' && (userRoles as readonly string[]).includes(role)

// Our custom User type that extends NextAuth's User
export interface CustomUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: UserRole
}

// Our custom Session type
export interface CustomSession {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: UserRole
  }
}

// Our custom JWT type
export interface CustomJWT {
  [key: string]: any
  role?: UserRole
}

// Extend NextAuth types with our custom fields
declare module "next-auth" {
  interface User extends CustomUser {}
  interface Session {
    user: CustomSession['user']
  }
}

declare module "next-auth/jwt" {
  interface JWT extends CustomJWT {}
}
