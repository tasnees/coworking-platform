import NextAuth from "next-auth";
import type { DefaultSession, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Auth0Provider from "next-auth/providers/auth0";
import { isUserRole, UserRole } from "@/lib/auth-types";
// Extend the Profile type to include our custom claim
declare module "next-auth/providers/auth0" {
  interface Profile {
    'https://coworking-platform/roles'?: string[];
  }
}
// Create the auth options object with proper types
export const authOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name || profile.nickname || '',
          email: profile.email || '',
          image: profile.picture,
          role: (profile['https://coworking-platform/roles']?.[0] || 'member') as UserRole,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.role && isUserRole(user.role)) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        if (token.role && isUserRole(token.role)) {
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
};
// Create the handler with proper typing
const handler = NextAuth(authOptions);
// Export the handler with only the allowed HTTP methods
export { handler as GET, handler as POST };
