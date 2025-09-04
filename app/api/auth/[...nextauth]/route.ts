// app/api/auth/[...nextauth]/route.ts
import NextAuth, { DefaultSession } from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type UserRole = 'admin' | 'staff' | 'member';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    role: UserRole;
  }
}

// Helper function to log debug information
function logDebug(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
    console.log(`[NextAuth] ${message}`, data || '');
  }
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true',
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
          // Use absolute URL for the proxy endpoint
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/proxy/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const responseData = await response.json().catch(() => ({}));
          
          if (!response.ok) {
            console.error('Login failed:', {
              status: response.status,
              statusText: response.statusText,
              error: responseData
            });
            throw new Error(responseData.error || 'Authentication failed');
          }
          
          if (!responseData.success || !responseData.user) {
            console.error('Invalid response format:', responseData);
            throw new Error('Invalid server response');
          }

          console.log('Authentication successful for user:', responseData.user.email);
          
          // Return user data in the format expected by NextAuth
          return {
            id: responseData.user.id,
            email: responseData.user.email,
            role: responseData.user.role,
            name: responseData.user.name || `${responseData.user.firstName || ''} ${responseData.user.lastName || ''}`.trim(),
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If there's a specific URL to redirect to, use it
      if (url) {
        // Handle relative URLs
        if (url.startsWith('/')) {
          // Don't redirect to auth routes if already authenticated
          if (url.startsWith('/auth/')) {
            return `${baseUrl}/dashboard`; // Will be overridden by the role-based redirect
          }
          return `${baseUrl}${url}`;
        }
        // Handle absolute URLs on the same origin
        if (new URL(url).origin === baseUrl) return url;
      }
      return `${baseUrl}/dashboard`; // Default fallback
    },
    
    async session({ session, token }) {
      logDebug('Session callback started', { token, session });
      
      if (session.user) {
        session.user.id = token.sub || '';
        session.user.role = (token.role as UserRole) || 'member';
        session.user.email = token.email || '';
        session.user.name = token.name || '';
        session.user.image = token.picture || null;
      }
      
      logDebug('Session callback completed', { 
        sessionUser: session.user,
        tokenUser: token
      });
      
      return session;
    },
    async jwt({ token, user, trigger, session, account }) {
      logDebug('JWT callback started', { 
        token, 
        user, 
        trigger, 
        hasSession: !!session,
        accountType: account?.type
      });
      
      // Initial sign in
      if (user) {
        logDebug('Initial sign in - adding user to token', { user });
        token.role = user.role || 'member';
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image || null;
      }
      
      // Update token with data from session (if needed)
      if (trigger === 'update' && session?.user) {
        logDebug('Updating token from session', { sessionUser: session.user });
        token = { ...token, ...session.user };
      }
      
      logDebug('JWT callback completed', { 
        tokenId: token.sub,
        tokenRole: token.role,
        tokenEmail: token.email
      });
      
      return token;
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
      },
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };