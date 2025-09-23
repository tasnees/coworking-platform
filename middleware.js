import { withAuth } from "next-auth/middleware"
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

    // If user is not authenticated and trying to access protected route
    if (!isAuth && !isAuthPage && req.nextUrl.pathname.startsWith('/dashboard')) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (isAuth && isAuthPage) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes that don't require authentication
        if (pathname.startsWith('/auth') || pathname === '/' || pathname.startsWith('/api/auth')) {
          return true;
        }

        // Protected routes require authentication
        if (pathname.startsWith('/dashboard')) {
          return !!token;
        }

        return true;
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!.*\..*|_next).*)', // Don't run middleware on static files
    '/',
    '/(api|trpc)(.*)',
  ],
};
