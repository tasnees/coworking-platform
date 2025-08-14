import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWT } from 'next-auth/jwt';

type UserRole = 'admin' | 'staff' | 'member';

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth?.token as (JWT & { role: UserRole }) | undefined;
    const role = token?.role || 'guest';

    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/auth/login',
      '/auth/register',
      '/auth/error',
      '/api/auth/register',
    ];

    // Redirect to login for protected routes if not authenticated
    if (!token && !publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
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
    if (pathname.startsWith('/dashboard/member') && !token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // API routes protection
    if (pathname.startsWith('/api/admin') && role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (pathname.startsWith('/api/staff') && !['admin', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Public routes don't require authentication
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
     * - public folder
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
