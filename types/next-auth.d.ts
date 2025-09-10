import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    role: string;
    tokenVersion?: number;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    };
    tokenVersion?: number;
  }

  interface JWT {
    id: string;
    email: string;
    role: string;
    tokenVersion?: number;
  }
}
