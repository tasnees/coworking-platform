import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWT } from 'next-auth/jwt';
import { DefaultSession } from 'next-auth';

// Extend NextAuth types to include our custom role
declare module 'next-auth' {
  interface Session {
    user: {
      role?: string;
    } & DefaultSession['user'];
  }
  
  interface User {
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
  }
}

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth?.token;
    const role = token?.role || '';

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

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/staff/:path*',
  ],
};
