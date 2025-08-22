import 'next-auth';
import { DefaultSession } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

export type UserRole = 'admin' | 'staff' | 'member';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extend the built-in JWT types to include our custom properties
   */
  interface JWT {
    role: UserRole;
    id?: string;
  }
}
