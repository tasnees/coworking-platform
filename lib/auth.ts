import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import type { JWT } from 'next-auth/jwt';
import type { UserRole } from '@/lib/auth-types';
import type { User } from 'next-auth';

interface Credentials {
  email: string;
  password: string;
}

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

// Mock users with hashed passwords
const users: MockUser[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    password: "$2a$10$XKvT7y4Z4d2K8x8vH5k9uO9zY3x8vH5k9uO9zY3x8vH5k9uO9zY3x8v", // admin123
    role: "ADMIN",
  },
  {
    id: "2",
    email: "staff@example.com",
    name: "Staff User",
    password: "$2a$10$XKvT7y4Z4d2K8x8vH5k9uO9zY3x8vH5k9uO9zY3x8vH5k9uO9zY3x8v", // staff123
    role: "STAFF",
  },
  {
    id: "3",
    email: "member@example.com",
    name: "Member User",
    password: "$2a$10$XKvT7y4Z4d2K8x8vH5k9uO9zY3x8vH5k9uO9zY3x8vH5k9uO9zY3x8v", // member123
    role: "MEMBER",
  },
];

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Credentials | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = users.find((user) => user.email === credentials.email);
        
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          } as User;
        }
        
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
