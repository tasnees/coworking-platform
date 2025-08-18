import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWT } from 'next-auth/jwt';

type UserRole = 'admin' | 'staff' | 'member';

// List of public paths that don't require authentication
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/error',
  '/api/auth/register',
  '/api/auth/session',
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
];

// List of API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/register',
  '/api/auth/session',
  '/api/health',
];

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth?.token as (JWT & { role: UserRole }) | undefined;
    const role = token?.role || 'guest';

    // Skip middleware for public paths
    if (publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Handle API routes
    if (pathname.startsWith('/api')) {
      // Allow public API routes
      if (publicApiRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
      }

      // Protect admin API routes
      if (pathname.startsWith('/api/admin') && role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      return NextResponse.next();
    }

    // Handle dashboard routes
    if (pathname.startsWith('/dashboard')) {
      // Redirect to login if not authenticated
      if (!token) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Admin routes
      if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Staff routes (admin can also access)
      if (pathname.startsWith('/dashboard/staff') && !['admin', 'staff'].includes(role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Member routes (all authenticated users can access)
      if (pathname.startsWith('/dashboard/member')) {
        return NextResponse.next();
      }
    }

    // Handle staff API routes
    if (pathname.startsWith('/api/staff') && !['admin', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // For all other routes, continue with the request
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // This is intentionally kept simple as we handle auth in the middleware
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
