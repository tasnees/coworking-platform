import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ['/dashboard']
  const authRoutes = ['/auth/login', '/auth/signup']

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if it's an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && token) {
    // Redirect based on user role
    const role = token.role as string
    let redirectPath = '/dashboard'
    
    switch (role) {
      case 'admin':
        redirectPath = '/dashboard/admin'
        break
      case 'staff':
        redirectPath = '/dashboard/staff'
        break
      case 'member':
        redirectPath = '/dashboard/member'
        break
    }
    
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  // Role-based access control
  if (pathname.startsWith('/dashboard/admin') && token?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.startsWith('/dashboard/staff') && !['admin', 'staff'].includes(token?.role as string)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
  ]
}
