import 'next-auth';

declare module 'next-auth' {
  /**
   * Extend the built-in session types
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string; // Using string type to avoid type conflicts
    };
    expires: string;
  }

  /**
   * Extend the built-in user types
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string; // Using string type to avoid type conflicts
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the built-in JWT types
   */
  interface JWT {
    sub?: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    role: string; // Using string type to avoid type conflicts
    [key: string]: unknown;
  }
}
