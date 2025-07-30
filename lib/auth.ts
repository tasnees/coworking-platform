import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'member';
  password: string;
}

interface Credentials {
  email: string;
  password: string;
}

// Mock users with hashed passwords
const users: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    password: "$2a$10$XKvT7y4Z4d2K8x8vH5k9uO9zY3x8vH5k9uO9zY3x8vH5k9uO9zY3x8v", // admin123
    role: "admin",
  },
  {
    id: "2",
    email: "staff@example.com",
    name: "Staff User",
    password: "$2a$10$XKvT7y4Z4d2K8x8vH5k9uO9zY3x8vH5k9uO9zY3x8vH5k9uO9zY3x8v", // staff123
    role: "staff",
  },
  {
    id: "3",
    email: "member@example.com",
    name: "Member User",
    password: "$2a$10$XKvT7y4Z4d2K8x8vH5k9uO9zY3x8vH5k9uO9zY3x8vH5k9uO9zY3x8v", // member123
    role: "member",
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
          };
        }
        
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
