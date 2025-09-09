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
          const baseUrl = process.env.NEXTAUTH_URL || 'https://coworking-platform.onrender.com';
          const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
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
          
          // Map the backend user to the NextAuth user
          const user = {
            id: responseData.user._id || responseData.user.id,
            email: responseData.user.email,
            role: responseData.user.role || 'member',
            name: responseData.user.name || `${responseData.user.firstName || ''} ${responseData.user.lastName || ''}`.trim(),
            image: responseData.user.image || null
          };
          
          return user;
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
      logDebug('Session callback', { session, token });
      
      // Create the updated session with all user properties
      const updatedSession = {
        ...session,
        user: {
          ...session.user,
          id: token.sub || '',
          name: token.name ?? session.user?.name ?? null,
          email: token.email ?? session.user?.email ?? null,
          role: token.role || 'member',
          // Use type assertion to handle the image property
          ...(token.picture && { image: token.picture })
        }
      };
      
      logDebug('Session callback completed', { 
        sessionUser: updatedSession.user,
        tokenUser: token
      });
      
      return updatedSession;
    },
    async jwt({ token, user, trigger, session }) {
      logDebug('JWT callback', { token, user, trigger, session });

      // Initial sign in
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
          picture: user.image ?? null,
          role: user.role || 'member'
        };
      }

      // Update token with data from session (if needed)
      if (trigger === 'update' && session?.user) {
        logDebug('Updating token from session', { sessionUser: session.user });
        return {
          ...token,
          name: session.user.name ?? token.name,
          email: session.user.email ?? token.email,
          picture: (session.user as any).image ?? token.picture,
          role: (session.user as any).role ?? token.role ?? 'member'
        };
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