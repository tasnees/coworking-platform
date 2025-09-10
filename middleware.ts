import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWT } from 'next-auth/jwt';
import { getDashboardPath } from '@/lib/utils/routes';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
    };
  }
  interface User {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
  }
}

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

const middleware = withAuth(
  function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;
    const token = (request as any).nextauth?.token as (JWT & { role?: string }) | null;
    const role = (token?.role?.toLowerCase() as UserRole) || 'member';
    const callbackUrl = searchParams.get('callbackUrl');

    // Skip middleware for public paths
    if (publicPaths.some(path => pathname.startsWith(path))) {
      // If user is already logged in and tries to access login page, redirect to dashboard
      if (pathname.startsWith('/auth/login') && token) {
        // If we have a valid callback URL that's not an auth URL, use it
        if (callbackUrl && !callbackUrl.startsWith('/auth')) {
          try {
            const decodedUrl = decodeURIComponent(callbackUrl);
            const cleanUrl = new URL(decodedUrl, request.url);
            // Only allow redirects to same origin for security
            if (cleanUrl.origin === request.nextUrl.origin) {
              return NextResponse.redirect(cleanUrl);
            }
          } catch (e) {
            console.error('Error processing callback URL:', e);
          }
        }
        // Default to dashboard if no valid callback URL
        const dashboardPath = getDashboardPath(role);
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
      return NextResponse.next();
    }

    // Handle API routes
    if (pathname.startsWith('/api/')) {
      // Skip authentication for public API routes
      if (publicApiRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
      }

      // Require authentication for other API routes
      if (!token) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      // Handle staff API routes
      if (pathname.startsWith('/api/staff') && role !== 'admin' && role !== 'staff') {
        return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
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
      
      // Handle root dashboard path
      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        const dashboardPath = getDashboardPath(role);
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
      
      // Allow access to profile for all authenticated users
      if (pathname.startsWith('/dashboard/profile')) {
        return NextResponse.next();
      }
      
      // Check if user has access to the requested dashboard
      const dashboardBase = pathname.split('/')[2]; // Get 'member', 'admin', etc.
      
      // If user tries to access a dashboard that's not for their role, redirect to their dashboard
      if (dashboardBase && dashboardBase !== role) {
        const dashboardPath = getDashboardPath(role);
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
      
      return NextResponse.next();
    }

    // Handle legacy profile path
    if ((pathname === '/profile' || pathname === '/profile/') && token) {
      return NextResponse.redirect(new URL('/dashboard/profile', request.url));
    }

    // For all other authenticated routes, redirect to dashboard
    if (token) {
      const dashboardPath = getDashboardPath(role);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // For all other routes, continue with the request
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // We handle all auth logic in the main function
    },
  }
);

export default middleware;

// These should be in your auth options, not in the middleware
// Move these to your auth-options.ts file if you need them
/*
async function jwtCallback({ token, user }: { token: JWT; user?: any }) {
  // Initial sign in
  if (user) {
    token.role = user.role;
    token.id = user.id;
  }
  return token;
}

async function sessionCallback({ session, token }: { session: any; token: JWT }) {
  // Add role and ID to the session
  if (session.user) {
    session.user.role = token.role as UserRole;
    session.user.id = token.id as string;
  }
  return session;
}
*/

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
