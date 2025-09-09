import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { UserRole } from './auth-types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      image?: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: UserRole;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
