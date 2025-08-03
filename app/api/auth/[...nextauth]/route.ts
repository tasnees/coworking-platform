import NextAuth from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";
import { AuthOptions } from "next-auth";
import { isUserRole, UserRole } from "@/types/next-auth";

// Extend the Profile type to include our custom claim
declare module "next-auth/providers/auth0" {
  interface Profile {
    'https://coworking-platform/roles'?: string[];
  }
}

export const authOptions: AuthOptions = {
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
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.nickname || '',
          email: profile.email || '',
          image: profile.picture,
          role: profile['https://coworking-platform/roles']?.[0] || 'member',
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.role) {
        token.role = isUserRole(user.role) ? user.role : 'member';
      } else {
        token.role = 'member';
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token.role) {
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
