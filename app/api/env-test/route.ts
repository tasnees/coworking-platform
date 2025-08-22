import { NextResponse } from 'next/server';

// For static exports, we'll create a simplified version that can work client-side
export const dynamic = 'force-static';

export async function GET() {
  // In a static export, we can't access process.env on the server
  // So we'll only return basic information that doesn't require environment variables
  // In a static export, we can only expose public environment variables
  const env = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    // Only include public environment variables
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not set',
  };

  // Simplified headers for static export
  const headers = {
    'Content-Type': 'application/json',
  };

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    env,
    headers,
    message: 'Environment test endpoint',
  }, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// For static exports, we don't need the OPTIONS handler
// as CORS is handled by the hosting platform
