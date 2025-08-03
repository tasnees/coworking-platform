import NextAuth from "next-auth"
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// Define the user role type as a const array for type safety
export const userRoles = ['admin', 'staff', 'member'] as const;
export type UserRole = (typeof userRoles)[number];

// Type guard to check if a string is a valid UserRole
export const isUserRole = (role: string): role is UserRole => 
  (userRoles as readonly string[]).includes(role);

declare module "next-auth" {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      /** The user's role */
      role: UserRole;
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user types
   */
  interface User extends DefaultUser {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    role: UserRole;
  }
}
