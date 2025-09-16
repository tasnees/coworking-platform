import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: [
    '/',
    '/home',
    '/api/webhook',
    '/api/trpc(.*)',
    '/auth/sign-in(.*)',
    '/auth/sign-up(.*)',
    '/auth/forgot-password(.*)',
    '/auth/reset-password(.*)',
  ],
  ignoredRoutes: [
    '/api/webhook',
    '/api/trpc(.*)',
  ],
  afterAuth(auth, req) {
    const { userId, sessionClaims } = auth;
    const { pathname } = req.nextUrl;

    // If the user is not signed in and the route is private, redirect to sign-in
    if (!userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/auth/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // If the user is signed in and the route is protected, let them view
    if (userId && !auth.isPublicRoute) {
      return NextResponse.next();
    }

    // Allow users visiting public routes to access them
    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    '/((?!.*\..*|_next).*)', // Don't run middleware on static files
    '/',
    '/(api|trpc)(.*)',
  ],
};
