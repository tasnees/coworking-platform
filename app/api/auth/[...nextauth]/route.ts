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

// Use environment variables directly for JWT secrets
const authSecret = process.env.NEXTAUTH_SECRET;
const jwtSecret = process.env.JWT_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

// Validate required secrets in production
if (process.env.NODE_ENV === 'production') {
  if (!authSecret) throw new Error('NEXTAUTH_SECRET is required in production');
  if (!jwtSecret) throw new Error('JWT_SECRET is required in production');
  if (!refreshTokenSecret) throw new Error('REFRESH_TOKEN_SECRET is required in production');
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
  secret: authSecret || 'your-development-secret',
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

        // Skip database authentication during build time
        if (process.env.NEXT_PHASE === 'phase-production-build' ||
            process.env.NODE_ENV === 'production' && process.env.BUILDING) {
          console.log('Build time detected, returning mock user for NextAuth');
          return {
            id: 'mock-user-id',
            email: credentials.email,
            role: 'member',
            name: credentials.email.split('@')[0],
            image: null
          };
        }

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
    maxAge: 300 * 24 * 60 * 60, // 300 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      logDebug('JWT Callback', { token, user, trigger, session });
      
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role || 'member'; // Default to 'member' if role is not set
        token.email = user.email;
        // Add token version for refresh token rotation
        (token as any).tokenVersion = (user as any).tokenVersion || 0;
      }
      
      // Update token from session (e.g., when updating user data)
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      
      return token;
    },
    
    async session({ session, token }) {
      logDebug('Session Callback', { session, token });
      
      if (session.user) {
        session.user.id = token.id as string;
        // Ensure role is one of the valid roles, default to 'member' if not
        const validRoles: UserRole[] = ['admin', 'staff', 'member'];
        session.user.role = (validRoles.includes(token.role as UserRole) 
          ? token.role 
          : 'member') as UserRole;
        session.user.email = token.email as string;
        (session as any).tokenVersion = (token as any).tokenVersion || 0;
      }
      
      return session;
    },
    
    async signIn({ user, account, profile, email, credentials }) {
      logDebug('SignIn Callback', { user, account, profile, email, credentials });
      return true;
    },
    
    async redirect({ url, baseUrl, token }: { url: string; baseUrl: string; token?: JWT }) {
      logDebug('Redirect Callback', { url, baseUrl, token });
      
      // If there's a return URL, use it if it's a relative URL
      if (url.startsWith('/') && !url.startsWith('/auth')) {
        return url;
      }
      
      // If the URL is a full URL that's on our domain, use it
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl && !urlObj.pathname.startsWith('/auth')) {
          return url;
        }
      } catch (e) {
        // Invalid URL, fall through to default
      }
      
      // Default to the role-based dashboard if we have a token with role
      if (token?.role) {
        const role = token.role as UserRole;
        const dashboardPath = role === 'admin' ? '/dashboard/admin' :
                            role === 'staff' ? '/dashboard/staff' :
                            '/dashboard/member';
        return `${baseUrl}${dashboardPath}`;
      }
      
      // Fallback to member dashboard
      return `${baseUrl}/dashboard/member`;
    },
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 300 * 24 * 60 * 60, // 300 days
        domain: process.env.NODE_ENV === 'production' ? '.coworking-platform.onrender.com' : 'localhost'
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.coworking-platform.onrender.com' : 'localhost'
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };