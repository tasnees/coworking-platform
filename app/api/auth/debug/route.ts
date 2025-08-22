import { NextResponse } from "next/server";

// For static exports, we'll provide a basic auth debug endpoint
// without server-side session checks
export const dynamic = 'force-static';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  // In static export mode, we can't use getServerSession
  return NextResponse.json(
    {
      status: 'static_export',
      message: 'Auth debug is limited in static export mode',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      // Only expose non-sensitive environment variables
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://coworking-platform.onrender.com',
        // Don't expose sensitive variables in static exports
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? '***' + process.env.AUTH0_CLIENT_ID.slice(-4) : undefined,
      },
      // Note: Session data is not available in static exports
      session: {
        available: false,
        message: 'Session data is not available in static export mode'
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    }
  );
}
