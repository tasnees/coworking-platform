// app/api/test-env/route.ts
import { NextResponse } from 'next/server';

// For static exports, we'll provide a basic environment test
// without database connectivity checks
// Static behavior for production, dynamic in development
export const dynamic = process.env.NODE_ENV === "production" ? "force-static" : "auto";

// Enable dynamic parameters
export const dynamicParams = true;

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  // In static export mode, we can only expose non-sensitive environment variables
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '❌ Not set',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Not set',
    // Note: Not exposing sensitive variables like MONGODB_URI, NEXTAUTH_SECRET, etc.
  };

  return NextResponse.json(
    {
      status: 'static_export',
      message: 'Environment test in static export mode',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      environmentVariables: envVars,
      mongoDB: {
        status: 'static_export',
        message: 'Database connectivity checks are disabled in static export mode'
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
