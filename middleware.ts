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
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/error',
  '/api/auth/register',
  '/api/auth/session',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
];

// List of API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/register',
  '/api/auth/session',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
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

      // Get the base dashboard path for the user's role
      let dashboardPath: string;
      switch (role) {
        case 'admin':
          dashboardPath = '/dashboard/admin';
          break;
        case 'staff':
          dashboardPath = '/dashboard/staff';
          break;
        case 'member':
        default:
          dashboardPath = '/dashboard/member';
      }

      // If user is trying to access a different dashboard than their role allows
      if (!pathname.startsWith(dashboardPath)) {
        // Check if they have permission to access the requested path
        if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
        if (pathname.startsWith('/dashboard/staff') && !['admin', 'staff'].includes(role)) {
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      }

      // Allow access to the requested path
      return NextResponse.next();
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
