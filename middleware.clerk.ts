import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth();
  
  // If the user is signed in and the current path is /, redirect to /dashboard
  if (userId && req.nextUrl.pathname === '/') {
    const dashboard = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboard);
  }

  // Handle users who aren't authenticated
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/auth/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect signed in users to organization selection page if they are not active in an organization
  if (userId && !orgId && req.nextUrl.pathname !== '/org-selection') {
    const orgSelection = new URL('/org-selection', req.url);
    return NextResponse.redirect(orgSelection);
  }

  return NextResponse.next();
});

// Configure which routes are public
export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)', // Match all routes except static files and _next
    '/',
    '/(api|trpc)(.*)',
  ],
};
