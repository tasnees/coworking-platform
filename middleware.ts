import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWT } from 'next-auth/jwt';
import { getDashboardPath } from '@/lib/utils/routes';

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
  function middleware(request) {
    const { pathname, searchParams } = request.nextUrl;
    const token = request.nextauth?.token as (JWT & { role: UserRole }) | undefined;
    const role = token?.role as UserRole | undefined;
    const callbackUrl = searchParams.get('callbackUrl');

    // Skip middleware for public paths
    if (publicPaths.some(path => pathname.startsWith(path))) {
      // If user is already logged in and tries to access login page, redirect to appropriate dashboard
      if (pathname.startsWith('/auth/login') && token) {
        // Get and clean the callback URL
        const callbackUrl = searchParams.get('callbackUrl');
        
        // If callbackUrl is already set to a dashboard path, prevent redirect loop
        if (callbackUrl && (callbackUrl.startsWith('/dashboard') || callbackUrl.startsWith('/auth'))) {
          return NextResponse.next();
        }
        
        try {
          // If no callback URL, redirect to dashboard
          if (!callbackUrl) {
            const dashboardPath = getDashboardPath(role || 'member');
            return NextResponse.redirect(new URL(dashboardPath, request.url));
          }
          
          // Decode the URL to handle any encoded characters
          let decodedUrl = decodeURIComponent(callbackUrl);
          
          // If the URL is still encoded, decode it again
          while (decodedUrl !== decodeURIComponent(decodedUrl)) {
            decodedUrl = decodeURIComponent(decodedUrl);
          }
          
          // Parse the decoded URL
          const cleanUrl = new URL(decodedUrl, request.url);
          
          // Normalize the pathname
          cleanUrl.pathname = cleanUrl.pathname.replace(/\/+$/, '');
          
          // Prevent redirect loops by checking if we're being redirected to an auth page
          if (cleanUrl.pathname.startsWith('/auth/')) {
            const dashboardPath = getDashboardPath(role || 'member');
            return NextResponse.redirect(new URL(dashboardPath, request.url));
          }
          
          // Ensure the URL is within our domain and not a loop
          if (cleanUrl.origin === new URL(request.url).origin) {
            return NextResponse.redirect(cleanUrl.toString());
          }
          
          // Fallback to dashboard if URL is not valid or not within our domain
          const dashboardPath = getDashboardPath(role || 'member');
          return NextResponse.redirect(new URL(dashboardPath, request.url));
          
        } catch (error) {
          console.error('Error processing callback URL:', error);
          // If there's an error with the callback URL, redirect to the default dashboard
          const dashboardPath = getDashboardPath(role || 'member');
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      }
      return NextResponse.next();
    }

    // Handle API routes
    if (pathname.startsWith('/api')) {
      // Allow public API routes
      if (publicApiRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
      }
      
      // Handle API authentication
      if (!token) {
        return new NextResponse(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
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
        
        // Prevent redirect loops by checking if we're already being redirected
        if (callbackUrl && callbackUrl.startsWith('/auth')) {
          return NextResponse.next();
        }
        
        // Only set callbackUrl if we're not already on a login page
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // If user is authenticated, verify they have access to the requested dashboard
      if (token.role) {
        const userRole = token.role.toLowerCase();
        const rolePath = pathname.split('/')[2]; // Get the role from the URL (e.g., 'member' from '/dashboard/member')
        
        // If the user is trying to access a dashboard that doesn't match their role, redirect them
        if (rolePath && rolePath !== userRole && ['admin', 'staff', 'member'].includes(rolePath)) {
          const dashboardPath = getDashboardPath(userRole as UserRole);
          return NextResponse.redirect(new URL(dashboardPath, request.url));
        }
      }

      // Allow access to profile for all authenticated users
      if (pathname.startsWith('/dashboard/profile')) {
        return NextResponse.next();
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

      // Handle root dashboard path
      if (pathname === '/dashboard' || pathname === '/dashboard/') {
        // Default to member dashboard if role is not set
        const defaultDashboard = role ? dashboardPath : '/dashboard/member';
        return NextResponse.redirect(new URL(defaultDashboard, request.url));
      }

      // Handle legacy profile path
      if (pathname === '/profile' || pathname === '/profile/') {
        return NextResponse.redirect(new URL('/dashboard/profile', request.url));
      }

      // If user is trying to access a different dashboard than their role allows
      if (!pathname.startsWith(dashboardPath)) {
        // Default to member dashboard if role is not set
        const targetPath = dashboardPath || '/dashboard/member';
        
        // Check if they have permission to access the requested path
        if (pathname.startsWith('/dashboard/admin')) {
          if (role !== 'admin') {
            return NextResponse.redirect(new URL(targetPath, request.url));
          }
        } else if (pathname.startsWith('/dashboard/staff')) {
          if (role !== 'admin' && role !== 'staff') {
            return NextResponse.redirect(new URL(targetPath, request.url));
          }
        }
      }

      // Allow access to the requested path
      return NextResponse.next();
    }

    // Handle staff API routes
    if (pathname.startsWith('/api/staff') && role !== 'admin' && role !== 'staff') {
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
      authorized({ token, req }) {
        const pathname = req.nextUrl?.pathname || '';
        
        // Always allow public paths
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true;
        }
        
        // Require authentication for protected routes
        return !!token;
      }
    }
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
