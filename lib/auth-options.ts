// lib/auth-options.ts
import type { NextAuthOptions } from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';
// Define user roles and type guard locally to avoid import issues
const userRoles = ['admin', 'staff', 'member'] as const;
type UserRole = (typeof userRoles)[number];
const isUserRole = (role: string): role is UserRole => 
  (userRoles as readonly string[]).includes(role);

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID || '',
      clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
      issuer: process.env.AUTH0_ISSUER,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
      profile(profile: any) {
        const roleStr = profile['https://coworking-platform/roles']?.[0] || 'member';
        const role = isUserRole(roleStr) ? roleStr : 'member';
        
        return {
          id: profile.sub,
          name: profile.name || profile.nickname || '',
          email: profile.email || '',
          image: profile.picture,
          role,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Provide a default role of 'member' if role is not set
        token.role = (user.role as UserRole) || 'member';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.role && isUserRole(token.role)) {
          session.user.role = token.role;
        }
      }
      return session;
    }    
  },
};