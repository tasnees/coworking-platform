import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/lib/auth-types';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes and allowed roles
  const protectedRoutes = [
    { path: '/dashboard/member', roles: ['member', 'staff', 'admin'] },
    { path: '/dashboard/staff', roles: ['staff', 'admin'] },
    { path: '/dashboard/admin', roles: ['admin'] },
  ];

  // Check if the current path is protected
  const matchedRoute = protectedRoutes.find(route => pathname.startsWith(route.path));
  
  if (matchedRoute) {
    // Get the session token
    const token = await getToken({ req: request });
    
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has the required role
    const userRole = token.role as UserRole;
    if (!matchedRoute.roles.includes(userRole)) {
      // User doesn't have permission, redirect to unauthorized page or home
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes should be processed by this middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
