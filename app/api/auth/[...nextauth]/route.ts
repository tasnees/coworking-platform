// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextAuthOptions, DefaultSession } from "next-auth";
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from "next-auth/providers/credentials";

// Import types from our central type definitions
import type { DefaultUser } from 'next-auth';
import type { UserRole } from "@/lib/auth-types";

// Helper function to log debug information
function logDebug(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
    console.log(`[NextAuth] ${message}`, data || '');
  }
}

// Generate a secret if not in production
const generateSecret = () => {
  if (process.env.NEXTAUTH_SECRET) return process.env.NEXTAUTH_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXTAUTH_SECRET is required in production');
  }
  console.warn('⚠️ Using auto-generated NEXTAUTH_SECRET. Set this in production!');
  return 'your-secret-key-here';
};

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
  secret: generateSecret(),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Authorization attempt with credentials:', credentials?.email);
        if (!credentials) return null;
        
        try {
          // Direct database authentication instead of API call to avoid circular dependency
          const { default: db } = await import('@/lib/mongodb');
          const client = await db;
          const users = client.db().collection('users');
          
          // Find user by email
          const user = await users.findOne({ email: credentials.email });
          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }
          
          // Verify password using the auth-utils function
          const { verifyPassword } = await import('@/lib/auth-utils');
          const isValid = await verifyPassword(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          console.log('Authentication successful for user:', user.email);
          
          // Map the database user to the NextAuth user
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'member',
            name: user.name || user.email.split('@')[0],
            image: user.image || null
          };
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 300 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        if (user.image) token.picture = user.image;
      }
      
      // Update token from session if needed
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Add custom data to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // If there's a specific URL to redirect to, use it
      if (url) {
        // Handle relative URLs
        if (url.startsWith('/')) {
          // Don't redirect to auth routes if already authenticated
          if (url.startsWith('/auth/')) {
            return `${baseUrl}/dashboard`;
          }
          return `${baseUrl}${url}`;
        }
        // Handle absolute URLs on the same origin
        if (new URL(url).origin === baseUrl) return url;
      }
      return `${baseUrl}/dashboard`; // Default fallback
    }
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true // Set to true for production, false for development
      }
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };